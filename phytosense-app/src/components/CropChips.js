import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../theme';

export default function CropChips({ crops, value, onChange }) {
  return (
    <View style={s.row}>
      {crops.map((c) => {
        const active = c === value;
        return (
          <Pressable key={c} onPress={() => onChange(c)} style={[s.chip, active && s.active]}>
            <Text style={[s.text, active && { color: '#fff' }]}>{c}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing.md },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  active: { backgroundColor: colors.primary, borderColor: colors.primary },
  text: { color: colors.text, fontWeight: '600' },
});
