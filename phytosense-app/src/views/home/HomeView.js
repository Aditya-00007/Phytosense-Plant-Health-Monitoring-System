import React from 'react';
import { StyleSheet, Text } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import ResponsiveGrid from '../../components/ResponsiveGrid';
import ScanCard from '../../components/ScanCard';
import WeatherCard from '../../components/WeatherCard';
import AlertItem from '../../components/AlertItem';
import Card from '../../components/Card';
import { useAuth } from '../../context/AuthContext';
import { useAlertsController } from '../../controllers/AlertsController';
import { colors, spacing } from '../../theme';

export default function HomeView({ navigation }) {
  const { user } = useAuth();
  const { weather, alerts, refreshing, refresh } = useAlertsController();

  return (
    <ScreenContainer onRefresh={refresh} refreshing={refreshing}>
      <Text style={s.hello}>Hello, {user?.name} 👋</Text>
      <ResponsiveGrid>
        <ScanCard onPress={() => navigation.navigate('Scan')} />
        <WeatherCard weather={weather} />
        {alerts.length ? (
          <AlertItem alert={alerts[0]} />
        ) : (
          <Card><Text style={s.none}>No active alerts</Text></Card>
        )}
      </ResponsiveGrid>
    </ScreenContainer>
  );
}

const s = StyleSheet.create({
  hello: { fontSize: 22, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
  none: { color: colors.muted },
});
