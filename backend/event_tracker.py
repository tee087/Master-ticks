"""Real-time Ticketmaster event tracker and renderer.

Consumes ``TicketmasterClient`` to poll the official website's real-time
search/catalog API. Mirrors how Arena-club uses the ``304 / ETag`` path to
avoid re-parsing unchanged responses, and surfaces *new* or *updated* events
as they appear so they can be rendered in real time.

Two render targets are supported:
  * console  -- a human readable, auto-updating event log
  * callbacks -- an ``on_event`` hook invoked per live event (used by the SSE
    server so the React Native app receives a server-sent events stream)
"""

import os
import sys
import re
import time
import json
import hashlib
import threading
import requests
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from typing import Optional, Callable, List, Dict, Any

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ticketmaster_api import TicketmasterClient, load_cookies, from_cookies


def _category_from_name(name: str, segment: str = "") -> str:
    """Infer a display category from an event name / segment (SSR events lack
    the Discovery API's classification hierarchy)."""
    full = f"{segment} {name}".lower()
    if re.search(r'\b(sport|nba|nfl|nhl|mlb|football|basketball|monster jam|rodeo|pbr|tennis|soccer|rangers|jets|giants|bengals|spurs|raiders)\b', full):
        return 'Sports'
    if re.search(r'\b(festival|fair|hondo)\b', full):
        return 'Festivals'
    if re.search(r'\b(hamilton|disney|comedy|theatre|theater|rockettes|wizard of oz|cats|matt rife|kill tony|weird al)\b', full):
        return 'Theater'
    if 'music' in segment or 'concert' in full:
        return 'Concerts'
    return 'Concerts'


