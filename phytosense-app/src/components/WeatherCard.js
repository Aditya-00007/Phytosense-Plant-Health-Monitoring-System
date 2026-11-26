import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from './Card';
import { useLanguage } from '../context/LanguageContext';
import { getWeatherIconUrl } from '../services/weatherService';
import { colors, spacing } from '../theme';

export default function WeatherCard({ weather }) {
  const { t } = useLanguage();
  const iconUrl = getWeatherIconUrl(weather?.icon);

  return (
    <Card style={s.card}>
      {iconUrl ? (
        <Image source={{ uri: iconUrl }} style={s.owmIcon} />
      ) : (
        <Ionicons name="partly-sunny" size={38} color={colors.accent} />
      )}
      <View style={s.body}>
        <Text style={s.title}>
          {t('Local Weather')}
          {weather?.locationName ? ` • ${weather.locationName}` : ''}
        </Text>
        <Text style={s.value}>
          {weather ? `${t(weather.condition)}, ${weather.temp}°C` : t('Loading...')}
        </Text>
        {weather ? (
          <Text style={s.sub}>
            {`${t('Feels like')} ${weather.feelsLike}°C`}
            {weather.humidity != null ? ` • ${t('Humidity')} ${weather.humidity}%` : ''}
            {weather.windSpeed != null ? ` • ${t('Wind')} ${weather.windSpeed} m/s ${weather.windDir || ''}` : ''}
          </Text>
        ) : null}
      </View>
    </Card>
  );
}

const s = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center' },
  owmIcon: { width: 54, height: 54 },
  body: { marginLeft: spacing.md, flex: 1 },
  title: { color: colors.muted, fontWeight: '600', fontSize: 13 },
  value: { fontSize: 18, fontWeight: '700', color: colors.text, marginTop: 2 },
  sub: { color: colors.muted, fontSize: 12, marginTop: 2 },
});
