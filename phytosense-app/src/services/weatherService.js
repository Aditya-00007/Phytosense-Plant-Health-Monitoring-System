import { OPENWEATHER_API_KEY } from '../config/env';
import { storage } from '../utils/storage';

const OWM_BASE = 'https://api.openweathermap.org/data/2.5';
const CACHE_TTL_MS = 3600 * 1000; // 1 hour
const memCache = new Map();

const WIND_DIRS = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const UV_BASE = { 1: 3, 2: 4, 3: 6, 4: 8, 5: 9, 6: 10, 7: 9, 8: 8, 9: 6, 10: 4, 11: 3, 12: 2 };
const SOLAR_MAX = { 1: 500, 2: 600, 3: 700, 4: 800, 5: 900, 6: 1000, 7: 950, 8: 850, 9: 750, 10: 650, 11: 550, 12: 450 };

export function getWeatherIconUrl(iconCode) {
  return iconCode ? `https://openweathermap.org/img/wn/${iconCode}@2x.png` : null;
}

export function getWindDirection(deg) {
  if (deg == null) return 'Unknown';
  return WIND_DIRS[Math.round(deg / 22.5) % 16];
}

export function estimateUvIndex(raw) {
  const clouds = raw?.clouds?.all ?? 0;
  const dt = raw?.dt ? new Date(raw.dt * 1000) : new Date();
  const base = UV_BASE[dt.getMonth() + 1] ?? 5;
  const timeFactor = Math.max(0.1, 1 - Math.abs(12 - dt.getHours()) / 12);
  return Math.round(Math.max(0, Math.min(12, base * timeFactor * (1 - (clouds / 100) * 0.7))));
}

export function getUvRiskLevel(uv) {
  if (uv < 3) return 'Low';
  if (uv < 6) return 'Moderate';
  if (uv < 8) return 'High';
  if (uv < 11) return 'Very High';
  return 'Extreme';
}

export function estimateSolarRadiation(raw) {
  const clouds = raw?.clouds?.all ?? 0;
  const dt = raw?.dt ? new Date(raw.dt * 1000) : new Date();
  const maxRad = SOLAR_MAX[dt.getMonth() + 1] ?? 700;
  const timeFactor = Math.max(0.05, 1 - Math.abs(12 - dt.getHours()) / 12);
  return Math.round(Math.max(0, Math.min(1200, maxRad * timeFactor * (1 - (clouds / 100) * 0.8))));
}

export function calculateEvapotranspiration(raw) {
  const temp = raw?.main?.temp;
  const humidity = raw?.main?.humidity;
  const windSpeed = raw?.wind?.speed ?? 0;
  if (temp == null || humidity == null) return 0;

  const solarMj = estimateSolarRadiation(raw) * 0.0864;
  const es = 0.6108 * Math.exp((17.27 * temp) / (temp + 237.3));
  const ea = es * (humidity / 100);
  const delta = (4098 * es) / Math.pow(temp + 237.3, 2);
  const gamma = 0.665e-3 * 101.3;
  const num = 0.408 * delta * solarMj + gamma * (900 / (temp + 273)) * windSpeed * (es - ea);
  const den = delta + gamma * (1 + 0.34 * windSpeed);
  return den ? Math.max(0, Math.round((num / den) * 10) / 10) : 0;
}

function cacheKey(endpoint, { coords, location }) {
  if (coords?.lat != null && coords?.lon != null) {
    return `owm_${endpoint}_${coords.lat.toFixed(2)}_${coords.lon.toFixed(2)}`;
  }
  return `owm_${endpoint}_${String(location || '').trim().toLowerCase()}`;
}

async function fetchOwm(endpoint, { coords, location } = {}) {
  if (!OPENWEATHER_API_KEY) throw new Error('Weather API key not configured');
  const hasCoords = coords?.lat != null && coords?.lon != null;
  const loc = String(location || '').trim();
  if (!hasCoords && !loc) throw new Error('Location is required to fetch weather');

  const key = cacheKey(endpoint, { coords, location: loc });
  const now = Date.now();
  const mem = memCache.get(key);
  if (mem && now - mem.ts < CACHE_TTL_MS) return mem.data;

  const diskRaw = await storage.get(key);
  if (diskRaw) {
    try {
      const parsed = JSON.parse(diskRaw);
      if (parsed?.ts && now - parsed.ts < CACHE_TTL_MS && parsed.data) {
        memCache.set(key, parsed);
        return parsed.data;
      }
    } catch {}
  }

  const params = new URLSearchParams({ appid: OPENWEATHER_API_KEY, units: 'metric' });
  if (hasCoords) {
    params.set('lat', String(coords.lat));
    params.set('lon', String(coords.lon));
  } else {
    params.set('q', loc);
  }

  const res = await fetch(`${OWM_BASE}/${endpoint}?${params.toString()}`);
  if (!res.ok) throw new Error(`Weather API error (${res.status})`);
  const data = await res.json();

  const entry = { ts: now, data };
  memCache.set(key, entry);
  await storage.set(key, JSON.stringify(entry));
  return data;
}

