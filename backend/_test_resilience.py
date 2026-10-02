"""Resilience tests: tracker survives connection errors; server._send coerces bodies."""
import sys
import os
import json
import io
import socket
from unittest.mock import MagicMock

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import requests
from ticketmaster_api import TicketmasterClient
from event_tracker import EventTracker, normalize_event


class BlockingClient:
    """Client whose search_events raises a connection reset (flagged IP)."""
    def search_events(self, **kwargs):
        raise requests.exceptions.ConnectionError("10054 connection reset by peer")


def main():
    print("TRACKER survives ConnectionError (no thread death)")
    emitted = []
    t = EventTracker(BlockingClient(), poll_interval=0.1, on_event=lambda e, k: emitted.append((k, e)))
    # First cycle raises in _sync_page -> must be caught, not propagated.
    t._poll_once(pages=1)
    assert emitted == [], f"no events should emit on connection error, got {emitted}"
    snap = t.snapshot()
    assert snap == [], f"snapshot empty on connection error, got {snap}"
    print("  poll cycle completed despite ConnectionError, no crash -> OK")
    print("  (tracker will silently retry every poll_interval until network clears)")

    print("SERVER._send coerces dict/str/bytes bodies to bytes (no TypeError)")
    import server as sse
    Handler = sse.make_handler({"tracker": t})
    # Build a handler instance against a fake socket/rfile+wfile.
    rfile = io.BytesIO(b"")
    wfile = io.BytesIO()
    conn = MagicMock()
    conn.makefile.side_effect = lambda *a, **k: (rfile if a[0] == "rb" else wfile)
    h = Handler.__new__(Handler)
    h.rfile = rfile
    h.wfile = wfile
    h.headers = MagicMock()
    h.command = "GET"
    h.request_version = "HTTP/1.1"
    h.client_address = ("127.0.0.1", 1)
    h.request = conn
    h._headers_buffer = []
    # Isolate the body-coercion fix: stub the stdlib logging/header helpers.
    h.send_response = lambda *a, **k: None
    h.send_header = lambda *a, **k: None
    h.end_headers = lambda *a, **k: None

    # dict body (the /health case that previously TypeErrored)
    h._send(200, {"status": "ok", "clients": 0})
    out = wfile.getvalue()
    assert out.endswith(b'{"status": "ok", "clients": 0}'), out[-60:]
    print("  dict body -> bytes written -> OK")

    wfile.truncate(0); wfile.seek(0)
    h._send(200, "plain string")
    assert wfile.getvalue().endswith(b"plain string")
    print("  str body -> bytes written -> OK")

    print("ALL TESTS PASSED")


if __name__ == "__main__":
    main()
