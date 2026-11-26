import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeView from '../views/home/HomeView';
import CommunityView from '../views/community/CommunityView';
import AlertsView from '../views/alerts/AlertsView';
import ProfileView from '../views/profile/ProfileView';
import LanguageSelector from '../components/LanguageSelector';
import { useLanguage } from '../context/LanguageContext';
import { colors, spacing } from '../theme';

const Tab = createBottomTabNavigator();

const TABS = [
  { name: 'Home', component: HomeView, icon: 'home' },
  { name: 'Community', component: CommunityView, icon: 'people' },
  { name: 'Alerts', component: AlertsView, icon: 'notifications' },
  { name: 'Profile', component: ProfileView, icon: 'person' },
];

export default function MainTabs() {
  const { t } = useLanguage();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border },
        headerStyle: { backgroundColor: colors.card, borderBottomWidth: 2, borderBottomColor: colors.primaryMid },
        headerTitleStyle: { color: colors.primary, fontWeight: '700' },
        headerRight: () => <LanguageSelector compact style={{ marginRight: spacing.md }} />,
      }}
    >
      {TABS.map((tab) => (
        <Tab.Screen
          key={tab.name}
          name={tab.name}
          component={tab.component}
          options={{
            title: t(tab.name === 'Home' ? 'PhytoSense' : tab.name),
            tabBarLabel: t(tab.name),
            tabBarIcon: ({ color, size }) => <Ionicons name={tab.icon} size={size} color={color} />,
          }}
        />
      ))}
    </Tab.Navigator>
  );
}
