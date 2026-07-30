// Expo exposes EXPO_PUBLIC_* variables during development. The Maps key is
// also inserted into the native Android/iOS app configuration at build time.
const googleMapsApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

// Receiving Expo's resolved static config keeps app.json as the single source
// of truth while allowing this file to add build-time environment settings.
module.exports = ({ config }) => ({
  ...config,
  ios: {
    ...config.ios,
    ...(googleMapsApiKey
      ? { config: { ...config.ios?.config, googleMapsApiKey } }
      : {}),
  },
  android: {
    ...config.android,
    ...(googleMapsApiKey
      ? {
          config: {
            ...config.android?.config,
            googleMaps: {
              ...config.android?.config?.googleMaps,
              apiKey: googleMapsApiKey,
            },
          },
        }
      : {}),
  },
});
