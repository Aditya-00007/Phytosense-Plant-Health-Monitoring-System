import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius } from '../theme';

export default function Badge({ label, color = colors.ok }) {
  return (
    <View style={[s.badge, { backgroundColor: color }]}>
      <Text style={s.text}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.lg, alignSelf: 'flex-start' },
  text: { color: '#fff', fontWeight: '600', fontSize: 12 },
});
