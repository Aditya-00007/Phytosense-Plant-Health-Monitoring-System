import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import WeatherCard from '../../components/WeatherCard';
import AlertItem from '../../components/AlertItem';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import { EmptyText, ErrorText } from '../../components/StateViews';
import { useAuth } from '../../context/AuthContext';
import { useAlertsController } from '../../controllers/AlertsController';
import { getRegionFromLocation, getWeatherRiskFactors } from '../../utils/profile';
import { colors, spacing } from '../../theme';

const RISK_COLOR = { High: colors.danger, Medium: colors.warn, Low: colors.ok };

export default function AlertsView() {
  const { user } = useAuth();
  const c = useAlertsController();
  const region = getRegionFromLocation(user?.farmLocation);
  const risks = getWeatherRiskFactors(user);

  return (
    <ScreenContainer onRefresh={c.refresh} refreshing={c.refreshing}>
      <WeatherCard weather={c.weather} />
      <Card style={s.riskCard}>
        <Text style={s.riskTitle}>
          Regional Risk Profile{region ? ` (${region})` : user?.farmLocation ? ` (${user.farmLocation})` : ''}
        </Text>
        <View style={s.riskRow}>
          <Badge label={`Drought: ${risks.droughtRisk}`} color={RISK_COLOR[risks.droughtRisk]} />
          <Badge label={`Flood: ${risks.floodRisk}`} color={RISK_COLOR[risks.floodRisk]} />
          <Badge label={`Frost: ${risks.frostRisk}`} color={RISK_COLOR[risks.frostRisk]} />
        </View>
        {user?.receiveWeatherAlerts === false ? (
          <Text style={s.mutedNote}>Weather alert notifications are paused in your Farmer Profile.</Text>
        ) : null}
      </Card>
      <ErrorText message={c.error} />
      {c.alerts.length ? (
        c.alerts.map((a) => <AlertItem key={a.id} alert={a} />)
      ) : (
        <EmptyText message="No active alerts" />
      )}
    </ScreenContainer>
  );
}

const s = StyleSheet.create({
  riskCard: { marginVertical: spacing.md },
  riskTitle: { fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  riskRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  mutedNote: { color: colors.muted, fontSize: 12, marginTop: spacing.sm },
});
