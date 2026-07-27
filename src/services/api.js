const API_BASE_URL = 'https://app.ticketmaster.com/discovery/v2';
const API_KEY = process.env.TICKETMASTER_API_KEY || 'YOUR_API_KEY_HERE';

const buildUrl = (endpoint, params = {}) => {
  const url = new URL(`${API_BASE_URL}${endpoint}`);
  url.searchParams.append('apikey', API_KEY);
  url.searchParams.append('locale', 'en');
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, value);
    }
  });
  return url.toString();
};

export const api = {
  getEvents: async (params = {}) => {
    try {
      const url = buildUrl('/events.json', {
        size: params.size || 20,
        page: params.page || 0,
        classificationName: params.category || 'Music',
        city: params.city,
        countryCode: params.country || 'US',
        ...params
      });
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      const data = await response.json();
      return data._embedded?.events || [];
    } catch (error) {
      console.error('API error:', error);
      return [];
    }
  },

  getEventById: async (id) => {
    try {
      const url = buildUrl(`/events/${id}.json`);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch event');
      }
      return await response.json();
    } catch (error) {
      console.error('API error:', error);
      return null;
    }
  },

  searchEvents: async (query) => {
    try {
      const url = buildUrl('/events.json', {
        keyword: query,
        size: 20
      });
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to search events');
      }
      const data = await response.json();
      return data._embedded?.events || [];
    } catch (error) {
      console.error('API error:', error);
      return [];
    }
  },

  getVenues: async (params = {}) => {
    try {
      const url = buildUrl('/venues.json', {
        size: params.size || 20,
        city: params.city,
        countryCode: params.country || 'US'
      });
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch venues');
      }
      const data = await response.json();
      return data._embedded?.venues || [];
    } catch (error) {
      console.error('API error:', error);
      return [];
    }
  },

  createReservation: async (reservationData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve('reservation-' + Date.now());
      }, 1000);
    });
  },
};