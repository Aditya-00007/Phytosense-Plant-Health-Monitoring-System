import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getWeatherBundle } from '../services/alertService';
import { getCoords } from '../utils/location';

// Shared by Home (summary) and Alerts (full weather + forecast + alerts).
export function useAlertsController() {
  const { user } = useAuth();
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [isLive, setIsLive] = useState(false);
  const [customLocation, setCustomLocation] = useState('');
  const [activeLocation, setActiveLocation] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(
    async (overrideLocation) => {
      try {
        setError(null);
        const manualLoc = (overrideLocation ?? activeLocation).trim();
        const profileLoc = (user?.farmLocation || '').trim();
        const location = manualLoc || profileLoc;
        const coords = manualLoc ? null : await getCoords();
        const bundle = await getWeatherBundle({
          coords,
          location: location || (coords ? '' : 'Pune, IN'),
        });
        setWeather(bundle.weather);
        setForecast(bundle.forecast);
        setAlerts(bundle.alerts);
        setIsLive(bundle.isLive);
      } catch (e) {
        setError(e.message);
      }
    },
    [user?.farmLocation, activeLocation],
  );

  useEffect(() => {
    load();
  }, [load]);

  const refresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const applyLocation = async () => {
    const loc = customLocation.trim();
    setActiveLocation(loc);
    setRefreshing(true);
    await load(loc);
    setRefreshing(false);
  };

  return {
    weather,
    forecast,
    alerts,
    isLive,
    customLocation,
    setCustomLocation,
    applyLocation,
    refreshing,
    refresh,
    error,
  };
}
