import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AppNavigator from './AppNavigator';
import OnboardingNavigator from './OnboardingNavigator';
import LoginScreen from '@/screens/LoginScreen';
import { useAuth } from '@/hooks/useAuth';
import { checkFirstLaunch } from '@/lib/onboarding';

type AuthStackParamList = {
  App: undefined;
  Login: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function RootNavigator() {
  const { user, loading } = useAuth();
  const [onboardingDone, setOnboardingDone] = useState<boolean | null>(null);

  useEffect(() => {
    checkFirstLaunch()
      .then((isFirst) => setOnboardingDone(!isFirst))
      .catch(() => setOnboardingDone(true));
  }, []);

  if (loading || onboardingDone === null) {
    return null;
  }

  if (!onboardingDone) {
    return (
      <OnboardingNavigator onComplete={() => setOnboardingDone(true)} />
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <Stack.Screen name="App" component={AppNavigator} />
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
}
