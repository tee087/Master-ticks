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
from collections import OrderedDict
from copy import deepcopy
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
import threading
import time
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
        self._rate_limit_lock = threading.Lock()
        self._next_request_at = 0.0
        self._request_interval = 0.22  # Keep this client below Ticketmaster's 5 requests/second limit.
        self._blocked_until = 0.0
        self._search_cache_lock = threading.Lock()
        self._search_cache = OrderedDict()
        self._search_cache_ttl = 300.0
        self._search_cache_limit = 512
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

    @staticmethod
    def _rate_limit_delay(headers) -> float:
        retry_after = headers.get("Retry-After")
        delay = 0.0
        if retry_after:
            try:
                delay = max(delay, float(retry_after))
            except (TypeError, ValueError):
                try:
                    retry_at = parsedate_to_datetime(str(retry_after))
                    if retry_at.tzinfo is None:
                        retry_at = retry_at.replace(tzinfo=timezone.utc)
                    delay = max(delay, (retry_at - datetime.now(timezone.utc)).total_seconds())
                except (TypeError, ValueError, OverflowError):
                    pass
        reset_at = headers.get("Rate-Limit-Reset")
        try:
            reset_at = float(reset_at)
            if reset_at > 1_000_000_000_000:
                reset_at /= 1000.0
            delay = max(delay, reset_at - time.time())
        except (TypeError, ValueError):
            pass
        return max(60.0, delay)

    def _pace_request(self):
        # Pace requests and stop sending calls while Ticketmaster's quota is blocked.
        with self._rate_limit_lock:
            now = time.monotonic()
            if self._blocked_until > now:
                return self._blocked_until - now
            wait = self._next_request_at - now
            if wait > 0:
                time.sleep(wait)
            self._next_request_at = time.monotonic() + self._request_interval
        return 0.0

    def _note_rate_limit(self, headers):
        delay = self._rate_limit_delay(headers)
        with self._rate_limit_lock:
            self._blocked_until = max(self._blocked_until, time.monotonic() + delay)
        return delay
    def _request(self, method, url, params=None, json_body=None, etag=None):
        blocked_for = self._pace_request()
        if blocked_for > 0:
            return {"error": "http_429", "retryAfter": blocked_for}
        headers = {"If-None-Match": etag} if etag else None
        resp = self._session.request(
            method, url, params=params, json=json_body, headers=headers,
            timeout=30, allow_redirects=True,
        )
        if resp.status_code == 304:
            return {"status": "not_modified", "etag": resp.headers.get("ETag")}
        if resp.status_code in (401, 403):
            return {"error": f"blocked_by_protection ({resp.status_code})"}
        if not resp.ok:
            error = {"error": f"http_{resp.status_code}"}
            if resp.status_code == 429:
                error["retryAfter"] = self._note_rate_limit(resp.headers)
                error["rateLimitReset"] = resp.headers.get("Rate-Limit-Reset")
                error["rateLimitAvailable"] = resp.headers.get("Rate-Limit-Available")
            return error
        try:
            return resp.json()
        except ValueError:
            return {"raw": resp.text, "etag": resp.headers.get("ETag")}
    # ------------------------------------------------------------------ #
    # Real-time source: server-rendered __NEXT_DATA__ on the homepage
    # ------------------------------------------------------------------ #
    def _get_next_data(self, url: str = HOMEPAGE_URL) -> Optional[dict]:
        """Fetch and parse the homepage's server-rendered event payload."""
        blocked_for = self._pace_request()
        if blocked_for > 0:
            return {"error": "http_429", "retryAfter": blocked_for}
        resp = self._session.get(url, timeout=30, allow_redirects=True)
        if resp.status_code in (401, 403):
            return {"error": f"blocked_by_protection ({resp.status_code})"}
        if not resp.ok:
            error = {"error": f"http_{resp.status_code}"}
            if resp.status_code == 429:
                error["retryAfter"] = self._note_rate_limit(resp.headers)
                error["rateLimitReset"] = resp.headers.get("Rate-Limit-Reset")
                error["rateLimitAvailable"] = resp.headers.get("Rate-Limit-Available")
            return error
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
        """Return a cached successful search, or fetch and refresh the result."""
        key = (
            keyword.strip().casefold(), country_code.strip().upper(), int(page),
            min(int(size), DISCOVERY_MAX_SIZE), start_date_time, end_date_time,
            (city or "").strip().casefold(),
        )
        now = time.monotonic()
        stale_result = None
        with self._search_cache_lock:
            cached = self._search_cache.get(key)
            if cached:
                expires_at, cached_result = cached
                self._search_cache.move_to_end(key)
                stale_result = deepcopy(cached_result)
                if expires_at > now:
                    return stale_result

        try:
            if self.api_key:
                result = self._search_public(
                    keyword, country_code, page, size, start_date_time, end_date_time, city
                )
            else:
                data = self._get_next_data()
                if isinstance(data, dict) and data.get("error"):
                    result = data
                else:
                    raw_events = _extract_nextdata_events(data)
                    if keyword.strip():
                        kw = keyword.lower()
                        raw_events = [
                            event for event in raw_events
                            if kw in str(event.get("name", "")).lower()
                            or kw in str(event.get("venue", "")).lower()
                        ]
                    result = {
                        "_embedded": {"events": raw_events[:size]},
                        "etag": _nextdata_version(data),
                    }
        except (requests.exceptions.RequestException, ValueError):
            if stale_result is not None:
                stale_result["_cache_stale"] = True
                return stale_result
            return {"error": "upstream_unavailable"}

        if isinstance(result, dict) and not result.get("error") and result.get("status") != "not_modified":
            with self._search_cache_lock:
                self._search_cache[key] = (time.monotonic() + self._search_cache_ttl, deepcopy(result))
                self._search_cache.move_to_end(key)
                while len(self._search_cache) > self._search_cache_limit:
                    self._search_cache.popitem(last=False)
            return result

        if stale_result is not None:
            stale_result["_cache_stale"] = True
            return stale_result
        return result

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
