"""Ticketmaster website API client (spoofed browser replay with session cookies).

Mirror of the Arena-club ``ArenaClubClient`` pattern: harvest a real browser's
session cookies (``cf_clearance`` + ``SID``/``BID`` visitor cookies) and replay
them with spoofed browser headers against the official website -- bypassing
Cloudflare / Akamai bot protection.

Real-time data source strategy (see constants.py):
  * Clean network/IP -> the website home page is server-rendered with a
    ``<script id="__NEXT_DATA__">`` blob containing the live event listing.
    A browser-header request carrying the session cookies is enough; no
    ``cf_clearance`` is issued because no challenge runs.
  * Flagged IP -> Cloudflare interstitials and only issues ``cf_clearance``
    after the JS challenge is solved; Selenium (extract_cookies.py) harvests it.

Either way the client speaks to the official ticketmaster.com with a browser
signature, exactly like Arena-club replaying ``sAccessToken`` against Arcade.
"""

import os
import re
import json
import requests
from typing import Optional

try:
    from .constants import (
        HOMEPAGE_URL, SEARCH_URL, EVENT_URL, INVENTORY_URL, SUGGEST_URL,
        DEFAULT_USER_AGENT, DEFAULT_SEC_CH_UA, DEFAULT_SEC_CH_UA_PLATFORM,
        DISCOVERY_EVENTS_URL, DISCOVERY_API_KEY_ENV, DISCOVERY_WINDOW_DAYS,
        DISCOVERY_MAX_SIZE,
    )
except ImportError:
    from constants import (
        HOMEPAGE_URL, SEARCH_URL, EVENT_URL, INVENTORY_URL, SUGGEST_URL,
        DEFAULT_USER_AGENT, DEFAULT_SEC_CH_UA, DEFAULT_SEC_CH_UA_PLATFORM,
        DISCOVERY_EVENTS_URL, DISCOVERY_API_KEY_ENV, DISCOVERY_WINDOW_DAYS,
        DISCOVERY_MAX_SIZE,
    )

_NEXT_DATA_RE = re.compile(r'<script id="__NEXT_DATA__"[^>]*>(.*?)</script>', re.S)


