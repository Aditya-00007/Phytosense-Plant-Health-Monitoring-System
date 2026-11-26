import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '../../components/ScreenContainer';
import CropChips from '../../components/CropChips';
import Button from '../../components/Button';
import { ErrorText } from '../../components/StateViews';
import { useLanguage } from '../../context/LanguageContext';
import { useScanController } from '../../controllers/ScanController';
import { colors, radius, spacing } from '../../theme';

export default function ScanView({ navigation }) {
  const c = useScanController(navigation);
  const { t } = useLanguage();
  return (
    <ScreenContainer>
      <View style={s.preview}>
        {c.imageUri ? (
          <Image source={{ uri: c.imageUri }} style={s.image} />
        ) : (
          <>
            <Ionicons name="camera" size={48} color={colors.muted} />
            <Text style={s.hint}>{t('Capture or upload a clear photo of the leaf')}</Text>
          </>
        )}
      </View>
      <View style={s.row}>
        <Button title={t('Camera')} variant="outline" onPress={() => c.pickImage(true)} style={s.half} />
        <Button title={t('Gallery')} variant="outline" onPress={() => c.pickImage(false)} style={s.half} />
      </View>
      <Text style={s.label}>{t('Select crop')}</Text>
      <CropChips crops={c.crops} value={c.crop} onChange={c.setCrop} />
      <ErrorText message={t(c.error)} />
      <Button title={t('Analyze Plant')} onPress={c.analyze} loading={c.loading} disabled={!c.imageUri} />
    </ScreenContainer>
  );
}

const s = StyleSheet.create({
  preview: {
    height: 260,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  image: { width: '100%', height: '100%' },
  hint: { color: colors.muted, marginTop: spacing.sm, textAlign: 'center', paddingHorizontal: spacing.md },
  row: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  half: { flex: 1 },
  label: { fontWeight: '600', color: colors.text, marginBottom: spacing.sm },
});
