import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../theme';

export default function Brand({ subtitle }) {
  return (
    <View style={s.wrap}>
      <Ionicons name="leaf" size={48} color={colors.primary} />
      <Text style={s.name}>PhytoSense</Text>
      {subtitle ? <Text style={s.sub}>{subtitle}</Text> : null}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { alignItems: 'center', marginVertical: spacing.xl },
  name: { fontSize: 28, fontWeight: '700', color: colors.primary, marginTop: spacing.sm },
  sub: { color: colors.muted, marginTop: spacing.xs, textAlign: 'center' },
});
