import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeView from '../views/home/HomeView';
import CommunityView from '../views/community/CommunityView';
import AlertsView from '../views/alerts/AlertsView';
import ProfileView from '../views/profile/ProfileView';
import { colors } from '../theme';

const Tab = createBottomTabNavigator();

const TABS = [
  { name: 'Home', component: HomeView, icon: 'home' },
  { name: 'Community', component: CommunityView, icon: 'people' },
  { name: 'Alerts', component: AlertsView, icon: 'notifications' },
  { name: 'Profile', component: ProfileView, icon: 'person' },
];

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border },
        headerStyle: { backgroundColor: colors.card, borderBottomWidth: 2, borderBottomColor: colors.primaryMid },
        headerTitleStyle: { color: colors.primary, fontWeight: '700' },
      }}
    >
      {TABS.map((t) => (
        <Tab.Screen
          key={t.name}
          name={t.name}
          component={t.component}
          options={{
            title: t.name === 'Home' ? 'PhytoSense' : t.name,
            tabBarIcon: ({ color, size }) => <Ionicons name={t.icon} size={size} color={color} />,
          }}
        />
      ))}
    </Tab.Navigator>
  );
}
