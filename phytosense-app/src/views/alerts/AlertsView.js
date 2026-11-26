import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import WeatherCard from '../../components/WeatherCard';
import AlertItem from '../../components/AlertItem';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import TextField from '../../components/TextField';
import Button from '../../components/Button';
import { EmptyText, ErrorText } from '../../components/StateViews';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAlertsController } from '../../controllers/AlertsController';
import { getWeatherIconUrl } from '../../services/weatherService';
import { getRegionFromLocation, getWeatherRiskFactors } from '../../utils/profile';
import { colors, radius, spacing } from '../../theme';

const RISK_COLOR = { High: colors.danger, Medium: colors.warn, Low: colors.ok };

export default function AlertsView() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const c = useAlertsController();
  const region = getRegionFromLocation(user?.farmLocation);
  const risks = getWeatherRiskFactors(user);
  const { weather } = c;

  return (
    <ScreenContainer onRefresh={c.refresh} refreshing={c.refreshing}>
      <View style={s.locRow}>
        <View style={{ flex: 1 }}>
          <TextField
            label={t('Check Weather for City')}
            value={c.customLocation}
            onChangeText={c.setCustomLocation}
            placeholder={user?.farmLocation || 'e.g., Pune, Nashik, Nagpur'}
            style={{ marginBottom: 0 }}
          />
        </View>
        <Button title={t('Update')} onPress={c.applyLocation} loading={c.refreshing} style={s.locBtn} />
      </View>

      <WeatherCard weather={weather} />

      {weather && (weather.uvIndex != null || weather.solarRadiation || weather.et0) ? (
        <Card style={s.sectionCard}>
          <Text style={s.sectionTitle}>{t('Agricultural Metrics')}</Text>
          <View style={s.metricsRow}>
            <View style={s.metricBox}>
              <Text style={s.metricLabel}>{t('UV Index')}</Text>
              <Text style={s.metricVal}>{weather.uvIndex}</Text>
              <Text style={s.metricSub}>{t(weather.uvRisk)}</Text>
            </View>
            <View style={s.metricBox}>
              <Text style={s.metricLabel}>{t('Solar Radiation')}</Text>
              <Text style={s.metricVal}>{weather.solarRadiation}</Text>
              <Text style={s.metricSub}>W/m²</Text>
            </View>
            <View style={s.metricBox}>
              <Text style={s.metricLabel}>{t('Evapotranspiration (ET₀)')}</Text>
              <Text style={s.metricVal}>{weather.et0}</Text>
              <Text style={s.metricSub}>mm/day</Text>
            </View>
          </View>
        </Card>
      ) : null}

      <Card style={s.sectionCard}>
        <Text style={s.sectionTitle}>
          {t('Regional Risk Profile')}
          {region ? ` (${region})` : user?.farmLocation ? ` (${user.farmLocation})` : ''}
        </Text>
        <View style={s.riskRow}>
          <Badge label={`${t('Drought')}: ${t(risks.droughtRisk)}`} color={RISK_COLOR[risks.droughtRisk]} />
          <Badge label={`${t('Flood')}: ${t(risks.floodRisk)}`} color={RISK_COLOR[risks.floodRisk]} />
          <Badge label={`${t('Frost')}: ${t(risks.frostRisk)}`} color={RISK_COLOR[risks.frostRisk]} />
        </View>
        {user?.receiveWeatherAlerts === false ? (
          <Text style={s.mutedNote}>{t('Weather alert notifications are paused in your Farmer Profile.')}</Text>
        ) : null}
      </Card>

      {c.forecast?.length ? (
        <Card style={s.sectionCard}>
          <Text style={s.sectionTitle}>{t('5-Day Forecast')}</Text>
          {c.forecast.map((day) => {
            const iconUrl = getWeatherIconUrl(day.weatherIcon);
            return (
              <View key={day.day} style={s.forecastRow}>
                {iconUrl ? <Image source={{ uri: iconUrl }} style={s.forecastIcon} /> : null}
                <View style={{ flex: 1 }}>
                  <Text style={s.forecastDay}>
                    {t(day.dayName)} • {day.day}
                  </Text>
                  <Text style={s.forecastStats}>
                    {`${t(day.weatherDescription)} • ${day.minTemp}°C – ${day.maxTemp}°C • ${t('Humidity')} ${day.avgHumidity}%`}
                    {day.totalRain > 0 ? ` • ${t('Rain')} ${day.totalRain} mm` : ''}
                  </Text>
                  {day.advice?.[0] ? <Text style={s.forecastAdvice}>• {t(day.advice[0])}</Text> : null}
                </View>
              </View>
            );
          })}
        </Card>
      ) : null}

      <Text style={s.alertsHeader}>{t('Weather Alerts')}</Text>
      <ErrorText message={t(c.error)} />
      {c.alerts.length ? (
        c.alerts.map((a) => <AlertItem key={a.id} alert={a} />)
      ) : (
        <EmptyText message={t('No active weather alerts')} />
      )}
    </ScreenContainer>
  );
}

const s = StyleSheet.create({
  locRow: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm, marginBottom: spacing.md },
  locBtn: { marginBottom: spacing.md, paddingHorizontal: spacing.md },
  sectionCard: { marginTop: spacing.md },
  sectionTitle: { fontWeight: '700', color: colors.primary, marginBottom: spacing.sm, fontSize: 15 },
  metricsRow: { flexDirection: 'row', gap: spacing.sm },
  metricBox: {
    flex: 1,
    backgroundColor: colors.surfaceTint,
    borderRadius: radius.sm,
    padding: spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  metricLabel: { fontSize: 11, color: colors.muted, fontWeight: '600', textAlign: 'center' },
  metricVal: { fontSize: 18, fontWeight: '700', color: colors.text, marginTop: 2 },
  metricSub: { fontSize: 11, color: colors.primary, fontWeight: '600' },
  riskRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  mutedNote: { color: colors.muted, fontSize: 12, marginTop: spacing.sm },
  forecastRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceTint,
    gap: spacing.sm,
  },
  forecastIcon: { width: 42, height: 42 },
  forecastDay: { fontWeight: '700', color: colors.text },
  forecastStats: { fontSize: 12, color: colors.muted, marginTop: 2 },
  forecastAdvice: { fontSize: 12, color: colors.primary, marginTop: 2 },
  alertsHeader: { fontWeight: '700', color: colors.text, fontSize: 16, marginTop: spacing.md, marginBottom: spacing.sm },
});
