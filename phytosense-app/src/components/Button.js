import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { colors, radius, shadows, spacing } from '../theme';

export default function Button({ title, onPress, loading, disabled, variant = 'primary', style }) {
  const outline = variant === 'outline';
  const off = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={off}
      style={({ pressed }) => [
        s.btn,
        !outline && shadows.button,
        outline && s.outline,
        off && s.off,
        pressed && s.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={outline ? colors.primary : '#fff'} />
      ) : (
        <Text style={[s.text, outline && { color: colors.primary }]}>{title}</Text>
      )}
    </Pressable>
  );
}

const s = StyleSheet.create({
  btn: {
    backgroundColor: colors.primaryMid,
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    marginVertical: spacing.xs,
  },
  outline: { backgroundColor: colors.card, borderWidth: 1.5, borderColor: colors.primaryMid },
  off: { opacity: 0.55 },
  pressed: { opacity: 0.88, transform: [{ scale: 0.99 }] },
  text: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
