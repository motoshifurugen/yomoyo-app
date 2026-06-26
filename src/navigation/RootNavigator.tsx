import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AppNavigator from './AppNavigator';
import OnboardingNavigator from './OnboardingNavigator';
import LoginScreen from '@/screens/LoginScreen';
import { useAuth } from '@/hooks/useAuth';
import { alwaysShowOnboarding } from '@/lib/onboarding/alwaysShowOnboarding';
import { getAvatarIdentity } from '@/lib/users/avatarIdentity';
import { registerPushTokenIfPermitted } from '@/lib/notifications/registerPushToken';
import { ensureHandle } from '@/lib/users/handles';

type AuthStackParamList = {
  App: undefined;
  Login: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

// Per-user onboarding: a freshly signed-in account that has no profile yet
// (no display name / avatar in Firestore) must complete profile setup. This is
// keyed on the user's uid, not a device flag, so every new account (Google or
// Apple) is onboarded on its first sign-in.
type ProfileState = 'unknown' | 'needs-setup' | 'ready';

export default function RootNavigator() {
  const { user, loading } = useAuth();
  const [profileState, setProfileState] = useState<ProfileState>('unknown');

  useEffect(() => {
    const uid = user?.uid;
    // Reset synchronously on every uid change so a stale resolution from a
    // previous account can never flash the wrong screen for the new one.
    setProfileState('unknown');
    if (!uid) return;

    let cancelled = false;
    getAvatarIdentity(uid)
      .then((identity) => {
        if (cancelled) return;
        if (alwaysShowOnboarding || identity === null) {
          setProfileState('needs-setup');
          return;
        }
        setProfileState('ready');
      })
      .catch(() => {
        // Fail open: a transient Firestore error must not trap an onboarded
        // user in setup. The profile can still be edited later.
        if (!cancelled) setProfileState('ready');
      });

    return () => {
      cancelled = true;
    };
  }, [user?.uid]);

  useEffect(() => {
    if (user && profileState === 'ready') {
      registerPushTokenIfPermitted(user.uid);
      ensureHandle(user.uid).catch(() => {});
    }
  }, [user, profileState]);

  if (loading) {
    return null;
  }

  if (!user) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
      </Stack.Navigator>
    );
  }

  // Profile check for the current user is still in flight — render nothing to
  // avoid flashing the app or the onboarding flow before we know which to show.
  if (profileState === 'unknown') {
    return null;
  }

  if (profileState === 'needs-setup') {
    return <OnboardingNavigator onComplete={() => setProfileState('ready')} />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="App" component={AppNavigator} />
    </Stack.Navigator>
  );
}
