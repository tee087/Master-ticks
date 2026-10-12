import Constants from 'expo-constants';

const API_URL = 'https://app.ticketmaster.com/discovery/v2/events.json';

const categoryFor = (event) => {
  const segment = event.classifications?.[0]?.segment?.name?.toLowerCase() || '';
  if (segment.includes('sport')) return 'Sports';
  if (segment.includes('art') || segment.includes('theatre')) return 'Theater';
  if (segment.includes('music')) return 'Concerts';
  return 'Festivals';
};

const eventImage = (event) => {
  const images = event.images || [];
  return images.find((image) => image.ratio === '16_9' && image.width >= 1024)?.url
    || images.find((image) => image.ratio === '16_9')?.url
    || images[0]?.url;
};

// Discovery API credentials stay on the backend; the mobile app never ships a key.
const ticketmasterApiKey = () => '';

export const isTicketmasterConfigured = () => Boolean(ticketmasterApiKey());

export const isLiveBackendConfigured = () => Boolean(backendUrl());

const backendUrl = () =>
  (process.env.EXPO_PUBLIC_TICKETMASTER_BACKEND_URL ||
    Constants?.expoConfig?.extra?.ticketmasterBackendUrl ||
    Constants?.manifest?.extra?.ticketmasterBackendUrl ||
    '').replace(/\/+$/, '');

export const fetchLiveSnapshot = async () => {
  const url = backendUrl();
  if (!url) return { events: [], hasMore: false };
  const res = await fetch(`${url}/events`, { headers: { 'Cache-Control': 'no-store' } });
  if (!res.ok) throw new Error(`Live feed unavailable (${res.status})`);
  const events = await res.json();
  return { events: events.map(normalizeLiveEvent), hasMore: false };
};

export const searchLiveEvents = async ({ keyword = '', countryCode = 'US', countryCodes, page = 0, city, countryOnly = false, startDateTime, endDateTime, signal }) => {
  const url = backendUrl();
  if (!url || (!keyword.trim() && !city && !countryOnly && !startDateTime && !endDateTime)) return [];
  const countries = [...new Set((countryCodes?.length ? countryCodes : [countryCode]).filter(Boolean))];
  const responses = [];
  for (let start = 0; start < countries.length; start += 5) {
    if (signal?.aborted) {
      const error = new Error('Search cancelled');
      error.name = 'AbortError';
      throw error;
    }
    const batch = await Promise.allSettled(countries.slice(start, start + 5).map(async (code) => {
      const params = new URLSearchParams({ countryCode: code, page: String(page), size: '200' });
      if (keyword.trim()) params.set('keyword', keyword.trim());
      if (city) params.set('city', city);
      if (countryOnly) params.set('countryOnly', 'true');
      if (startDateTime) params.set('startDateTime', startDateTime);
      if (endDateTime) params.set('endDateTime', endDateTime);
      const res = await fetch(url + '/search?' + params.toString(), {
        headers: { 'Cache-Control': 'no-store' },
        signal,
      });
      if (!res.ok) {
        const error = new Error('Live search unavailable (' + res.status + ')');
        error.status = res.status;
        error.retryAfter = res.headers.get('Retry-After');
        throw error;
      }
      return res.json();
    }));
    responses.push(...batch);
    if (batch.some((result) => result.status === 'rejected' && result.reason?.status === 429)) break;
  }
  const payloads = responses.filter((result) => result.status === 'fulfilled').map((result) => result.value);
  const failures = responses.filter((result) => result.status === 'rejected').map((result) => result.reason);
  if (!payloads.length) throw failures[0] || new Error('Live search unavailable');
  const eventsById = new Map();
  const pagination = [];
  payloads.forEach((payload) => {
    const events = Array.isArray(payload) ? payload : (payload.events || []);
    events.map(normalizeLiveEvent).forEach((event) => eventsById.set(event.ticketmasterId || event.id, event));
    pagination.push(payload.page || {});
  });
  return {
    events: [...eventsById.values()],
    page,
    hasMore: pagination.some((item) => page + 1 < Number(item.totalPages || 1)),
    partial: failures.length > 0,
    rateLimited: failures.some((error) => error?.status === 429),
    stale: payloads.some((payload) => payload?.stale),
  };
};
const normalizeLiveEvent = (e) => ({
  id: `tm-${e.id}`,
  ticketmasterId: e.id,
  name: e.name || '',
  image: e.image,
  venue: e.venue || (typeof e.place === 'string' ? e.place : e.place?.name) || 'Venue to be announced',
  venueAddress: e.venueAddress || '',
  venueLocationText: e.venueLocationText || [e.venueAddress, e.city, e.stateCode, e.postalCode, e.countryCode].filter(Boolean).join(', '),
  venueLocation: e.venueLocation || null,
  city: e.city || '',
  country: e.country || '',
  place: typeof e.place === 'string' ? e.place : e.place?.name || '',
  stateCode: e.stateCode || '',
  countryCode: e.countryCode || '',
  postalCode: e.postalCode || '',
  seatMapUrl: e.seatMapUrl || null,
  date: e.date,
  dateLabel: e.dateLabel,
  time: e.time || 'Time TBA',
  price: e.price ?? 0,
  category: e.category || 'Concerts',
  description: e.description || 'Ticketmaster event listing.',
  ticketUrl: e.ticketUrl,
  isLiveTicketmasterEvent: true,
});

