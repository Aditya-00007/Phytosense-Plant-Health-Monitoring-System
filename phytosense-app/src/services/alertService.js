import { USE_MOCK } from '../config/env';
import { request } from './api';
import { ENDPOINTS } from './endpoints';
import { mock } from './mock';
import { fetchLiveForecast, fetchLiveWeather } from './weatherService';
import { Alert, ForecastDay, Weather } from '../models/Alert';

function buildQuery({ coords, location } = {}) {
  const params = new URLSearchParams();
  if (coords?.lat != null && coords?.lon != null) {
    params.set('lat', String(coords.lat));
    params.set('lon', String(coords.lon));
  } else if (location) {
    params.set('location', location);
  }
  const q = params.toString();
  return q ? `?${q}` : '';
}

export async function getWeatherBundle({ coords, location } = {}) {
  if (USE_MOCK) {
    try {
      const [{ weather, alerts }, forecast] = await Promise.all([
        fetchLiveWeather({ coords, location }),
        fetchLiveForecast({ coords, location }).catch(() => []),
      ]);
      return {
        weather: Weather.fromApi(weather),
        alerts: alerts.map(Alert.fromApi),
        forecast: forecast.map(ForecastDay.fromApi),
        isLive: true,
      };
    } catch {
      const [w, a] = await Promise.all([mock.weather(), mock.alerts()]);
      return {
        weather: Weather.fromApi(w),
        alerts: a.map(Alert.fromApi),
        forecast: [],
        isLive: false,
      };
    }
  }

  const q = buildQuery({ coords, location });
  const [w, a, f] = await Promise.all([
    request(ENDPOINTS.weather + q),
    request(ENDPOINTS.alerts + q),
    request(ENDPOINTS.forecast + q).catch(() => []),
  ]);
  const alertList = Array.isArray(a) ? a : a?.alerts ?? [];
  const forecastList = Array.isArray(f) ? f : f?.forecast ?? [];
  return {
    weather: Weather.fromApi(w),
    alerts: alertList.map(Alert.fromApi),
    forecast: forecastList.map(ForecastDay.fromApi),
    isLive: true,
  };
}

export async function getWeather(opts) {
  return (await getWeatherBundle(opts)).weather;
}

export async function getAlerts(opts) {
  return (await getWeatherBundle(opts)).alerts;
}
