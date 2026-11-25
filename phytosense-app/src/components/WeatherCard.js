import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from './Card';
import { colors, spacing } from '../theme';

export default function WeatherCard({ weather }) {
  return (
    <Card style={s.card}>
      <Ionicons name="partly-sunny" size={36} color={colors.accent} />
      <View style={{ marginLeft: spacing.md }}>
        <Text style={s.title}>Local Weather</Text>
        <Text style={s.value}>
          {weather ? `${weather.condition}, ${weather.temp}°C` : 'Loading...'}
        </Text>
        {weather?.humidity != null ? <Text style={s.sub}>Humidity {weather.humidity}%</Text> : null}
      </View>
    </Card>
  );
}

const s = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center' },
  title: { color: colors.muted, fontWeight: '600' },
  value: { fontSize: 18, fontWeight: '700', color: colors.text },
  sub: { color: colors.muted },
});
