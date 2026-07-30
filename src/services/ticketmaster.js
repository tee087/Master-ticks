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

export const fetchTicketmasterEvents = async ({ keyword = '', category = 'events', page = 0, countryCode = 'US' }) => {
  const apiKey = Constants?.manifest?.extra?.ticketmasterApiKey || process.env.EXPO_PUBLIC_TICKETMASTER_API_KEY;
  if (!apiKey) return { events: [], hasMore: false };

  const params = new URLSearchParams({ apikey: apiKey, size: '20', page: String(page), countryCode });
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