def normalize_event(raw: Dict[str, Any]) -> Dict[str, Any]:
    """Flatten an API event record into the shape the tracker / app consumes.

    Handles both the public Discovery API shape (``_embedded``, ``dates``,
    ``priceRanges``) and the SSR ``__NEXT_DATA__`` event shape that
    ``TicketmasterClient.search_events`` now returns.
    """
    if not isinstance(raw, dict):
        return {}

    url = str(raw.get("url") or "")
    is_public = isinstance(raw.get("images"), list) or bool(raw.get("_embedded")) or ("dates" in raw)

    # --- SSR __NEXT_DATA__ event shape (imageUrl / venueCityName / localDate) ---
    if not is_public:
        image = raw.get("imageUrl")
        if not image:
            images = raw.get("images") or []
            image = images[0].get("url") if images else None
        date_label = raw.get("localDate")
        ticket_url = raw.get("ticketUrl") or url
        if ticket_url.startswith("/"):
            ticket_url = "https://www.ticketmaster.com" + ticket_url
        latitude = raw.get("venueLatitude") or raw.get("latitude")
        longitude = raw.get("venueLongitude") or raw.get("longitude")
        venue_location = None
        try:
            if latitude is not None and longitude is not None:
                venue_location = {"latitude": float(latitude), "longitude": float(longitude)}
        except (TypeError, ValueError):
            pass
        city = raw.get("venueCityName") or raw.get("city")
        state_code = raw.get("venueStateCode") or raw.get("stateCode")
        country_code = raw.get("venueCountryCode") or raw.get("countryCode")
        address = raw.get("venueAddress") or raw.get("venueStreet") or ""
        location_text = ", ".join(part for part in (address, city, state_code, country_code) if part)
        return {
            "id": url.rstrip("/").split("/")[-1] or raw.get("id"),
            "name": raw.get("name", ""),
            "image": image,
            "venue": raw.get("venue") or raw.get("venueName") or "Venue to be announced",
            "city": city,
            "stateCode": state_code,
            "countryCode": country_code,
            "postalCode": raw.get("venuePostalCode") or raw.get("postalCode"),
            "venueAddress": address,
            "venueLocationText": location_text,
            "venueLocation": venue_location,
            "seatMapUrl": raw.get("seatMapUrl") or (raw.get("seatmap") or {}).get("staticUrl"),
            "date": date_label,
            "dateLabel": date_label,
            "time": raw.get("localTime") or "Time TBA",
            "price": (raw.get("priceRanges") or [{}])[0].get("min", 0) if raw.get("priceRanges") else 0,
            "category": _category_from_name(raw.get("name", ""), raw.get("segment", "")),
            "ticketUrl": ticket_url,
            "status": raw.get("status"),
        }

    # --- Public Discovery API shape ---
    images = raw.get("images") or []
    image = None
    for ratio in ("16_9", "3_2", "4_3"):
        match = next((i.get("url") for i in images
                      if i.get("ratio") == ratio and i.get("width", 0) >= 1024), None)
        if match:
            image = match
            break
    if not image and images:
        image = images[0].get("url")
    venue = raw.get("_embedded", {}).get("venues", [{}])[0]
    address = venue.get("address", {}).get("line1") or ""
    city = (venue.get("city", {}) or {}).get("name")
    state_code = (venue.get("state", {}) or {}).get("stateCode")
    country_code = (venue.get("country", {}) or {}).get("countryCode")
    postal_code = venue.get("postalCode")
    parts = [address, city, state_code, postal_code, country_code]
    location_text = ", ".join(str(part) for part in parts if part)
    venue_location = venue.get("location") or {}
    try:
        venue_location = {
            "latitude": float(venue_location["latitude"]),
            "longitude": float(venue_location["longitude"]),
        }
    except (KeyError, TypeError, ValueError):
        venue_location = None
    classifications = raw.get("classifications", [{}])
    segment = (classifications[0].get("segment", {}).get("name") or "").lower()
    if "sport" in segment:
        category = "Sports"
    elif "music" in segment:
        category = "Concerts"
    elif "art" in segment or "theatre" in segment or "comedy" in segment:
        category = "Theater"
    elif "festival" in segment or "miscellaneous" in segment:
        category = "Festivals"
    else:
        category = "Concerts"
    price = 0
    rng = (raw.get("priceRanges") or [{}])[0]
    if rng.get("min") is not None:
        price = rng["min"]
    start = raw.get("dates", {}).get("start", {})
    return {
        "id": raw.get("id"),
        "name": raw.get("name", ""),
        "image": image,
        "venue": (venue.get("name") or "Venue to be announced"),
        "city": city,
        "stateCode": state_code,
        "countryCode": country_code,
        "postalCode": postal_code,
        "venueAddress": address,
        "venueLocationText": location_text,
        "venueLocation": venue_location,
        "seatMapUrl": (raw.get("seatmap") or {}).get("staticUrl"),
        "date": start.get("dateTime") or start.get("localDate"),
        "dateLabel": start.get("localDate"),
        "time": start.get("localTime") or "Time TBA",
        "price": price,
        "category": category,
        "ticketUrl": raw.get("url"),
        "status": raw.get("dates", {}).get("status", {}).get("code"),
    }


