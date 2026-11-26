import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useLanguage } from '../context/LanguageContext';
import { colors, radius, spacing } from '../theme';

export default function LanguageSelector({ compact = false, style }) {
  const { lang, setLang, languages } = useLanguage();
  const visibleLangs = compact ? languages.slice(0, 3) : languages;

  return (
    <View style={[s.row, style]}>
      {visibleLangs.map((item) => {
        const active = item.code === lang;
        return (
          <Pressable
            key={item.code}
            onPress={() => setLang(item.code)}
            style={[s.pill, compact && s.pillCompact, active && s.active]}
          >
            <Text style={[s.text, compact && s.textCompact, active && s.textActive]}>
              {compact ? item.short : item.native}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.xs },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  pillCompact: { paddingHorizontal: 8, paddingVertical: 4 },
  active: { backgroundColor: colors.primaryMid, borderColor: colors.primaryMid },
  text: { fontSize: 12, fontWeight: '600', color: colors.text },
  textCompact: { fontSize: 11 },
  textActive: { color: '#fff' },
});
