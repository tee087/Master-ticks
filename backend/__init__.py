"""Ticketmaster real-time backend (cf_clearance bypass pattern).

Modules:
  constants       -- API endpoints + required cookie names + header values
  extract_cookies -- Selenium harvest of cf_clearance / session cookies
  ticketmaster_api -- browser-spoofed API client that replays those cookies
  event_tracker   -- real-time poll + ETag/not-modified change detection + render
  server          -- minimal SSE server (stdlib) that streams live events
"""