class TicketmasterClient:
    """Replay a real-browser session against Ticketmaster's website."""

    def __init__(self, cf_clearance: str = None, extra_cookies: Optional[dict] = None,
                 user_agent: str = DEFAULT_USER_AGENT,
                 api_key: Optional[str] = None):
        self.cf_clearance = cf_clearance
        self.extra_cookies = extra_cookies or {}
        self.user_agent = user_agent
        self.api_key = api_key or os.getenv("TM_TICKETMASTER_API_KEY")
        self._session = requests.Session()
        self._session.headers.update(self._get_headers())
        self._session.cookies.update(self._get_cookies())

    # ------------------------------------------------------------------ #
    # Header / cookie construction (spoofed browser signature)
    # ------------------------------------------------------------------ #
    def _get_headers(self, referer: str = "https://www.ticketmaster.com/"):
        headers = {
            "User-Agent": self.user_agent,
            "Accept": "*/*",
            "Accept-Language": "en-US,en;q=0.9",
            "sec-ch-ua": DEFAULT_SEC_CH_UA,
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": f'"{DEFAULT_SEC_CH_UA_PLATFORM}"',
            "Referer": referer,
        }
        if self.api_key:
            headers["X-TM-Api-Key"] = self.api_key
        return headers

    def _get_cookies(self):
        cookies = {}
        if self.cf_clearance:
            cookies["cf_clearance"] = self.cf_clearance
        cookies.update(self.extra_cookies)
        return cookies

    def _request(self, method, url, params=None, json_body=None, etag=None):
        resp = self._session.request(method, url, params=params, json=json_body,
                                     timeout=30, allow_redirects=True)
        # 304 Not Modified -> caller can reuse its cached copy (real-time diff).
        if resp.status_code == 304:
            return {"status": "not_modified", "etag": resp.headers.get("ETag")}
        if resp.status_code in (401, 403):
            return {"error": f"blocked_by_protection ({resp.status_code})"}
        if not resp.ok:
            return {"error": f"http_{resp.status_code}"}
        try:
            return resp.json()
        except ValueError:
            return {"raw": resp.text, "etag": resp.headers.get("ETag")}

    # ------------------------------------------------------------------ #
    # Real-time source: server-rendered __NEXT_DATA__ on the homepage
    # ------------------------------------------------------------------ #
    def _get_next_data(self, url: str = HOMEPAGE_URL) -> Optional[dict]:
        """Fetch a page that carries a __NEXT_DATA__ blob and parse it.

        The homepage establishes/reuses the visitor session (SID/BID are set by
        the site and held by the requests.Session) and contains the live event
        listing the SPA hydrates from.
        """
        resp = self._session.get(url, timeout=30, allow_redirects=True)
        if resp.status_code in (401, 403):
            return {"error": f"blocked_by_protection ({resp.status_code})"}
        if not resp.ok:
            return {"error": f"http_{resp.status_code}"}
        m = _NEXT_DATA_RE.search(resp.text)
        if not m:
            return {"error": "no_next_data"}
        try:
            return json.loads(m.group(1))
        except ValueError:
            return {"error": "invalid_next_data"}

    def search_events(self, keyword: str = "", country_code: str = "US",
                      page: int = 0, size: int = 20,
                      etag: Optional[str] = None,
                      start_date_time: Optional[str] = None,
                      end_date_time: Optional[str] = None,
                      city: Optional[str] = None) -> Optional[dict]:
        """Return the real-time event listing.

        Primary source is the official public Discovery API when an API key is
        configured (IP-agnostic, paginatable, supports a date window extending
        to next year). Falls back to the homepage SSR ``__NEXT_DATA__`` payload
        on a clean network when no key is present.

        Returns ``{"_embedded": {"events": [...]}}`` plus an ``etag`` field for
        not-modified checks.
        """
        if self.api_key:
            return self._search_public(keyword, country_code, page, size, start_date_time, end_date_time, city)
        data = self._get_next_data()
        if isinstance(data, dict) and data.get("error"):
            return data
        raw_events = _extract_nextdata_events(data)
        # Client-side filter for the live feed.
        if keyword.strip():
            kw = keyword.lower()
            raw_events = [e for e in raw_events
                          if kw in str(e.get("name", "")).lower()
                          or kw in str(e.get("venue", "")).lower()]
        raw_events = raw_events[:size]
        return {
            "_embedded": {"events": raw_events},
            "etag": _nextdata_version(data),
        }

    def _search_public(self, keyword: str, country_code: str, page: int,
                       size: int, start_date_time: Optional[str] = None,
                       end_date_time: Optional[str] = None,
                       city: Optional[str] = None) -> Optional[dict]:
        """Query the public Discovery API (key-based, IP-agnostic).

        ``size`` is clamped to the API's 200-record maximum; callers page via
        the ``page`` argument to harvest more (e.g. 150/page over 2 pages).
        A start/end date window filters to upcoming events through next year.
        """
        from datetime import datetime, timezone, timedelta
        now = datetime.now(timezone.utc)
        params = {
            "apikey": self.api_key,
            "countryCode": country_code,
            "size": str(min(int(size), DISCOVERY_MAX_SIZE)),
            "page": str(int(page)),
            "startDateTime": start_date_time or now.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "endDateTime": end_date_time or (now + timedelta(days=DISCOVERY_WINDOW_DAYS)).strftime("%Y-%m-%dT%H:%M:%SZ"),
        }
        if keyword.strip():
            params["keyword"] = keyword.strip()
        if city and city.strip():
            params["city"] = city.strip()
        result = self._request("GET", DISCOVERY_EVENTS_URL, params=params)
        if isinstance(result, dict) and result.get("_embedded"):
            result["etag"] = f"public:{page}:{size}"
        return result

    # ------------------------------------------------------------------ #
    # Real-time event detail / suggestions
    # ------------------------------------------------------------------ #
    def get_event(self, event_id: str, etag: Optional[str] = None) -> Optional[dict]:
        url = EVENT_URL.format(event_id=event_id)
        return self._request("GET", url)

    def suggest(self, query: str, country_code: str = "US") -> Optional[dict]:
        params = {"q": query, "countryCode": country_code}
        return self._request("GET", SUGGEST_URL, params=params)

    def inventory_status(self, event_ids, api_key: Optional[str] = None) -> Optional[dict]:
        """Near real-time inventory availability for universal event ids."""
        key = api_key or self.api_key
        params = {"events": ",".join(event_ids), "apikey": key} if key \
            else {"events": ",".join(event_ids)}
        return self._request("GET", INVENTORY_URL, params=params)


def _extract_nextdata_events(data: dict) -> list:
    """Walk a __NEXT_DATA__ blob and collect event-like nodes."""
    found = []

    def is_event(obj):
        if not isinstance(obj, dict):
            return False
        url = obj.get("url") or ""
        return (isinstance(obj.get("name"), str) and "/event/" in str(url)
                and ("imageUrl" in obj or "venueCityName" in obj))

    def walk(obj, depth=0):
        if depth > 12:
            return
        if isinstance(obj, dict):
            if is_event(obj):
                found.append(obj)
            for v in obj.values():
                walk(v, depth + 1)
        elif isinstance(obj, list):
            for v in obj:
                walk(v, depth + 1)

    walk(data)
    # De-duplicate by url (the same event can appear in multiple slots).
    seen = set()
    unique = []
    for e in found:
        u = e.get("url")
        if u in seen:
            continue
        seen.add(u)
        unique.append(e)
    return unique


def _nextdata_version(data: dict) -> Optional[str]:
    """A coarse ETag-equivalent: the buildId + last update timestamp if present."""
    if isinstance(data, dict):
        return data.get("buildId") or data.get("etag")


def load_cookies(path: str = "backend/cookies.json") -> dict:
    """Load a previously harvested cookie jar from disk."""
    here = os.path.dirname(os.path.abspath(__file__))
    full = os.path.join(here, "cookies.json") if not os.path.isabs(path) else path
    with open(full) as fh:
        return json.load(fh)


def from_cookies(cookies: dict, **kwargs) -> "TicketmasterClient":
    """Build a client from a harvested cookie dict (cf_clearance + extras)."""
    cf = cookies.get("cf_clearance")
    extra = {k: v for k, v in cookies.items() if k != "cf_clearance"}
    return TicketmasterClient(cf_clearance=cf, extra_cookies=extra, **kwargs)


if __name__ == "__main__":
    client = TicketmasterClient()  # clean network: no cookies.json required
    result = client.search_events(size=5)
    print(json.dumps(result, indent=2, default=str)[:2000])
