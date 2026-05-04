import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import OnboardingWelcomeScreen from '@/screens/OnboardingWelcomeScreen';
import OnboardingAvatarScreen from '@/screens/OnboardingAvatarScreen';
import OnboardingNotificationScreen from '@/screens/OnboardingNotificationScreen';
import type { OnboardingStackParamList } from './types';

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

type Props = {
  onComplete: () => void;
};

export default function OnboardingNavigator({ onComplete }: Props) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="OnboardingWelcome" component={OnboardingWelcomeScreen} />
      <Stack.Screen name="OnboardingAvatar" component={OnboardingAvatarScreen} />
      <Stack.Screen name="OnboardingNotification">
        {() => <OnboardingNotificationScreen onComplete={onComplete} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
