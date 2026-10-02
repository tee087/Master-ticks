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
from collections import deque
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ticketmaster_api import load_cookies, from_cookies
from event_tracker import EventTracker


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
            path = self.path.split("?", 1)[0]
            if path == "/health":
                self._send(200, {"status": "ok", "clients": len(_clients)})
            elif path == "/events":
                self._send(200, tracker_started["tracker"].snapshot())
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
    client = from_cookies(cookies)
    tracker = EventTracker(client, poll_interval=POLL_INTERVAL, on_event=broadcast)
    thread = threading.Thread(
        target=tracker.start, kwargs={"pages": PAGES}, daemon=True
    )
    thread.start()
    return tracker


def main():
    jar_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "cookies.json")
    if not os.path.exists(jar_path):
        print("No cookies.json found. Run extract_cookies.py first.")
        return 1
    cookies = load_cookies()
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