def _extract_events(payload: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Pull a list of raw event dicts out of either paginated search shapes."""
    if isinstance(payload, dict):
        embedded = payload.get("_embedded") or payload
        if isinstance(embedded, dict):
            events = embedded.get("events") or embedded.get("event") or []
        else:
            events = embedded or []
        if isinstance(events, dict):
            events = events.get("events") or events.get("data") or []
        return events if isinstance(events, list) else []
    if isinstance(payload, list):
        return payload
    return []


class EventTracker:
    """Polls the Ticketmaster website API and emits live event deltas."""

    def __init__(self, client: TicketmasterClient, poll_interval: float = 300.0,
                 page_size: int = 20, country_code: str = "US",
                 keyword: str = "", on_event: Optional[Callable] = None,
                 on_status: Optional[Callable] = None):
        self.client = client
        self.poll_interval = max(300.0, float(poll_interval))
        self.page_size = page_size
        self.country_code = country_code
        self.keyword = keyword
        self.on_event = on_event or self._default_render
        self.on_status = on_status
        self._seen: Dict[str, Dict[str, Any]] = {}
        self._etags: Dict[int, str] = {}
        self._page_ids: Dict[int, List[str]] = {}
        self._last_retry_after = 0.0
        self._has_successful_poll = False
        self._has_successful_page = False
        self._stop = threading.Event()
        self._lock = threading.Lock()

    # ------------------------------------------------------------------ #
    # Rendering
    # ------------------------------------------------------------------ #
    @staticmethod
    def _default_render(event: Dict[str, Any], kind: str):
        tag = {"new": "+", "update": "*", "gone": "-"}.get(kind, "?")
        date = event.get("dateLabel") or (event.get("date") or "")[:10]
        price = f"${event['price']}" if event.get("price") else "TBA"
        name = event.get("name", "")[:42]
        print(f"[{tag}] {date} | {price:>8} | {name}")

    def _log(self, msg: str):
        if self.on_status:
            self.on_status(msg)
        else:
            print(msg)

    # ------------------------------------------------------------------ #
    # Core polling loop
    # ------------------------------------------------------------------ #
    @staticmethod
    def _signature(event: Dict[str, Any]) -> str:
        digest = json.dumps(
            {k: event.get(k) for k in ("name", "venue", "price", "status", "date")},
            sort_keys=True, default=str,
        )
        return hashlib.sha1(digest.encode()).hexdigest()

    @staticmethod
    def _retry_delay_seconds(payload: Dict[str, Any]) -> float:
        retry_after = payload.get("retryAfter")
        if retry_after:
            try:
                return max(0.0, float(retry_after))
            except (TypeError, ValueError):
                try:
                    retry_at = parsedate_to_datetime(str(retry_after))
                    if retry_at.tzinfo is None:
                        retry_at = retry_at.replace(tzinfo=timezone.utc)
                    return max(0.0, (retry_at - datetime.now(timezone.utc)).total_seconds())
                except (TypeError, ValueError, OverflowError):
                    pass
        reset_at = payload.get("rateLimitReset")
        try:
            reset_at = float(reset_at)
            if reset_at > 1_000_000_000_000:
                reset_at /= 1000.0
            return max(0.0, reset_at - time.time())
        except (TypeError, ValueError):
            return 0.0

    def _sync_page(self, page: int) -> Optional[List[str]]:
        """Sync one page; return None when the upstream request failed."""
        etag = self._etags.get(page)
        attempts = 0
        payload = None
        while attempts < 3:
            try:
                payload = self.client.search_events(
                    keyword=self.keyword, country_code=self.country_code,
                    page=page, size=self.page_size, etag=etag,
                )
                break
            except (requests.exceptions.RequestException, ValueError) as exc:
                attempts += 1
                self._log(f"search request error page={page} attempt={attempts}: {exc}")
                if attempts < 3:
                    self._stop.wait(3.0 * attempts)
        else:
            return None

        if isinstance(payload, dict) and payload.get("error"):
            self._log(f"search error page={page}: {payload['error']}")
            self._last_retry_after = max(
                self._last_retry_after, self._retry_delay_seconds(payload)
            )
            return None
        if isinstance(payload, dict) and payload.get("status") == "not_modified":
            with self._lock:
                self._has_successful_page = True
                return list(self._page_ids.get(page, []))

        etag_now = None
        for holder in (payload.get("meta"), payload.get("headers", {}), payload):
            if isinstance(holder, dict):
                etag_now = etag_now or holder.get("etag")

        raw_events = _extract_events(payload)
        page_ids = []
        for raw in raw_events:
            event = normalize_event(raw)
            eid = event.get("id")
            if not eid:
                continue
            page_ids.append(eid)
            sig = self._signature(event)
            with self._lock:
                prev = self._seen.get(eid)
            if prev is None:
                event["_state"] = "new"
                self._emit(event, "new")
                with self._lock:
                    self._seen[eid] = {**event, "_sig": sig}
            elif self._signature(prev) != sig:
                event["_state"] = "updated"
                self._emit(event, "update")
                with self._lock:
                    self._seen[eid] = {**event, "_sig": sig}
        if etag_now:
            with self._lock:
                self._etags[page] = etag_now
        with self._lock:
            self._page_ids[page] = list(page_ids)
            self._has_successful_page = True
        return page_ids

    def _poll_once(self, pages: int) -> bool:
        """Prune missing events only after every requested page succeeds."""
        cycle_ids = set()
        for page in range(pages):
            if self._stop.is_set():
                return False
            page_ids = self._sync_page(page)
            if page_ids is None:
                return False
            cycle_ids.update(page_ids)
        with self._lock:
            gone = [eid for eid in list(self._seen.keys()) if eid not in cycle_ids]
            for eid in gone:
                self._emit(self._seen.pop(eid), "gone")
            self._has_successful_poll = True
        return True

    def _emit(self, event: Dict[str, Any], kind: str):
        try:
            self.on_event(event, kind)
        except Exception as exc:  # render failures must not kill the loop
            self._log(f"render error: {exc}")

    # ------------------------------------------------------------------ #
    # Public control
    # ------------------------------------------------------------------ #
    def start(self, pages: int = 1, loop: bool = True):
        pages = max(1, int(pages))
        self._log(f"tracking live events (keyword={self.keyword!r}, "
                  f"country={self.country_code}, pages={pages})")
        consecutive_failures = 0
        while not self._stop.is_set():
            self._last_retry_after = 0.0
            poll_succeeded = self._poll_once(pages)
            if not loop:
                break
            if poll_succeeded:
                consecutive_failures = 0
                delay = self.poll_interval
            else:
                consecutive_failures += 1
                backoff = min(
                    900.0,
                    max(self.poll_interval, 15.0) * (2 ** min(consecutive_failures - 1, 5)),
                )
                delay = max(backoff, self._last_retry_after)
                self._log(
                    f"poll failed; retaining {len(self.snapshot())} cached events; "
                    f"retrying in {int(delay)}s"
                )
            self._stop.wait(delay)
        self._log("tracker stopped")

    def stop(self):
        self._stop.set()

    def snapshot(self) -> List[Dict[str, Any]]:
        with self._lock:
            return [
                {k: v for k, v in event.items() if not k.startswith("_")}
                for event in self._seen.values()
            ]

    @property
    def has_successful_page(self) -> bool:
        with self._lock:
            return self._has_successful_page

    @property
    def has_successful_poll(self) -> bool:
        with self._lock:
            return self._has_successful_poll

def stream_events(client: TicketmasterClient,
                  interval: float = 300.0,
                  pages: int = 1,
                  on_event: Optional[Callable] = None) -> Callable:
    """Start the tracker in a background thread and return a stop handle."""
    tracker = EventTracker(client, poll_interval=interval, on_event=on_event)
    thread = threading.Thread(target=tracker.start, kwargs={"pages": pages}, daemon=True)
    thread.start()

    def stop():
        tracker.stop()
        thread.join(timeout=interval + 2)
    return stop


def main():
    jar_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "cookies.json")
    if not os.path.exists(jar_path):
        print("No cookies.json found. Run extract_cookies.py first.")
        return 1
    cookies = load_cookies()
    client = from_cookies(cookies)
    tracker = EventTracker(client, poll_interval=max(300.0, float(os.getenv("TM_POLL_INTERVAL", "300"))))
    interval = max(300.0, float(os.getenv("TM_POLL_INTERVAL", "300")))
    pages = int(os.getenv("TM_TRACK_PAGES", "1"))
    try:
        tracker.start(pages=pages)
    except KeyboardInterrupt:
        tracker.stop()
        print(f"\ntracked {len(tracker.snapshot())} unique events")
    return 0


if __name__ == "__main__":
    sys.exit(main())
