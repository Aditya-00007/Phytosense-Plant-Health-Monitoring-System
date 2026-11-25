import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, shadows, spacing } from '../theme';

export default function ScanCard({ onPress }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [s.card, pressed && s.pressed]}>
      <View style={s.iconWrap}>
        <Ionicons name="scan" size={44} color={colors.primary} />
      </View>
      <Text style={s.title}>Scan Plant</Text>
      <Text style={s.sub}>Detect • Diagnose • Grow Better</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: colors.primaryLight,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.primaryMid,
    padding: spacing.lg,
    alignItems: 'center',
    ...shadows.card,
  },
  pressed: { opacity: 0.9, transform: [{ scale: 0.99 }] },
  iconWrap: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 20, fontWeight: '700', color: colors.primary, marginTop: spacing.sm },
  sub: { color: colors.muted, marginTop: spacing.xs },
});
