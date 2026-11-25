import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '../../components/ScreenContainer';
import ResponsiveGrid from '../../components/ResponsiveGrid';
import ScanCard from '../../components/ScanCard';
import WeatherCard from '../../components/WeatherCard';
import AlertItem from '../../components/AlertItem';
import Card from '../../components/Card';
import { useAuth } from '../../context/AuthContext';
import { useAlertsController } from '../../controllers/AlertsController';
import { getFarmSizeCategory, getMainCrop, getRegionFromLocation, getSeasonDetails } from '../../utils/profile';
import { colors, radius, spacing } from '../../theme';

export default function HomeView({ navigation }) {
  const { user } = useAuth();
  const { weather, alerts, refreshing, refresh } = useAlertsController();
  const season = getSeasonDetails(user?.farmLocation);
  const region = getRegionFromLocation(user?.farmLocation);
  const sizeCategory = getFarmSizeCategory(user?.farmSize);
  const mainCrop = getMainCrop(user);

  return (
    <ScreenContainer onRefresh={refresh} refreshing={refreshing}>
      <View style={s.banner}>
        <View style={{ flex: 1 }}>
          <Text style={s.hello}>Hello, {user?.name}</Text>
          <Text style={s.subBanner}>
            {[user?.farmLocation || 'Set farm location', region, mainCrop ? `Main crop: ${mainCrop}` : null]
              .filter(Boolean)
              .join(' • ')}
          </Text>
        </View>
        <Pressable onPress={() => navigation.navigate('Profile')} style={s.profilePill}>
          <Ionicons name="person-outline" size={16} color={colors.primary} />
          <Text style={s.profilePillText}>Profile</Text>
        </Pressable>
      </View>

      <ResponsiveGrid>
        <ScanCard onPress={() => navigation.navigate('Scan')} />
        <WeatherCard weather={weather} />
        <Card>
          <View style={[s.seasonBadge, { backgroundColor: season.color }]}>
            <Ionicons name={season.icon} size={18} color="#fff" />
            <Text style={s.seasonText}>{season.season}</Text>
          </View>
          {season.tips.slice(0, 2).map((tip, idx) => (
            <Text key={idx} style={s.tip}>• {tip}</Text>
          ))}
          {user?.farmSize ? (
            <Text style={s.farmMeta}>
              Farm: {user.farmSize} acres{sizeCategory !== 'Unknown' ? ` (${sizeCategory})` : ''} • {user.irrigation || 'Drip'}
            </Text>
          ) : null}
        </Card>
        {alerts.length ? (
          <AlertItem alert={alerts[0]} />
        ) : (
          <Card><Text style={s.none}>No active alerts</Text></Card>
        )}
      </ResponsiveGrid>
    </ScreenContainer>
  );
}

const s = StyleSheet.create({
  banner: {
    backgroundColor: colors.primaryMid,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  hello: { fontSize: 20, fontWeight: '700', color: '#fff' },
  subBanner: { color: colors.primaryLight, marginTop: 2, fontSize: 13 },
  profilePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    gap: 4,
  },
  profilePillText: { color: colors.primary, fontWeight: '700', fontSize: 13 },
  seasonBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.sm,
    alignSelf: 'flex-start',
    marginBottom: spacing.sm,
  },
  seasonText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  tip: { color: colors.text, marginBottom: 4, lineHeight: 19 },
  farmMeta: { color: colors.muted, fontSize: 12, marginTop: spacing.xs },
  none: { color: colors.muted },
});
