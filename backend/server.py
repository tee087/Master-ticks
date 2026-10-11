"""Minimal real-time SSE server over Ticketmaster's cookie-based feed.

Built on the Python standard library so no extra runtime dependency is needed.
The tracker polls the official website API in a background thread and every
live event is broadcast to all connected ``EventSource`` consumers -- the same
"render real-time events" role the Arena-club client plays, here exposed over
HTTP so the React Native app can subscribe.

Endpoints:
  GET /health            -> liveness probe
  GET /events            -> current snapshot (JSON)
  GET /events/stream     -> text/event-stream of live (+/-/update) events
"""

import os
import sys
import json
import threading
import time
from urllib.parse import urlparse, parse_qs
from collections import deque
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
# Load optional backend/.env.local so the Discovery API key can be provided
# without exporting env vars manually (file is gitignored).
_here = os.path.dirname(os.path.abspath(__file__))
if os.path.exists(os.path.join(_here, ".env.local")):
    with open(os.path.join(_here, ".env.local")) as _fh:
        for _line in _fh:
            _line = _line.strip()
            if not _line or _line.startswith("#") or "=" not in _line:
                continue
            _k, _, _v = _line.partition("=")
            os.environ.setdefault(_k.strip(), _v.strip())
from ticketmaster_api import load_cookies, from_cookies, DISCOVERY_API_KEY_ENV
from event_tracker import EventTracker, normalize_event, _extract_events


HOST = os.getenv("TM_HOST", "0.0.0.0")
PORT = int(os.getenv("TM_PORT", "8765"))
POLL_INTERVAL = float(os.getenv("TM_POLL_INTERVAL", "5"))
PAGES = int(os.getenv("TM_TRACK_PAGES", "1"))

_clients = []
_clients_lock = threading.Lock()
_recent = deque(maxlen=200)   # rolling buffer for late-joining SSE clients
_recent_lock = threading.Lock()


def _sse_pack(event_id, data):
    body = json.dumps(data, default=str)
    return f"id: {event_id}\ndata: {body}\n\n".encode()


def broadcast(event, kind):
    payload = {"kind": kind, "event": event}
    ev_id = f"{kind}:{event.get('id', int(time.time() * 1000))}"
    packed = _sse_pack(ev_id, payload)
    with _clients_lock:
        for queue in _clients:
            queue.append(packed)
    with _recent_lock:
        _recent.append((ev_id, packed))


def make_handler(tracker_started):
    class Handler(BaseHTTPRequestHandler):
        def log_message(self, *args):
            pass

        def _send(self, status, body, ctype="application/json"):
            if isinstance(body, (dict, list)):
                body = json.dumps(body, default=str).encode()
            elif isinstance(body, str):
                body = body.encode()
            if not isinstance(body, (bytes, bytearray)):
                body = json.dumps(body, default=str).encode()
            self.send_response(status)
            self.send_header("Content-Type", ctype)
            self.send_header("Content-Length", str(len(body)))
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            self.wfile.write(body)

        def do_GET(self):
            parsed = urlparse(self.path)
            path = parsed.path
            if path == "/health":
                self._send(200, {"status": "ok", "clients": len(_clients)})
            elif path == "/events":
                self._send(200, tracker_started["tracker"].snapshot())
            elif path == "/search":
                params = parse_qs(parsed.query)
                keyword = (params.get("keyword") or [""])[0].strip()
                country_code = (params.get("countryCode") or ["US"])[0].strip() or "US"
                try:
                    page = max(0, int((params.get("page") or [0])[0]))
                except ValueError:
                    page = 0
                try:
                    size = max(1, min(200, int((params.get("size") or [200])[0])))
                except ValueError:
                    size = 200
                city = (params.get("city") or [""])[0].strip()
                country_only = (params.get("countryOnly") or [""])[0].lower() == "true"
                start_date_time = (params.get("startDateTime") or [""])[0].strip() or None
                end_date_time = (params.get("endDateTime") or [""])[0].strip() or None
                if not keyword and not city and not country_only and not start_date_time and not end_date_time:
                    self._send(200, [])
                    return
                try:
                    result = tracker_started["tracker"].client.search_events(
                        keyword=keyword, country_code=country_code, page=page, size=size,
                        start_date_time=start_date_time, end_date_time=end_date_time, city=city,
                    )
                except Exception:
                    self._send(502, {"error": "ticketmaster_search_failed"})
                    return
                if isinstance(result, dict) and result.get("error"):
                    self._send(502, {"error": "ticketmaster_search_failed"})
                    return
                api_page = result.get("page", {}) if isinstance(result, dict) else {}
                self._send(200, {
                    "events": [normalize_event(e) for e in _extract_events(result)],
                    "page": {
                        "number": api_page.get("number", page),
                        "totalPages": api_page.get("totalPages", 1),
                        "totalElements": api_page.get("totalElements"),
                    },
                })
            elif path == "/events/stream":
                self._stream()
            else:
                self._send(404, {"error": "not_found"})

        def _stream(self):
            self.send_response(200)
            self.send_header("Content-Type", "text/event-stream")
            self.send_header("Cache-Control", "no-cache, no-store")
            self.send_header("Connection", "keep-alive")
            self.end_headers()
            queue = deque()
            with _clients_lock:
                _clients.append(queue)
            # Flush the recent buffer so late joiners see history.
            with _recent_lock:
                for _, packed in _recent:
                    self.wfile.write(packed)
            self.wfile.flush()
            try:
                while True:
                    if queue:
                        self.wfile.write(queue.popleft())
                        self.wfile.flush()
                    else:
                        time.sleep(0.25)
            except (BrokenPipeError, ConnectionResetError):
                pass
            finally:
                with _clients_lock:
                    if queue in _clients:
                        _clients.remove(queue)

    return Handler


