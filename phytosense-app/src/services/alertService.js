import { USE_MOCK } from '../config/env';
import { request } from './api';
import { ENDPOINTS } from './endpoints';
import { mock } from './mock';
import { Alert, Weather } from '../models/Alert';

const query = (c) => (c ? `?lat=${c.lat}&lon=${c.lon}` : '');

export async function getWeather(coords) {
  const raw = USE_MOCK ? await mock.weather() : await request(ENDPOINTS.weather + query(coords));
  return Weather.fromApi(raw);
}

export async function getAlerts(coords) {
  const raw = USE_MOCK ? await mock.alerts() : await request(ENDPOINTS.alerts + query(coords));
  return (Array.isArray(raw) ? raw : raw?.alerts ?? []).map(Alert.fromApi);
}