export function normalizeCurrentWeather(raw) {
  const main = raw?.main ?? {};
  const wind = raw?.wind ?? {};
  const w = raw?.weather?.[0] ?? {};
  const uvIndex = estimateUvIndex(raw);
  const desc = w.description ? w.description.charAt(0).toUpperCase() + w.description.slice(1) : 'Clear';

  return {
    temp: main.temp ?? 0,
    feelsLike: main.feels_like ?? main.temp ?? 0,
    condition: desc,
    humidity: main.humidity ?? null,
    pressure: main.pressure ?? null,
    windSpeed: Math.round((wind.speed ?? 0) * 10) / 10,
    windDir: getWindDirection(wind.deg),
    rain1h: raw?.rain?.['1h'] ?? 0,
    clouds: raw?.clouds?.all ?? 0,
    icon: w.icon ?? null,
    locationName: raw?.name ?? '',
    uvIndex,
    uvRisk: getUvRiskLevel(uvIndex),
    solarRadiation: estimateSolarRadiation(raw),
    et0: calculateEvapotranspiration(raw),
  };
}

export function deriveWeatherAlerts(raw) {
  const alerts = [];
  const main = raw?.main ?? {};
  const wind = raw?.wind ?? {};
  const rain1h = raw?.rain?.['1h'] ?? 0;
  const rain3h = raw?.rain?.['3h'] ?? 0;
  const weatherId = raw?.weather?.[0]?.id;

  if (main.temp != null) {
    if (main.temp > 38) {
      alerts.push({
        id: 'heat-extreme',
        title: 'Extreme Heat Warning',
        message: 'Dangerously high temperatures may cause heat stress in crops.',
        severity: 'danger',
        recommendations: ['Increase irrigation frequency', 'Provide shade for sensitive crops', 'Avoid midday spraying'],
      });
    } else if (main.temp > 32) {
      alerts.push({
        id: 'heat-high',
        title: 'High Temperature Alert',
        message: 'Elevated temperatures increase crop evaporation.',
        severity: 'warning',
        recommendations: ['Adjust irrigation schedule for higher evaporation', 'Apply mulch to retain soil moisture'],
      });
    } else if (main.temp < 0) {
      alerts.push({
        id: 'frost-freeze',
        title: 'Freezing Conditions',
        message: 'Freezing temperatures pose risk of frost damage to crops.',
        severity: 'danger',
        recommendations: ['Protect sensitive crops with frost covers or mulch', 'Harvest mature sensitive crops'],
      });
    } else if (main.temp < 5) {
      alerts.push({
        id: 'cold-alert',
        title: 'Cold Temperature Alert',
        message: 'Cold conditions may slow plant growth.',
        severity: 'warning',
        recommendations: ['Delay planting sensitive seedlings', 'Monitor young plants for cold stress'],
      });
    }
  }

  if (main.humidity != null) {
    if (main.humidity > 85) {
      alerts.push({
        id: 'humidity-high',
        title: 'High Humidity Alert',
        message: 'High humidity increases fungal disease risk.',
        severity: 'warning',
        recommendations: ['Monitor crops for fungal infection', 'Avoid overhead irrigation to keep leaves dry'],
      });
    } else if (main.humidity < 30) {
      alerts.push({
        id: 'humidity-low',
        title: 'Low Humidity Alert',
        message: 'Low humidity increases water loss through transpiration.',
        severity: 'warning',
        recommendations: ['Increase irrigation frequency', 'Apply mulch to reduce soil moisture evaporation'],
      });
    }
  }

  if (rain1h > 10 || rain3h > 20) {
    alerts.push({
      id: 'rain-heavy',
      title: 'Heavy Rainfall Warning',
      message: 'Heavy rain may cause waterlogging and soil erosion.',
      severity: 'danger',
      recommendations: ['Check and clear drainage channels', 'Postpone fertilizer and spray applications'],
    });
  } else if (rain1h > 5 || rain3h > 10) {
    alerts.push({
      id: 'rain-moderate',
      title: 'Moderate Rainfall Alert',
      message: 'Moderate rain may affect spraying and field operations.',
      severity: 'warning',
      recommendations: ['Check field drainage systems', 'Delay foliar spraying until dry'],
    });
  }

  if (wind.speed != null) {
    if (wind.speed > 15 || (wind.gust && wind.gust > 20)) {
      alerts.push({
        id: 'wind-high',
        title: 'High Wind Warning',
        message: 'Strong winds may damage tall crops and structures.',
        severity: 'danger',
        recommendations: ['Stake or support tall crops', 'Postpone pesticide applications to prevent drift'],
      });
    } else if (wind.speed > 10) {
      alerts.push({
        id: 'wind-mod',
        title: 'Windy Conditions',
        message: 'Moderate winds increase evaporation and spray drift.',
        severity: 'warning',
        recommendations: ['Avoid spraying pesticides in windy conditions'],
      });
    }
  }

  if (weatherId >= 200 && weatherId < 300) {
    alerts.push({
      id: 'storm',
      title: 'Thunderstorm Alert',
      message: 'Thunderstorms may bring lightning, hail, and strong gusts.',
      severity: 'danger',
      recommendations: ['Seek shelter indoors', 'Protect nurseries from potential hail'],
    });
  }

  if (main.pressure != null && main.pressure < 980) {
    alerts.push({
      id: 'pressure-low',
      title: 'Low Pressure System',
      message: 'Low pressure may indicate approaching stormy weather.',
      severity: 'warning',
      recommendations: ['Prepare drainage systems for potential heavy rain'],
    });
  }

  return alerts;
}

