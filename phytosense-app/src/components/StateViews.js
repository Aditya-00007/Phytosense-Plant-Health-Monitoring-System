import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../theme';

export function LoadingView() {
  return (
    <View style={s.center}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

export function ErrorText({ message }) {
  return message ? <Text style={s.error}>{message}</Text> : null;
}

export function EmptyText({ message }) {
  return <Text style={s.empty}>{message}</Text>;
}

const s = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  error: { color: colors.danger, marginBottom: spacing.sm },
  empty: { color: colors.muted, textAlign: 'center', padding: spacing.lg },
});