def start_tracker(cookies):
    api_key = os.environ.get(DISCOVERY_API_KEY_ENV)
    # With a key, harvest up to 300 upcoming events (150/page over 2 pages; the
    # Discovery API caps one request at 200). Without a key, fall back to the
    # single-page homepage SSR listing (clean-network path).
    page_size = int(os.getenv("TM_PAGE_SIZE", "150" if api_key else "20"))
    pages = int(os.getenv("TM_TRACK_PAGES", "2" if api_key else str(PAGES)))
    source = "public Discovery API (key-based, IP-agnostic)" if api_key else "homepage SSR (clean-IP)"
    print(f"Live feed source: {source} | page_size={page_size} pages={pages} "
          f"-> up to {page_size * pages} events/poll")
    client = from_cookies(cookies)
    tracker = EventTracker(client, poll_interval=POLL_INTERVAL,
                           page_size=page_size, on_event=broadcast)
    thread = threading.Thread(
        target=tracker.start, kwargs={"pages": pages}, daemon=True
    )
    thread.start()
    return tracker


def main():
    jar_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "cookies.json")
    cookies = {}
    if os.path.exists(jar_path):
        cookies.update(load_cookies())
        print(f"Loaded {len(cookies)} cookie(s) from {jar_path}.")
    env_jar = os.environ.get("TICKETMASTER_COOKIES_JSON")
    if env_jar:
        try:
            env_cookies = json.loads(env_jar)
        except json.JSONDecodeError as exc:
            print(f"Invalid TICKETMASTER_COOKIES_JSON env var: {exc}")
            return 1
        cookies.update(env_cookies)
        print(f"Loaded {len(env_cookies)} cookie(s) from TICKETMASTER_COOKIES_JSON env.")
    if not cookies:
        print("No cookies found -- starting in clean-IP mode (no cf_clearance/SID/BID).")
        print("On a clean network the homepage SSR feed is served with browser headers alone.")
        print("If this host's IP is Ticketmaster-flagged, set TICKETMASTER_COOKIES_JSON")
        print("or run extract_cookies.py on an unflagged network first.")
    tracker = start_tracker(cookies)
    state = {"tracker": tracker}
    server = ThreadingHTTPServer((HOST, PORT), make_handler(state))
    print(f"Ticketmaster live SSE server on http://{HOST}:{PORT}")
    print("  GET /events/stream  -- real-time event feed")
    print("  GET /events         -- current snapshot")
    print("  GET /health         -- liveness")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        tracker.stop()
        server.shutdown()
    return 0


if __name__ == "__main__":
    sys.exit(main())
