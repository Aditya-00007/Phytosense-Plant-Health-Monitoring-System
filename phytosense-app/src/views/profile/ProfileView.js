import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '../../components/ScreenContainer';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing } from '../../theme';

export default function ProfileView() {
  const { user, signOut } = useAuth();
  return (
    <ScreenContainer>
      <Card style={s.card}>
        <Ionicons name="person-circle" size={72} color={colors.primary} />
        <View style={{ alignItems: 'center' }}>
          <Text style={s.name}>{user?.name}</Text>
          <Text style={s.email}>{user?.email}</Text>
        </View>
      </Card>
      <Button title="Sign out" variant="outline" onPress={signOut} style={{ marginTop: spacing.md }} />
    </ScreenContainer>
  );
}

const s = StyleSheet.create({
  card: { alignItems: 'center' },
  name: { fontSize: 20, fontWeight: '700', color: colors.text },
  email: { color: colors.muted },
});
