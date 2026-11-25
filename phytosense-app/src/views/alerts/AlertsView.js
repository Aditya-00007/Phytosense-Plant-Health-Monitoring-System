import React from 'react';
import ScreenContainer from '../../components/ScreenContainer';
import WeatherCard from '../../components/WeatherCard';
import AlertItem from '../../components/AlertItem';
import { EmptyText, ErrorText } from '../../components/StateViews';
import { useAlertsController } from '../../controllers/AlertsController';
import { spacing } from '../../theme';

export default function AlertsView() {
  const c = useAlertsController();
  return (
    <ScreenContainer onRefresh={c.refresh} refreshing={c.refreshing}>
      <WeatherCard weather={c.weather} />
      <ErrorText message={c.error} />
      {c.alerts.length ? (
        c.alerts.map((a) => <AlertItem key={a.id} alert={a} />)
      ) : (
        <EmptyText message="No active alerts" />
      )}
    </ScreenContainer>
  );
}
