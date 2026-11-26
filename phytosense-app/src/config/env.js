// Single place to point the app at your backend.
// Render free instances sleep, so the first request can take ~30-60s.
export const API_BASE_URL = 'https://phytosense.onrender.com';
export const REQUEST_TIMEOUT_MS = 60000;

// true  -> app runs on built-in sample data (plus live OpenWeatherMap weather)
// false -> app calls API_BASE_URL using the paths in services/endpoints.js
export const USE_MOCK = true;

// Set EXPO_PUBLIC_WEATHER_API_KEY in .env to override.
export const OPENWEATHER_API_KEY =
  process.env.EXPO_PUBLIC_WEATHER_API_KEY || 'f4923cb2515212f8108721ed67014dc5';
