import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../theme';

export default function CropChips({ crops, options, value, onChange, style }) {
  const items = options || crops || [];
  return (
    <View style={[s.row, style]}>
      {items.map((item) => {
        const active = item === value;
        return (
          <Pressable key={item} onPress={() => onChange(item)} style={[s.chip, active && s.active]}>
            <Text style={[s.text, active && { color: '#fff' }]}>{item}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  active: { backgroundColor: colors.primaryMid, borderColor: colors.primaryMid },
  text: { color: colors.text, fontWeight: '600', fontSize: 13 },
});
