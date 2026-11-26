import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../context/LanguageContext';
import { colors, shadows, spacing } from '../theme';

export default function Brand({ subtitle }) {
  const { t } = useLanguage();
  return (
    <View style={s.wrap}>
      <View style={s.iconBadge}>
        <Ionicons name="leaf" size={40} color={colors.primary} />
      </View>
      <Text style={s.name}>{t('PhytoSense')}</Text>
      {subtitle ? <Text style={s.sub}>{t(subtitle)}</Text> : null}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { alignItems: 'center', marginVertical: spacing.lg },
  iconBadge: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.primaryLight,
    borderWidth: 2,
    borderColor: colors.primaryMid,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
  name: { fontSize: 28, fontWeight: '700', color: colors.primary, marginTop: spacing.sm },
  sub: { color: colors.muted, marginTop: spacing.xs, textAlign: 'center' },
});
