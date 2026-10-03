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
        return {
            "id": url.rstrip("/").split("/")[-1] or raw.get("id"),
            "name": raw.get("name", ""),
            "image": image,
            "venue": raw.get("venue") or raw.get("venueName") or "Venue to be announced",
            "city": raw.get("venueCityName"),
            "date": date_label,
            "dateLabel": date_label,
            "time": raw.get("localTime") or "Time TBA",
            "price": (raw.get("priceRanges") or [{}])[0].get("min", 0) if raw.get("priceRanges") else 0,
            "category": _category_from_name(raw.get("name", ""), raw.get("segment", "")),
            "ticketUrl": url,
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
        "city": (venue.get("city", {}) or {}).get("name"),
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

    def __init__(self, client: TicketmasterClient, poll_interval: float = 5.0,
                 page_size: int = 20, country_code: str = "US",
                 keyword: str = "", on_event: Optional[Callable] = None,
                 on_status: Optional[Callable] = None):
        self.client = client
        self.poll_interval = poll_interval
        self.page_size = page_size
        self.country_code = country_code
        self.keyword = keyword
        self.on_event = on_event or self._default_render
        self.on_status = on_status
        self._seen: Dict[str, Dict[str, Any]] = {}
        self._etags: Dict[int, str] = {}
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

    def _sync_page(self, page: int) -> List[str]:
        """Sync one page of results; emit new/update deltas, return seen ids."""
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
                # Transient network failure (DNS hiccup, connection reset by a
                # blocked upstream, etc.) must NOT kill the poll thread. Log,
                # back off briefly, and retry the same page so a momentary DNS
                # blip doesn't drop an entire page of live events.
                attempts += 1
                self._log(f"search request error page={page} attempt={attempts}: {exc}")
                if attempts < 3:
                    self._stop.wait(3.0 * attempts)
        else:
            return []

        if isinstance(payload, dict) and payload.get("error"):
            self._log(f"search error page={page}: {payload['error']}")
            return []
        if isinstance(payload, dict) and payload.get("status") == "not_modified":
            # Server confirmed the page is unchanged -- cheap real-time cycle.
            return []

        # Cache the ETag/version for the next If-None-Match probe when the
        # server exposes one. The SSR payload carries a buildId as the version.
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
        return page_ids

    def _poll_once(self, pages: int):
        """Sync every page, emitting per-page new/update deltas as they arrive;
        events from successfully-fetched pages are retained even if a later
        page fails a transient DNS blip. At the end, emit 'gone' for any
        previously-seen event not present in this poll cycle."""
        cycle_ids = set()
        for page in range(pages):
            if self._stop.is_set():
                return
            cycle_ids.update(self._sync_page(page))
        with self._lock:
            gone = [eid for eid in list(self._seen.keys()) if eid not in cycle_ids]
            for eid in gone:
                self._emit(self._seen.pop(eid), "gone")

    def _emit(self, event: Dict[str, Any], kind: str):
        try:
            self.on_event(event, kind)
        except Exception as exc:  # render failures must not kill the loop
            self._log(f"render error: {exc}")

    # ------------------------------------------------------------------ #
    # Public control
    # ------------------------------------------------------------------ #
    def start(self, pages: int = 1, loop: bool = True):
        self._log(f"tracking live events (keyword={self.keyword!r}, "
                  f"country={self.country_code}, pages={pages})")
        while not self._stop.is_set():
            self._poll_once(pages)
            if not loop:
                break
            self._stop.wait(self.poll_interval)
        self._log("tracker stopped")

    def stop(self):
        self._stop.set()

    def snapshot(self) -> List[Dict[str, Any]]:
        with self._lock:
            return [
                {k: v for k, v in event.items() if not k.startswith("_")}
                for event in self._seen.values()
            ]


def stream_events(client: TicketmasterClient,
                  interval: float = 5.0,
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
    tracker = EventTracker(client, poll_interval=float(os.getenv("TM_POLL_INTERVAL", "5")))
    interval = float(os.getenv("TM_POLL_INTERVAL", "5"))
    pages = int(os.getenv("TM_TRACK_PAGES", "1"))
    try:
        tracker.start(pages=pages)
    except KeyboardInterrupt:
        tracker.stop()
        print(f"\ntracked {len(tracker.snapshot())} unique events")
    return 0


if __name__ == "__main__":
    sys.exit(main())
