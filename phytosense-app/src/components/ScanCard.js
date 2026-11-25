import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../theme';

export default function ScanCard({ onPress }) {
  return (
    <Pressable onPress={onPress} style={s.card}>
      <Ionicons name="scan" size={64} color={colors.primary} />
      <Text style={s.title}>Scan Plant</Text>
      <Text style={s.sub}>Detect • Diagnose • Grow Better</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: colors.primaryLight,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
  },
  title: { fontSize: 20, fontWeight: '700', color: colors.text, marginTop: spacing.sm },
  sub: { color: colors.muted, marginTop: spacing.xs },
});
