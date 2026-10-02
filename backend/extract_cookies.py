"""Extract Ticketmaster session cookies via a real browser.

This is the Ticketmaster equivalent of Arena-club's ``extract_cookies.py``.
It launches a real Chrome browser (reusing a logged-in user profile so the
Cloudflare JS challenge is solved and a fresh ``cf_clearance`` is issued),
navigates to ticketmaster.com, and harvests the bot-bypass + visitor cookies
required to replay authenticated-looking requests against the website's
internal API.

Run it once (or whenever ``cf_clearance`` expires) to refresh the cookie jar
that ``TicketmasterClient`` consumes.

Usage:
    python backend/extract_cookies.py [--url https://www.ticketmaster.com]
    TM_TICKETMASTER_USER_DATA_DIR=... python backend/extract_cookies.py

The cookies are written to ``backend/cookies.json`` and printed to stdout.
"""

import json
import os
import sys
import argparse
import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from constants import COOKIE_NAMES


def build_driver(user_data_dir=None, headless=True):
    options = Options()
    if headless:
        options.add_argument("--headless=new")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-gpu")
    options.add_argument("--disable-blink-features=AutomationControlled")
    if user_data_dir:
        options.add_argument(f"--user-data-dir={user_data_dir}")
    options.add_experimental_option("excludeSwitches", ["enable-automation"])
    options.add_experimental_option("useAutomationExtension", False)
    service = Service()
    driver = webdriver.Chrome(service=service, options=options)
    driver.execute_cdp_cmd(
        "Page.addScriptToEvaluateOnNewDocument",
        {
            "source": (
                "Object.defineProperty(navigator, 'webdriver', {get: () => undefined});"
                "window.chrome = {runtime: {}}; "
                "Object.defineProperty(navigator, 'plugins', {get: () => [1,2,3,4,5]});"
            )
        },
    )
    return driver


def _wait_for_cf_clearance(driver, timeout=40):
    """Poll until a ``cf_clearance`` cookie lands in the jar (challenge solved)."""
    deadline = time.time() + timeout
    while time.time() < deadline:
        cookies = {c["name"]: c["value"] for c in driver.get_cookies()}
        if "cf_clearance" in cookies:
            return cookies
        # Tickle the page so Cloudflare's challenge worker runs.
        try:
            driver.execute_script("window.scrollBy(0, window.innerHeight);")
        except Exception:
            pass
        time.sleep(1.5)
    return {c["name"]: c["value"] for c in driver.get_cookies()}


def extract_cookies(url="https://www.ticketmaster.com",
                    user_data_dir=None,
                    output_path=None,
                    timeout=40,
                    headless=True):
    user_data_dir = user_data_dir or os.getenv("TM_TICKETMASTER_USER_DATA_DIR")
    driver = build_driver(user_data_dir=user_data_dir, headless=headless)
    try:
        driver.get(url)
        cookies = _wait_for_cf_clearance(driver, timeout=timeout)
        # Give the page a moment to load any remaining visitor cookies.
        time.sleep(2)
        cookies = {c["name"]: c["value"] for c in driver.get_cookies()}
        extracted = {name: cookies.get(name) for name in COOKIE_NAMES}
        extracted = {k: v for k, v in extracted.items() if v}
    finally:
        driver.quit()

    if not extracted.get("cf_clearance"):
        print("WARNING: cf_clearance was not captured.")
        print("The Cloudflare/Ticketmaster challenge did not complete, which usually")
        print("means the current network/IP is 'paused' or flagged (no token is issued")
        print("to a blocked IP). Fixes:")
        print("  - switch to a different Wi-Fi / cellular network, then re-run")
        print("  - increase --timeout (e.g. --timeout 90) for slow challenges")
        print("  - retry a few times, or pass --retries N for automatic attempts")

    if output_path:
        with open(output_path, "w") as fh:
            json.dump(extracted, fh, indent=2)
        print(f"Cookies written to {output_path}")

    for name, value in extracted.items():
        print(f"{name}={value}")
    return extracted


def main():
    parser = argparse.ArgumentParser(description="Extract Ticketmaster cookies via Selenium")
    parser.add_argument("--url", default="https://www.ticketmaster.com")
    parser.add_argument("--user-data-dir", default=os.getenv("TM_TICKETMASTER_USER_DATA_DIR"))
    parser.add_argument("--out", default=os.path.join(os.path.dirname(__file__), "cookies.json"))
    parser.add_argument("--timeout", type=int, default=40)
    parser.add_argument("--retries", type=int, default=1,
                        help="Number of extraction attempts before giving up.")
    parser.add_argument("--no-headless", action="store_true",
                        help="Run Chrome visibly so a human can solve interactive "
                             "Cloudflare/Ticketmaster challenges (more reliable for "
                             "cf_clearance on hardened sites).")
    args = parser.parse_args()
    last = {}
    for attempt in range(1, args.retries + 1):
        if attempt > 1:
            print(f"--- retry {attempt}/{args.retries} ---")
        last = extract_cookies(args.url, args.user_data_dir, args.out,
                               args.timeout, headless=not args.no_headless)
        if last.get("cf_clearance"):
            break
        if attempt < args.retries:
            time.sleep(5)
    if not last.get("cf_clearance") and args.retries > 1:
        print("All retries exhausted: cf_clearance never obtained (likely a")
        print("flagged network/IP). Switch networks and re-run.")


if __name__ == "__main__":
    main()
