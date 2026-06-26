import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import RootNavigator from '@/navigation/RootNavigator';
import * as useAuthModule from '@/hooks/useAuth';

jest.mock('@/hooks/useAuth');

jest.mock('@/screens/LoginScreen', () => {
  const { Text } = require('react-native');
  return function LoginScreen() {
    return <Text>LoginScreen</Text>;
  };
});

jest.mock('@/navigation/AppNavigator', () => {
  const { Text } = require('react-native');
  return function AppNavigator() {
    return <Text>AppNavigator</Text>;
  };
});

jest.mock('@/navigation/OnboardingNavigator', () => {
  const { Text } = require('react-native');
  return function OnboardingNavigator() {
    return <Text>OnboardingNavigator</Text>;
  };
});

const mockAlwaysShowOnboardingForTests = { value: false };

jest.mock('@/lib/onboarding/alwaysShowOnboarding', () => ({
  get alwaysShowOnboarding() {
    return mockAlwaysShowOnboardingForTests.value;
  },
}));

jest.mock('@/lib/users/avatarIdentity', () => ({
  getAvatarIdentity: jest.fn(),
}));

jest.mock('@/lib/notifications/registerPushToken', () => ({
  registerPushTokenIfPermitted: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/lib/users/handles', () => ({
  ensureHandle: jest.fn().mockResolvedValue('quietfox'),
}));

import { getAvatarIdentity } from '@/lib/users/avatarIdentity';
import { registerPushTokenIfPermitted } from '@/lib/notifications/registerPushToken';
import { ensureHandle } from '@/lib/users/handles';

const profile = { animalKey: 'fox', displayName: 'Reader', finalizedAt: null };

function renderWithNav() {
  return render(
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  );
}

describe('RootNavigator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAlwaysShowOnboardingForTests.value = false;
    jest.mocked(getAvatarIdentity).mockResolvedValue(profile as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('shows LoginScreen when user is null', async () => {
    jest.spyOn(useAuthModule, 'useAuth').mockReturnValue({ user: null, loading: false });
    renderWithNav();
    expect(await screen.findByText('LoginScreen')).toBeTruthy();
  });

  it('shows AppNavigator when the user already has a profile', async () => {
    jest.mocked(getAvatarIdentity).mockResolvedValue(profile as any);
    jest.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      user: { uid: 'abc123' } as any,
      loading: false,
    });
    renderWithNav();
    expect(await screen.findByText('AppNavigator')).toBeTruthy();
  });

  it('shows OnboardingNavigator when the signed-in user has no profile', async () => {
    jest.mocked(getAvatarIdentity).mockResolvedValue(null);
    jest.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      user: { uid: 'newuser' } as any,
      loading: false,
    });
    renderWithNav();
    expect(await screen.findByText('OnboardingNavigator')).toBeTruthy();
  });

  it('shows OnboardingNavigator on every login when alwaysShowOnboarding is enabled', async () => {
    mockAlwaysShowOnboardingForTests.value = true;
    jest.mocked(getAvatarIdentity).mockResolvedValue(profile as any);
    jest.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      user: { uid: 'abc123' } as any,
      loading: false,
    });
    renderWithNav();
    expect(await screen.findByText('OnboardingNavigator')).toBeTruthy();
  });

  it('shows nothing while auth state is loading', async () => {
    jest.spyOn(useAuthModule, 'useAuth').mockReturnValue({ user: null, loading: true });
    renderWithNav();
    await waitFor(() => {
      expect(screen.queryByText('LoginScreen')).toBeNull();
      expect(screen.queryByText('AppNavigator')).toBeNull();
    });
  });

  it('shows nothing (no flash) while the profile check is in flight', async () => {
    jest.mocked(getAvatarIdentity).mockReturnValue(new Promise(() => {}) as any);
    jest.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      user: { uid: 'abc123' } as any,
      loading: false,
    });
    renderWithNav();
    await waitFor(() => {
      expect(screen.queryByText('AppNavigator')).toBeNull();
      expect(screen.queryByText('OnboardingNavigator')).toBeNull();
      expect(screen.queryByText('LoginScreen')).toBeNull();
    });
  });

  it('fails open to AppNavigator when the profile check errors', async () => {
    jest.mocked(getAvatarIdentity).mockRejectedValue(new Error('firestore down'));
    jest.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      user: { uid: 'abc123' } as any,
      loading: false,
    });
    renderWithNav();
    expect(await screen.findByText('AppNavigator')).toBeTruthy();
  });

  it('registers the push token once the profile is ready', async () => {
    jest.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      user: { uid: 'abc123' } as any,
      loading: false,
    });
    renderWithNav();
    await waitFor(() =>
      expect(registerPushTokenIfPermitted).toHaveBeenCalledWith('abc123'),
    );
  });

  it('does not register the push token when the user is signed out', async () => {
    jest.spyOn(useAuthModule, 'useAuth').mockReturnValue({ user: null, loading: false });
    renderWithNav();
    await screen.findByText('LoginScreen');
    expect(registerPushTokenIfPermitted).not.toHaveBeenCalled();
  });

  it('does not register the push token while profile setup is still needed', async () => {
    jest.mocked(getAvatarIdentity).mockResolvedValue(null);
    jest.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      user: { uid: 'newuser' } as any,
      loading: false,
    });
    renderWithNav();
    await screen.findByText('OnboardingNavigator');
    expect(registerPushTokenIfPermitted).not.toHaveBeenCalled();
  });

  it('ensures a handle once the profile is ready', async () => {
    jest.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      user: { uid: 'abc123' } as any,
      loading: false,
    });
    renderWithNav();
    await waitFor(() => expect(ensureHandle).toHaveBeenCalledWith('abc123'));
  });

  it('does not ensure a handle while profile setup is still needed', async () => {
    jest.mocked(getAvatarIdentity).mockResolvedValue(null);
    jest.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      user: { uid: 'newuser' } as any,
      loading: false,
    });
    renderWithNav();
    await screen.findByText('OnboardingNavigator');
    expect(ensureHandle).not.toHaveBeenCalled();
  });
});
