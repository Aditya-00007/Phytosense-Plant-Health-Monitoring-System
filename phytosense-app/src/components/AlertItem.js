import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from './Card';
import { useLanguage } from '../context/LanguageContext';
import { timeAgo } from '../models/Post';
import { colors, spacing } from '../theme';

const SEVERITY = {
  info: { icon: 'information-circle', color: colors.primary },
  warning: { icon: 'warning', color: colors.warn },
  danger: { icon: 'alert-circle', color: colors.danger },
};

export default function AlertItem({ alert }) {
  const { t } = useLanguage();
  const { icon, color } = SEVERITY[alert.severity] || SEVERITY.info;

  return (
    <Card style={s.card}>
      <Ionicons name={icon} size={26} color={color} />
      <View style={s.body}>
        <Text style={s.title}>{t(alert.title)}</Text>
        <Text style={s.msg}>{t(alert.message)}</Text>
        {alert.recommendations?.length ? (
          <View style={s.recs}>
            <Text style={s.recsTitle}>{t('Recommendations')}:</Text>
            {alert.recommendations.map((rec, i) => (
              <Text key={i} style={s.recItem}>• {t(rec)}</Text>
            ))}
          </View>
        ) : null}
        <Text style={s.time}>{timeAgo(alert.createdAt)}</Text>
      </View>
    </Card>
  );
}

const s = StyleSheet.create({
  card: { flexDirection: 'row', marginBottom: spacing.sm },
  body: { flex: 1, marginLeft: spacing.md },
  title: { fontWeight: '700', color: colors.text },
  msg: { color: colors.text, marginTop: 2, lineHeight: 20 },
  recs: { marginTop: spacing.xs, paddingTop: spacing.xs, borderTopWidth: 1, borderTopColor: colors.surfaceTint },
  recsTitle: { fontSize: 12, fontWeight: '700', color: colors.primary, marginBottom: 2 },
  recItem: { fontSize: 12, color: colors.muted, lineHeight: 18 },
  time: { color: colors.muted, fontSize: 12, marginTop: spacing.xs },
});
