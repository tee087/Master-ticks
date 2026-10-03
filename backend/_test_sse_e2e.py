"""End-to-end test of server.py's HTTP SSE layer using a synthetic client.

The live homepage is 403 on this IP, so we inject a synthetic __NEXT_DATA__
blob into a real TicketmasterClient (bypassing the network), run the REAL
EventTracker+broadcast pipeline and the REAL ThreadingHTTPServer/make_handler,
then consume /events/stream (EventSource) and /events (snapshot) over HTTP.
"""
import json
import sys
import os
import threading
import time
import urllib.request

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ticketmaster_api import TicketmasterClient, _extract_nextdata_events
from event_tracker import EventTracker
import server as sse_server

SYNTH = {
    "buildId": "build-xyz",
    "pageProps": {
        "dehydratedState": {
            "queries": [
                {"state": {"data": {"events": [
                    {"name": "Taylor Swift | The Eras Tour", "url": "/event/aaa-1/taylor-swift",
                     "imageUrl": "https://img.example.com/tay.jpg", "venueCityName": "Arlington",
                     "venueStateCode": "TX", "venueName": "AT&T Stadium", "localDate": "2026-05-01",
                     "localTime": "17:00:00Z", "priceRanges": [{"min": 49}]},
                    {"name": "NFL: Cowboys vs Eagles", "url": "/event/bbb-2/cowboys-tickets",
                     "imageUrl": "https://img.example.com/cowboys.jpg", "venueCityName": "Arlington",
                     "venueStateCode": "TX", "venueName": "AT&T Stadium", "localDate": "2026-09-15",
                     "localTime": "12:00:00Z"},
                ]}}},
            ]
        }
    },
}


def main():
    client = TicketmasterClient()
    # server import loads backend/.env.local; force the synthetic SSR path so
    # this end-to-end test never calls the live Discovery API.
    client.api_key = None
    client._get_next_data = lambda url=None: SYNTH

    tracker = EventTracker(client, poll_interval=0.5, on_event=sse_server.broadcast)

    PORT = 8731
    httpd = sse_server.ThreadingHTTPServer(("127.0.0.1", PORT), sse_server.make_handler({"tracker": tracker}))
    t_server = threading.Thread(target=httpd.serve_forever, daemon=True)
    t_server.start()

    # Start one poll cycle in the background (emits 2 'new' events -> broadcast).
    t_poll = threading.Thread(target=tracker._poll_once, args=(1,), daemon=True)
    t_poll.start()
    time.sleep(0.8)

    base = f"http://127.0.0.1:{PORT}"

    # 1) snapshot endpoint
    with urllib.request.urlopen(f"{base}/events", timeout=5) as resp:
        snap = json.loads(resp.read().decode())
    assert len(snap) == 2, f"snapshot should hold 2 events, got {len(snap)}"
    for e in snap:
        for k in ("id", "name", "image", "venue", "category", "ticketUrl"):
            assert k in e, f"snapshot event missing {k}"
    print(f"GET /events -> {len(snap)} events, fields OK -> PASS")

    # 2) SSE stream endpoint (EventSource)
    recvd = []

    def consume():
        req = urllib.request.Request(f"{base}/events/stream", headers={"Accept": "text/event-stream"})
        with urllib.request.urlopen(req, timeout=8) as resp:
            buf = b""
            for chunk in resp:
                buf += chunk
                while b"\n\n" in buf:
                    block, buf = buf.split(b"\n\n", 1)
                    if b"data:" in block:
                        payload = block.split(b"data:", 1)[1].strip()
                        recvd.append(json.loads(payload.decode()))

    c = threading.Thread(target=consume, daemon=True)
    c.start()
    deadline = time.time() + 8
    while time.time() < deadline and len(recvd) < 2:
        time.sleep(0.2)
    c.join(timeout=2)

    news = [r for r in recvd if isinstance(r, dict) and r.get("kind") == "new"]
    assert len(news) == 2, f"expected 2 'new' SSE events, got {len(recvd)} total: {recvd}"
    names = {r["event"]["name"] for r in news}
    assert names == {"Taylor Swift | The Eras Tour", "NFL: Cowboys vs Eagles"}, names
    print(f"GET /events/stream -> {len(news)} 'new' events streamed: {sorted(names)} -> PASS")

    httpd.shutdown()
    tracker.stop()
    print("ALL TESTS PASSED (server.py SSE HTTP layer validated offline)")


if __name__ == "__main__":
    main()
