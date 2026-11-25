import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { LoadingView } from '../components/StateViews';
import { colors } from '../theme';
import MainTabs from './MainTabs';
import LoginView from '../views/auth/LoginView';
import RegisterView from '../views/auth/RegisterView';
import ScanView from '../views/scan/ScanView';
import ResultView from '../views/result/ResultView';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { user, loading } = useAuth();
  if (loading) return <LoadingView />;

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.card },
          headerTintColor: colors.primary,
          headerTitleStyle: { color: colors.primary, fontWeight: '700' },
        }}
      >
        {user ? (
          <>
            <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
            <Stack.Screen name="Scan" component={ScanView} options={{ title: 'Plant Diagnosis' }} />
            <Stack.Screen name="Result" component={ResultView} options={{ title: 'Diagnosis Result' }} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginView} options={{ headerShown: false }} />
            <Stack.Screen name="Register" component={RegisterView} options={{ title: 'Create account' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
