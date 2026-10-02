FROM python:3.13-slim

WORKDIR /app

# Install Python dependencies first (cached layer).
COPY backend/requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the backend package (server, client, tracker, constants, cookies.json).
COPY backend/ ./backend/

EXPOSE 8765

# Bind to all interfaces so the host/SSh tunnel/Cloud firewall can reach it.
ENV TM_HOST=0.0.0.0 TM_PORT=8765 TM_POLL_INTERVAL=5 TM_TRACK_PAGES=1

# Entrypoint: serve the SSE live feed. On a clean IP the homepage SSR is served
# directly with browser headers (cookies.json may contain only _ga). On a
# flagged IP, re-run extract_cookies.py on THIS host to capture cf_clearance /
# SID / BID and overwrite backend/cookies.json with that jar.
CMD ["python", "backend/server.py"]
