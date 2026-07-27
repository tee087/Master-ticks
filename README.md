# Ticketmaster React Native Mockup

A React Native app that visually mimics Ticketmaster's mobile experience with real API integration.

## Project Structure

```
ticketmaster-native-mockup/
├── android/                    # Android native configuration
├── ios/                       # iOS native configuration
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── Header.js         # App header with navigation
│   │   ├── EventCard.js      # Event display card
│   │   ├── EventDetail.js    # Event detail view
│   │   ├── Footer.js         # Footer section
│   │   └── CategoryTabs.js   # Category navigation tabs
│   ├── screens/              # Screen components
│   │   ├── HomeScreen.js     # Home screen
│   │   ├── ConcertsScreen.js # Concerts listing
│   │   ├── SportsScreen.js   # Sports listing
│   │   ├── TheaterScreen.js  # Theater listing
│   │   ├── FestivalsScreen.js # Festivals listing
│   │   ├── EventDetailScreen.js # Event detail screen
│   │   └── CheckoutScreen.js # Checkout flow
│   ├── navigation/           # React Navigation setup
│   │   └── AppNavigator.js   # Navigation container
│   ├── data/                 # Mock data (fallback)
│   │   └── mockData.js       # Events, venues, categories
│   ├── services/             # API services
│   │   └── api.js            # Ticketmaster Discovery API integration
│   └── styles/               # Styling
│       ├── theme.js          # Color palette and spacing
│       └── global.js         # Global styles
├── App.js                    # App entry point
├── index.js                  # Index entry point
└── package.json              # Dependencies
```

## Setup

```bash
cd ticketmaster-native-mockup
npm install
```

## Running

```bash
# Start Metro bundler
npm start

# Android
npm run android

# iOS
npm run ios
```

## Real Ticketmaster Integration

### Option 1: Use Ticketmaster Discovery API (Recommended)

1. **Get an API Key:**
   - Go to https://developer.ticketmaster.com/
   - Sign up for a developer account
   - Create an application and get your API key

2. **Set Environment Variables:**
   Create a `.env` file:
   ```
   TICKETMASTER_API_KEY=your_api_key_here
   ```

3. **API Endpoints Used:**
   - `GET /discovery/v2/events.json` - Search events
   - `GET /discovery/v2/events/{id}.json` - Get event details
   - `GET /discovery/v2/venues.json` - Search venues

### Option 2: Use Your Java Backend

The app is configured to connect to your Java backend at `http://localhost:8080/v1/`.

**Backend Endpoints:**
- `GET /v1/events` - List all events
- `GET /v1/events/{id}` - Get event by ID
- `POST /v1/event/{id}/reservation` - Create reservation

## Features

- Real API integration with Ticketmaster Discovery API
- Tab-based navigation (Home, Concerts, Sports, Theater, Festivals)
- Event cards with images, details, prices
- Event detail pages
- Checkout flow with seat selection
- Order summary
- Payment options
- Footer with links
- Fallback to mock data when API is unavailable

## Design

Uses Ticketmaster brand colors:
- Primary: #024ddf (blue)
- Secondary: #00a859 (green)
- Accent: #ff4b00 (orange)

## Architecture

The app follows a layered architecture:
- **Presentation Layer**: React Native components and screens
- **Navigation Layer**: React Navigation with tabs and stack
- **Data Layer**: Mock data and API services
- **Services Layer**: API service that fetches from Ticketmaster or backend