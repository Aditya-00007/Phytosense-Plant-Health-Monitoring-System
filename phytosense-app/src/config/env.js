// Single place to point the app at your backend.
// Render free instances sleep, so the first request can take ~30-60s.
export const API_BASE_URL = 'https://phytosense.onrender.com';
export const REQUEST_TIMEOUT_MS = 60000;

// true  -> app runs fully on built-in sample data (no backend needed)
// false -> app calls API_BASE_URL using the paths in services/endpoints.js
export const USE_MOCK = true;
