import { Constants } from 'expo-constants';

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

export const isTicketmasterConfigured = () => Boolean(Constants?.manifest?.extra?.ticketmasterApiKey || process.env.EXPO_PUBLIC_TICKETMASTER_API_KEY);

export const isLiveBackendConfigured = () => Boolean(backendUrl());

const backendUrl = () =>
  (Constants?.manifest?.extra?.ticketmasterBackendUrl ||
    process.env.EXPO_PUBLIC_TICKETMASTER_BACKEND_URL ||
    '').replace(/\/+$/, '');

export const fetchLiveSnapshot = async () => {
  const url = backendUrl();
  if (!url) return { events: [], hasMore: false };
  const res = await fetch(`${url}/events`, { headers: { 'Cache-Control': 'no-store' } });
  if (!res.ok) throw new Error(`Live feed unavailable (${res.status})`);
  const events = await res.json();
  return { events: events.map(normalizeLiveEvent), hasMore: false };
};

export const searchLiveEvents = async ({ keyword, countryCode = 'US', countryCodes, page = 0 }) => {
  const url = backendUrl();
  if (!url || !keyword?.trim()) return [];
  const countries = [...new Set((countryCodes?.length ? countryCodes : [countryCode]).filter(Boolean))];
  const responses = [];
  for (let start = 0; start < countries.length; start += 5) {
    const batch = await Promise.allSettled(countries.slice(start, start + 5).map(async (code) => {
      const params = new URLSearchParams({ keyword: keyword.trim(), countryCode: code, page: String(page), size: '200' });
      const res = await fetch(`${url}/search?${params.toString()}`, {
        headers: { 'Cache-Control': 'no-store' },
      });
      if (!res.ok) throw new Error(`Live search unavailable (${res.status})`);
      return res.json();
    }));
    responses.push(...batch);
  }
  const payloads = responses.filter((result) => result.status === 'fulfilled').map((result) => result.value);
  if (!payloads.length) throw responses.find((result) => result.status === 'rejected')?.reason || new Error('Live search unavailable');
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
  };
};

const normalizeLiveEvent = (e) => ({
  id: `tm-${e.id}`,
  ticketmasterId: e.id,
  name: e.name || '',
  image: e.image,
  venue: e.venue || 'Venue to be announced',
  venueAddress: e.venueAddress || '',
  venueLocationText: e.venueLocationText || [e.venueAddress, e.city, e.stateCode, e.postalCode, e.countryCode].filter(Boolean).join(', '),
  venueLocation: e.venueLocation || null,
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

export const fetchTicketmasterEvents = async ({ keyword = '', category = 'events', page = 0, countryCode = 'US' }) => {
  const apiKey = Constants?.manifest?.extra?.ticketmasterApiKey || process.env.EXPO_PUBLIC_TICKETMASTER_API_KEY;
  if (!apiKey) return { events: [], hasMore: false };

  const params = new URLSearchParams({ apikey: apiKey, source: 'ticketmaster', size: '20', page: String(page), countryCode });
  if (keyword.trim()) params.set('keyword', keyword.trim());
  const classifications = { Concerts: 'music', Sports: 'sports', Theater: 'arts & theatre', Festivals: 'miscellaneous' };
  if (classifications[category]) params.set('classificationName', classifications[category]);

  const response = await fetch(`${API_URL}?${params.toString()}`);
  if (!response.ok) throw new Error(`Ticketmaster request failed (${response.status})`);
  const payload = await response.json();
  const events = payload._embedded?.events || [];
  const totalPages = payload.page?.totalPages || 0;

  return {
    events: events.map((event) => ({
      id: `live-${event.id}`,
      ticketmasterId: event.id,
      name: event.name,
      image: eventImage(event),
      venue: event._embedded?.venues?.[0]?.name || 'Venue to be announced',
      venueAddress: event._embedded?.venues?.[0]?.address?.line1 || '',
      venueLocationText: [event._embedded?.venues?.[0]?.address?.line1, event._embedded?.venues?.[0]?.city?.name, event._embedded?.venues?.[0]?.state?.stateCode, event._embedded?.venues?.[0]?.postalCode, event._embedded?.venues?.[0]?.country?.countryCode].filter(Boolean).join(', '),
      venueLocation: event._embedded?.venues?.[0]?.location || null,
      stateCode: event._embedded?.venues?.[0]?.state?.stateCode || '',
      countryCode: event._embedded?.venues?.[0]?.country?.countryCode || countryCode,
      postalCode: event._embedded?.venues?.[0]?.postalCode || '',
      seatMapUrl: event.seatmap?.staticUrl || null,
      date: event.dates?.start?.dateTime || event.dates?.start?.localDate,
      dateLabel: event.dates?.start?.localDate,
      time: event.dates?.start?.localTime || 'Time TBA',
      price: event.priceRanges?.[0]?.min ?? 0,
      category: categoryFor(event),
      description: event.info || event.pleaseNote || 'Ticketmaster event listing.',
      ticketUrl: event.url,
      isLiveTicketmasterEvent: true,
    })),
    hasMore: page + 1 < totalPages,
  };
};

export const connectLiveEvents = (callback, { intervalMs = 4000 } = {}) => {
  const base = backendUrl();
  if (!base) return () => {};
  const url = `${base}/events`;
  const seen = new Map();
  let stopped = false;

  const signature = (e) =>
    [e.name, e.venue, e.price, e.status, e.date].join('|');

  const tick = async () => {
    if (stopped) return;
    try {
      const res = await fetch(url, { headers: { 'Cache-Control': 'no-store' } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const events = await res.json();
      for (const event of events) {
        const prev = seen.get(event.id);
        const sig = signature(event);
        if (!prev) {
          seen.set(event.id, sig);
          callback(normalizeLiveEvent(event), 'new');
        } else if (prev !== sig) {
          seen.set(event.id, sig);
          callback(normalizeLiveEvent(event), 'update');
        }
      }
      const current = new Set(events.map((e) => e.id));
      for (const id of [...seen.keys()]) {
        if (!current.has(id)) {
          seen.delete(id);
          callback({ id, ticketmasterId: id, isLiveTicketmasterEvent: true }, 'gone');
        }
      }
    } catch (err) {
      console.warn('live feed error', err);
    }
    if (!stopped) setTimeout(tick, intervalMs);
  };

  tick();
  return () => {
    stopped = true;
  };
};
