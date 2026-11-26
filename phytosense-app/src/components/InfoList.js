import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from './Card';
import { useLanguage } from '../context/LanguageContext';
import { colors, spacing } from '../theme';

// Titled card with bullet items (causes, treatment, prevention, irrigation...).
export default function InfoList({ title, icon, items }) {
  const { t } = useLanguage();
  if (!items?.length) return null;
  return (
    <Card style={{ flex: 1 }}>
      <View style={s.head}>
        <Ionicons name={icon} size={20} color={colors.primary} />
        <Text style={s.title}>{t(title)}</Text>
      </View>
      {items.map((it, i) => (
        <Text key={i} style={s.item}>• {t(it)}</Text>
      ))}
    </Card>
  );
}

const s = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  title: { fontSize: 16, fontWeight: '700', color: colors.text, marginLeft: spacing.sm },
  item: { color: colors.text, marginBottom: spacing.xs, lineHeight: 20 },
});
