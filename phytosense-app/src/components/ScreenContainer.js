import React from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, layout, spacing } from '../theme';

// Page wrapper: safe area, scrolling, pull-to-refresh and a centred max-width column.
export default function ScreenContainer({ children, onRefresh, refreshing = false, style }) {
  return (
    <SafeAreaView edges={['bottom']} style={s.root}>
      <ScrollView
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
        refreshControl={onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} /> : undefined}
      >
        <View style={[s.inner, style]}>{children}</View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  scroll: { flexGrow: 1 },
  inner: { width: '100%', maxWidth: layout.maxWidth, alignSelf: 'center', padding: spacing.md },
});