export function formatForecastData(raw) {
  const list = raw?.list;
  if (!Array.isArray(list) || !list.length) return [];

  const days = new Map();
  for (const entry of list) {
    const dt = new Date(entry.dt * 1000);
    const key = dt.toISOString().slice(0, 10);
    if (!days.has(key)) days.set(key, []);
    days.get(key).push(entry);
  }

  const out = [];
  for (const [day, entries] of Array.from(days.entries()).slice(0, 5)) {
    const dt = new Date(`${day}T12:00:00`);
    const dayName = DAY_NAMES[dt.getDay()];

    const counts = new Map();
    for (const e of entries) {
      const desc = e.weather?.[0]?.description || 'clear sky';
      counts.set(desc, (counts.get(desc) || 0) + 1);
    }
    const commonDesc = Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0][0];
    const commonIcon = entries.find((e) => e.weather?.[0]?.description === commonDesc)?.weather?.[0]?.icon ?? entries[0]?.weather?.[0]?.icon ?? null;

    const minTemp = Math.min(...entries.map((e) => e.main.temp_min));
    const maxTemp = Math.max(...entries.map((e) => e.main.temp_max));
    const avgHumidity = Math.round(entries.reduce((s, e) => s + e.main.humidity, 0) / entries.length);
    const totalRain = Math.round(entries.reduce((s, e) => s + (e.rain?.['3h'] ?? 0), 0) * 10) / 10;
    const avgWindSpeed = Math.round((entries.reduce((s, e) => s + (e.wind?.speed ?? 0), 0) / entries.length) * 10) / 10;

    const advice = [];
    if (maxTemp > 35) advice.push('Increase irrigation frequency and avoid midday fieldwork');
    else if (minTemp < 5) advice.push('Protect frost-sensitive crops overnight');
    if (totalRain > 10) advice.push('Check drainage channels and postpone fertilizer application');
    else if (totalRain > 2) advice.push('Reduce irrigation and monitor for fungal issues');
    if (avgWindSpeed > 10) advice.push('Avoid pesticide spraying due to wind drift');
    if (!advice.length) advice.push('Good conditions for routine field operations');

    out.push({
      day,
      dayName,
      minTemp: Math.round(minTemp * 10) / 10,
      maxTemp: Math.round(maxTemp * 10) / 10,
      avgHumidity,
      totalRain,
      avgWindSpeed,
      weatherDescription: commonDesc.charAt(0).toUpperCase() + commonDesc.slice(1),
      weatherIcon: commonIcon,
      advice,
    });
  }
  return out;
}

export async function fetchLiveWeather({ coords, location }) {
  const raw = await fetchOwm('weather', { coords, location });
  return {
    weather: normalizeCurrentWeather(raw),
    alerts: deriveWeatherAlerts(raw),
  };
}

export async function fetchLiveForecast({ coords, location }) {
  const raw = await fetchOwm('forecast', { coords, location });
  return formatForecastData(raw);
}