const normalizeDiscoveryEvent = (event, countryCode) => {
  const venue = event._embedded?.venues?.[0] || {};
  const place = event.place || {};
  const city = venue.city?.name || place.city?.name || '';
  const country = venue.country?.name || place.country?.name || '';
  return {
    id: `live-${event.id}`,
    ticketmasterId: event.id,
    name: event.name,
    image: eventImage(event),
    venue: venue.name || place.name || 'Venue to be announced',
    venueAddress: venue.address?.line1 || place.address?.line1 || '',
    venueLocationText: [venue.address?.line1 || place.address?.line1, city, venue.state?.stateCode || place.state?.stateCode, venue.postalCode || place.postalCode, venue.country?.countryCode || place.country?.countryCode].filter(Boolean).join(', '),
    venueLocation: venue.location || place.location || null,
    city,
    stateCode: venue.state?.stateCode || place.state?.stateCode || '',
    countryCode: venue.country?.countryCode || place.country?.countryCode || countryCode,
    country,
    postalCode: venue.postalCode || place.postalCode || '',
    place: place.name || '',
    seatMapUrl: event.seatmap?.staticUrl || null,
    date: event.dates?.start?.dateTime || event.dates?.start?.localDate,
    dateLabel: event.dates?.start?.localDate,
    time: event.dates?.start?.localTime || 'Time TBA',
    price: event.priceRanges?.[0]?.min ?? 0,
    category: categoryFor(event),
    description: event.info || event.pleaseNote || 'Ticketmaster event listing.',
    ticketUrl: event.url,
    isLiveTicketmasterEvent: true,
  };
};
export const searchTicketmasterEvents = async ({ keyword = '', countryCodes = ['US'], page = 0, city, placeCountryCode, countryOnly = false, startDateTime, endDateTime, signal }) => {
  const apiKey = ticketmasterApiKey();
  const searchTerm = keyword.trim();
  if (!apiKey || (!searchTerm && !city && !countryOnly && !startDateTime && !endDateTime)) return { events: [], page, hasMore: false };
  const countries = [...new Set((countryCodes || []).filter(Boolean))];
  const successful = [];
  const failures = [];
  const throwIfAborted = () => {
    if (!signal?.aborted) return;
    const error = new Error('Search cancelled');
    error.name = 'AbortError';
    throw error;
  };
  const httpError = (response, context) => {
    const error = new Error(`${context} (${response.status})`);
    error.status = response.status;
    error.retryAfter = response.headers.get('Retry-After');
    return error;
  };

  if (searchTerm || startDateTime || endDateTime) {
    for (let start = 0; start < countries.length; start += 5) {
      throwIfAborted();
      const batch = await Promise.allSettled(countries.slice(start, start + 5).map(async (countryCode) => {
        const params = new URLSearchParams({ apikey: apiKey, countryCode, size: '200', page: String(page) });
        if (searchTerm) params.set('keyword', searchTerm);
        if (startDateTime) params.set('startDateTime', startDateTime);
        if (endDateTime) params.set('endDateTime', endDateTime);
        const response = await fetch(`${API_URL}?${params.toString()}`, { signal });
        if (!response.ok) throw httpError(response, 'Ticketmaster search failed');
        return { payload: await response.json(), countryCode };
      }));
      batch.forEach((result) => result.status === 'fulfilled' ? successful.push(result.value) : failures.push(result.reason));
      if (batch.some((result) => result.status === 'rejected' && result.reason?.status === 429)) break;
      throwIfAborted();
    }
  }

  if ((city || (countryOnly && !startDateTime && !endDateTime)) && placeCountryCode) {
    try {
      throwIfAborted();
      const params = new URLSearchParams({ apikey: apiKey, countryCode: placeCountryCode, size: '200', page: String(page) });
      if (city) params.set('city', city);
      if (startDateTime) params.set('startDateTime', startDateTime);
      if (endDateTime) params.set('endDateTime', endDateTime);
      const response = await fetch(`${API_URL}?${params.toString()}`, { signal });
      if (!response.ok) throw httpError(response, 'Ticketmaster place search failed');
      successful.push({ payload: await response.json(), countryCode: placeCountryCode });
    } catch (error) {
      if (error.name === 'AbortError') throw error;
      failures.push(error);
    }
  }

  const eventsById = new Map();
  const addEvents = (payload, fallbackCountryCode) => {
    (payload._embedded?.events || []).map((event) => normalizeDiscoveryEvent(event, fallbackCountryCode))
      .forEach((event) => eventsById.set(event.ticketmasterId, event));
  };
  successful.forEach(({ payload, countryCode }) => addEvents(payload, countryCode));

  // Only spend extra requests on venue lookup after the event search completed without errors.
  if (searchTerm && eventsById.size === 0 && failures.length === 0) {
    try {
      throwIfAborted();
      const venueParams = new URLSearchParams({ apikey: apiKey, keyword: searchTerm, size: '5', page: '0' });
      const venueResponse = await fetch(`${API_URL.replace('/events.json', '/venues.json')}?${venueParams.toString()}`, { signal });
      if (!venueResponse.ok) throw httpError(venueResponse, 'Ticketmaster venue search failed');
      const venuePayload = await venueResponse.json();
      const venues = (venuePayload._embedded?.venues || []).filter((venue) => {
        const code = venue.country?.countryCode;
        return !code || countries.includes(code);
      }).slice(0, 5);
      for (let start = 0; start < venues.length; start += 5) {
        throwIfAborted();
        const batch = await Promise.allSettled(venues.slice(start, start + 5).map(async (venue) => {
          const params = new URLSearchParams({ apikey: apiKey, venueId: venue.id, size: '200', page: String(page) });
          const response = await fetch(`${API_URL}?${params.toString()}`, { signal });
          if (!response.ok) throw httpError(response, 'Ticketmaster venue events failed');
          return { payload: await response.json(), countryCode: venue.country?.countryCode || placeCountryCode || 'US' };
        }));
        batch.forEach((result) => result.status === 'fulfilled' ? successful.push(result.value) : failures.push(result.reason));
        throwIfAborted();
      }
    } catch (error) {
      if (error.name === 'AbortError') throw error;
      failures.push(error);
    }
  }

  if (!successful.length && failures.length) throw failures[0];
  successful.forEach(({ payload, countryCode }) => addEvents(payload, countryCode));
  return {
    events: [...eventsById.values()],
    page,
    hasMore: successful.some(({ payload }) => page + 1 < Number(payload.page?.totalPages || 0)),
    partial: failures.length > 0,
    rateLimited: failures.some((error) => error?.status === 429),
  };
};
export const fetchTicketmasterEvents = async ({ keyword = '', category = 'events', page = 0, countryCode = 'US' }) => {
  const apiKey = ticketmasterApiKey();
  if (!apiKey) return { events: [], hasMore: false };
  const params = new URLSearchParams({ apikey: apiKey, size: '20', page: String(page), countryCode });
  if (keyword.trim()) params.set('keyword', keyword.trim());
  const classifications = { Concerts: 'music', Sports: 'sports', Theater: 'arts & theatre', Festivals: 'miscellaneous' };
  if (classifications[category]) params.set('classificationName', classifications[category]);
  const response = await fetch(`${API_URL}?${params.toString()}`);
  if (!response.ok) throw new Error(`Ticketmaster request failed (${response.status})`);
  const payload = await response.json();
  return {
    events: (payload._embedded?.events || []).map((event) => normalizeDiscoveryEvent(event, countryCode)),
    hasMore: page + 1 < (payload.page?.totalPages || 0),
  };
};
export const connectLiveEvents = (callback, { intervalMs = 4000, onStatus } = {}) => {
  const base = backendUrl();
  if (!base) { onStatus?.('unavailable'); return () => {}; }
  const url = base + '/events';
  const seen = new Map();
  let stopped = false;
  let hasReadySnapshot = false;
  let hasCompleteSnapshot = false;
  onStatus?.('loading');

  const signature = (e) =>
    [e.name, e.venue, e.price, e.status, e.date].join('|');

  const remember = (events, replace = false) => {
    if (replace) seen.clear();
    events.forEach((event) => seen.set(event.id, signature(event)));
  };

  const tick = async () => {
    if (stopped) return;
    try {
      const res = await fetch(url, { headers: { 'Cache-Control': 'no-store' } });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const events = await res.json();
      const readyHeader = res.headers.get('X-Feed-Ready');
      const completeHeader = res.headers.get('X-Feed-Complete');
      const feedReady = readyHeader === null || readyHeader !== 'false';
      const feedComplete = feedReady && (completeHeader === null || completeHeader !== 'false');

      if (!feedReady) {
        onStatus?.('loading');
      } else if (!hasReadySnapshot || (feedComplete && !hasCompleteSnapshot)) {
        callback(events.map(normalizeLiveEvent), 'snapshot', feedComplete);
        remember(events, true);
        hasReadySnapshot = true;
        hasCompleteSnapshot = feedComplete;
        onStatus?.(events.length ? 'ready' : feedComplete ? 'empty' : 'loading');
      } else {
        for (const event of events) {
          const prev = seen.get(event.id);
          const sig = signature(event);
          if (!prev) callback(normalizeLiveEvent(event), 'new');
          else if (prev !== sig) callback(normalizeLiveEvent(event), 'update');
        }
        const current = new Set(events.map((event) => event.id));
        if (feedComplete) {
          for (const id of [...seen.keys()]) {
            if (!current.has(id)) callback({ id, ticketmasterId: id, isLiveTicketmasterEvent: true }, 'gone');
          }
          remember(events, true);
        } else {
          remember(events);
        }
        hasCompleteSnapshot = feedComplete;
        onStatus?.(events.length ? 'ready' : feedComplete ? 'empty' : 'loading');
      }
    } catch (err) {
      onStatus?.('error');
      console.warn('live feed error', err);
    }
    if (!stopped) setTimeout(tick, intervalMs);
  };

  tick();
  return () => { stopped = true; };
};