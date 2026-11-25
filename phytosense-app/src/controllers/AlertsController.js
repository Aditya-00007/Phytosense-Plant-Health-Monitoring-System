import { useCallback, useEffect, useState } from 'react';
import { getAlerts, getWeather } from '../services/alertService';
import { getCoords } from '../utils/location';

// Shared by Home (summary) and Alerts (full list).
export function useAlertsController() {
  const [weather, setWeather] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const coords = await getCoords();
      const [w, a] = await Promise.all([getWeather(coords), getAlerts(coords)]);
      setWeather(w);
      setAlerts(a);
    } catch (e) {
      setError(e.message);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const refresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  return { weather, alerts, refreshing, refresh, error };
}
