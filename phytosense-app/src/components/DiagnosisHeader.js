import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import Card from './Card';
import Badge from './Badge';
import { useLanguage } from '../context/LanguageContext';
import { Diagnosis } from '../models/Diagnosis';
import { colors, radius, spacing } from '../theme';

export default function DiagnosisHeader({ diagnosis }) {
  const { t } = useLanguage();
  const low = Diagnosis.isLowConfidence(diagnosis);
  return (
    <Card style={s.card}>
      {diagnosis.imageUri ? <Image source={{ uri: diagnosis.imageUri }} style={s.image} /> : null}
      <View style={s.body}>
        <Badge
          label={`${Diagnosis.percent(diagnosis)} ${t('confidence')}`}
          color={low ? colors.warn : colors.ok}
        />
        <Text style={s.disease}>{t(diagnosis.disease)}</Text>
        <Text style={s.crop}>({t(diagnosis.crop)})</Text>
        {diagnosis.explanation ? <Text style={s.text}>{t(diagnosis.explanation)}</Text> : null}
        {low ? (
          <Text style={s.warn}>{t('Low confidence. Retake the photo in good light or ask the community.')}</Text>
        ) : null}
      </View>
    </Card>
  );
}

const s = StyleSheet.create({
  card: { padding: 0, overflow: 'hidden' },
  image: { width: '100%', height: 220, backgroundColor: colors.primaryLight },
  body: { padding: spacing.md },
  disease: { fontSize: 24, fontWeight: '700', color: colors.text, marginTop: spacing.sm },
  crop: { color: colors.muted, marginBottom: spacing.sm },
  text: { color: colors.text, lineHeight: 20 },
  warn: { color: colors.warn, marginTop: spacing.sm, fontWeight: '600', borderRadius: radius.sm },
});
