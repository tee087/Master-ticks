"""Offline regression coverage for the public Discovery API feed path.

Stubs the network so the test runs without a Ticketmaster API key:
  - asserts search_events() delegates to _search_public when a key is present
  - asserts parameters are correct (apikey, size clamped to 200, page, window)
  - asserts a public-API event record normalizes to the app's canonical shape
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from ticketmaster_api import TicketmasterClient
from event_tracker import normalize_event

def make_client(key="TESTKEY"):
    return TicketmasterClient(api_key=key)

def test_search_events_uses_public_api():
    client = make_client("TESTKEY")
    captured = {}

    def make_event(i):
        return {
            "id": str(i),
            "name": f"e{i}",
            "images": [{"url": "http://x/img.jpg", "ratio": "16_9", "width": 1024}],
            "url": f"https://www.ticketmaster.com/e{i}",
            "dates": {"start": {"localDate": "2026-10-02", "localTime": "20:00:00"}},
            "_embedded": {"venues": [{"name": "Venue", "city": {"name": "City"}}]},
            "classifications": [{"segment": {"name": "Music"}}],
        }

    synthetic = {"_embedded": {"events": [make_event(i) for i in range(3)]}}

    def fake_request(method, url, params=None, json_body=None):
        captured["method"] = method
        captured["url"] = url
        captured["params"] = params
        return synthetic

    client._request = fake_request

    result = client.search_events(keyword="BTS", country_code="AU", page=0, size=250)

    assert captured["method"] == "GET", captured
    assert captured["url"].endswith("/discovery/v2/events.json"), captured
    p = captured["params"]
    assert p["apikey"] == "TESTKEY", p
    assert p["countryCode"] == "AU", p
    assert p["size"] == "200", p                  # clamped from 250 -> 200
    assert p["page"] == "0", p
    assert "BTS" in p["keyword"], p
    assert "startDateTime" in p and "endDateTime" in p, p
    # window extends into next year (DISCOVERY_WINDOW_DAYS=150 from Oct)
    assert p["endDateTime"] > p["startDateTime"], p
    assert result.get("etag", "").startswith("public:"), result
    assert isinstance(result.get("_embedded", {}).get("events"), list)
    print("  search_events public path -> apikey/size/date/keyword OK")

def test_search_events_without_key_falls_back_to_ssr():
    client = TicketmasterClient(api_key=None)
    client._get_next_data = lambda url=None: {"error": "http_403"}
    result = client.search_events()
    assert isinstance(result, dict) and result.get("error"), result
    print("  search_events no-key fallback -> SSR path OK")

def test_normalize_public_event_shape():
    raw = {
        "id": "1E0064EFDC9FC270",
        "name": "WWE Friday Night SmackDown",
        "url": "https://www.ticketmaster.com/wwe-smackdown-las-vegas-nv/event/1E0064EFDC9FC270",
        "images": [{"url": "http://x/c.jpg", "ratio": "16_9", "width": 1024},
                   {"url": "http://x/t.jpg", "ratio": "3_2", "width": 200}],
        "dates": {"start": {"localDate": "2026-10-02", "localTime": "19:30:00",
                            "dateTime": "2026-10-02T19:30:00Z"},
                  "status": {"code": "onsale"}},
        "_embedded": {"venues": [{"name": "Ball Arena", "city": {"name": "Las Vegas"}}]},
        "classifications": [{"segment": {"name": "Sport"}}],
        "priceRanges": [{"min": 45, "max": 250, "currency": "USD"}],
    }
    e = normalize_event(raw)
    assert e["id"] == "1E0064EFDC9FC270", e
    assert e["name"] == "WWE Friday Night SmackDown", e
    assert e["venue"] == "Ball Arena", e
    assert e["city"] == "Las Vegas", e
    assert e["category"] == "Sports", e
    assert e["price"] == 45, e
    assert e["dateLabel"] == "2026-10-02", e
    assert e["status"] == "onsale", e
    assert e["ticketUrl"].endswith("1E0064EFDC9FC270"), e
    print("  normalize_event (Discovery API shape) -> canonical fields OK")

if __name__ == "__main__":
    print("PUBLIC API FEED PATH")
    test_search_events_uses_public_api()
    test_search_events_without_key_falls_back_to_ssr()
    test_normalize_public_event_shape()
    print("ALL TESTS PASSED")
