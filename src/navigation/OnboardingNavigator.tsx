import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import OnboardingAvatarScreen from '@/screens/OnboardingAvatarScreen';
import OnboardingNotificationScreen from '@/screens/OnboardingNotificationScreen';
import OnboardingSendingScreen from '@/screens/OnboardingSendingScreen';
import type { OnboardingStackParamList } from './types';

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

type Props = {
  onComplete: () => void;
};

// Per-user profile setup, shown after sign-in when the account has no profile.
// Sign-in itself lives in LoginScreen, so onboarding starts at the avatar step.
export default function OnboardingNavigator({ onComplete }: Props) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="OnboardingAvatar" component={OnboardingAvatarScreen} />
      <Stack.Screen name="OnboardingNotification" component={OnboardingNotificationScreen} />
      <Stack.Screen name="OnboardingSending">
        {() => <OnboardingSendingScreen onComplete={onComplete} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
