"""Synthetic end-to-end test of the __NEXT_DATA__ -> normalize -> snapshot pipe.

The live homepage is 403 on this IP, so we monkeypatch _get_next_data with a
representative __NEXT_DATA__ blob (name + /event/ url + imageUrl +
venueCityName, exactly the is_event() contract) and assert the tracker emits
normalized events whose field names match the App's normalizeLiveEvent.
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ticketmaster_api import TicketmasterClient, _extract_nextdata_events
from event_tracker import EventTracker, normalize_event

SYNTH = {
    "buildId": "abc123",
    "pageProps": {
        "dehydratedState": {
            "queries": [
                {"state": {"data": {"events": [
                    {"name": "Taylor Swift | The Eras Tour", "url": "/event/123/taylor-swift-tickets",
                     "imageUrl": "https://img.example.com/tay.jpg", "venueCityName": "Arlington",
                     "venueStateCode": "TX", "venueName": "AT&T Stadium", "localDate": "2026-05-01",
                     "localTime": "17:00:00Z", "priceRanges": [{"min": 49, "max": 299}]},
                    {"name": "Dallas Cowboys vs. Eagles (NFL Football)", "url": "/event/456/cowboys-tickets",
                     "imageUrl": "https://img.example.com/cowboys.jpg", "venueCityName": "Arlington",
                     "venueStateCode": "TX", "venueName": "AT&T Stadium", "localDate": "2026-09-15",
                     "localTime": "12:00:00Z"},
                    {"name": "Morris Day & The Time", "url": "/event/789/morris-day-tickets",
                     "imageUrl": "https://img.example.com/morris.jpg", "venueCityName": "Minneapolis",
                     "venueStateCode": "MN", "venueName": "First Avenue", "localDate": "2026-11-20",
                     "localTime": "20:00:00Z"},
                    # duplicate of the first to exercise de-dup
                    {"name": "Taylor Swift | The Eras Tour", "url": "/event/123/taylor-swift-tickets",
                     "imageUrl": "https://img.example.com/tay.jpg", "venueCityName": "Arlington",
                     "venueStateCode": "TX"},
                ]}}},
            ]
        }
    },
    # sibling of pageProps: shares keys but no /event/ url -> is_event() rejects
    "junk": {"name": "not an event", "imageUrl": "https://img.example.com/x.jpg"},
}


def main():
    client = TicketmasterClient()
    # bypass network: serve the synthetic __NEXT_DATA__ blob
    client._get_next_data = lambda url=None: SYNTH

    emitted = []
    tracker = EventTracker(client, poll_interval=0.1, on_event=lambda e, k: emitted.append((k, e)))

    print("PARSER")
    raw = _extract_nextdata_events(client._get_next_data())
    assert len(raw) == 3, f"expected 3 unique nodes after dedup, got {len(raw)}"
    print(f"  parsed+deduped raw nodes: {len(raw)}  (expect 3) -> OK")
    assert all(("imageUrl" in r or "venueCityName" in r) for r in raw)
    assert not any("x.jpg" in str(r) for r in raw), "junk leaked into events"
    print("  selective (junk excluded) -> OK")

    print("NORMALIZE")
    n = normalize_event(raw[0])
    for k in ("id", "name", "image", "venue", "city", "date", "dateLabel", "time",
              "price", "category", "ticketUrl", "status"):
        assert k in n, f"missing field {k}"
    assert n["name"] == "Taylor Swift | The Eras Tour"
    assert n["image"] == "https://img.example.com/tay.jpg"
    assert n["venue"] == "AT&T Stadium"
    assert n["city"] == "Arlington"
    assert n["ticketUrl"] == "https://www.ticketmaster.com/event/123/taylor-swift-tickets" or "123" in n["ticketUrl"]
    assert n["category"] == "Concerts", n["category"]
    print(f"  {n['name']} -> cat={n['category']} price={n['price']} -> OK")
    n2 = normalize_event(raw[1])
    assert n2["category"] == "Sports", f"sports name mis-classified: {n2['category']}"
    print(f"  {n2['name']} -> cat={n2['category']} -> OK")
    n3 = normalize_event(raw[2])
    assert n3["category"] == "Concerts", f"music name mis-classified: {n3['category']}"
    print(f"  {n3['name']} -> cat={n3['category']} -> OK")
    print("TRACKER (snapshot + emit kinds)")
    tracker._poll_once(pages=1)
    kinds = [k for k, _ in emitted]
    assert len(kinds) == 3 and all(k == "new" for k in kinds), f"first cycle should emit only 'new', got {kinds}"
    snap = tracker.snapshot()
    assert len(snap) == 3, f"snapshot should hold 3 events, got {len(snap)}"
    ids = {e["id"] for e in snap}
    assert {"taylor-swift-tickets", "cowboys-tickets", "morris-day-tickets"}.issubset(ids), ids
    for e in snap:
        for k in ("id", "name", "image", "venue", "date", "dateLabel", "time",
                  "price", "category", "ticketUrl"):
            assert k in e, f"snapshot event missing {k}"
    print(f"  emitted kinds={kinds} snapshot={len(snap)} ids={sorted(ids)} -> OK")

    print("ALL TESTS PASSED")


if __name__ == "__main__":
    main()
