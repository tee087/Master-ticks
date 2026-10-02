"""Ticketmaster website API endpoints and required cookies.

Mirrors the Arena-club constants pattern. The endpoints below are the internal
SPA APIs that power the official ticketmaster.com experience. They are served
from behind Cloudflare / Akamai bot protection, so requests require a valid
``cf_clearance`` token plus the visitor session cookies that a real browser
obtains -- exactly the bypass the Arena-club scraper relies on.
"""

# ---------------------------------------------------------------------------
# Real-time data source strategy
#
# Two paths, both driven by the same browser-spoofed request:
#
#   * Clean network/IP (the common case): the homepage is server-rendered with
#     a <script id="__NEXT_DATA__"> blob that already contains the live event
#     listing. A plain request with browser headers + the visitor session
#     cookies (SID/BID) the site sets is enough -- no cf_clearance required.
#
#   * Flagged/paused IP: Cloudflare interstitials the homepage and issues a
#     cf_clearance token only after the JS challenge is solved. In that case
#     Selenium (extract_cookies.py) harvests cf_clearance + session cookies
#     and replays them, again spoofing browser headers.
#
# Endpoints below drive both paths.
# ---------------------------------------------------------------------------
HOMEPAGE_URL = "https://www.ticketmaster.com/"

# ---------------------------------------------------------------------------
# Real-time website catalog (served from www.ticketmaster.com)
# ---------------------------------------------------------------------------
BASE_URL = "https://www.ticketmaster.com/api/v1/events"
SEARCH_URL = f"{BASE_URL}/search"
EVENT_URL = f"{BASE_URL}/{{event_id}}"

# Search-as-you-type suggestions endpoint.
SUGGEST_URL = "https://www.ticketmaster.com/api/v1/suggest"

# ---------------------------------------------------------------------------
# Near real-time inventory availability (app.ticketmaster.com)
#
# Provides inventory updates (status, price ranges, resale) for a set of
# universal event ids. Updates happen near real-time, which is the source of
# truth for seat availability drift. Documented endpoint.
# ---------------------------------------------------------------------------
INVENTORY_URL = "https://app.ticketmaster.com/inventory-status/v1/availability"

# ---------------------------------------------------------------------------
# Cookies required to defeat the bot challenge.
#
# ``cf_clearance`` is the Cloudflare bot-challenge bypass token (the key piece
# the Arena-club pattern extracts and replays). ``SID``/``BID`` are the Ticketmaster
# visitor session cookies the site issues to a real browser -- these are what the
# real-time SSR feed actually trusts on a clean network. The remaining entries
# are visitor/analytics/CDN cookies that make the replayed fingerprint consistent.
# Extend this list if capture reveals additional tokens (e.g. Akamai ``bm_*``).
# ---------------------------------------------------------------------------
COOKIE_NAMES = [
    "cf_clearance",
    "SID",
    "BID",
    "ak_bmsc",
    "bm_sv",
    "_ga",
    "_gid",
    "_gat",
    "RT_NF",
    "AWSALB",
    "AWSALBCORS",
]

# ---------------------------------------------------------------------------
# Spoofed browser header values. Match the User-Agent string the extraction
# browser reports so the server treats the replayed request as the same client.
# ---------------------------------------------------------------------------
DEFAULT_USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/151.0.0.0 Safari/537.36"
)

DEFAULT_SEC_CH_UA = '"Not=A?Brand";v="99", "Google Chrome";v="151", "Chromium";v="151"'
DEFAULT_SEC_CH_UA_PLATFORM = "Windows"
