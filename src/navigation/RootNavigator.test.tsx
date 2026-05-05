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

jest.mock('@/lib/onboarding', () => ({
  checkFirstLaunch: jest.fn(),
}));

jest.mock('@/lib/notifications/registerPushToken', () => ({
  registerPushTokenIfPermitted: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/lib/users/handles', () => ({
  ensureHandle: jest.fn().mockResolvedValue('quietfox'),
}));

import { checkFirstLaunch } from '@/lib/onboarding';
import { registerPushTokenIfPermitted } from '@/lib/notifications/registerPushToken';
import { ensureHandle } from '@/lib/users/handles';

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
    jest.mocked(checkFirstLaunch).mockResolvedValue(false);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('shows LoginScreen when onboarding is done and user is null', async () => {
    jest.spyOn(useAuthModule, 'useAuth').mockReturnValue({ user: null, loading: false });
    renderWithNav();
    expect(await screen.findByText('LoginScreen')).toBeTruthy();
  });

  it('shows AppNavigator when onboarding is done and user is authenticated', async () => {
    jest.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      user: { uid: 'abc123' } as any,
      loading: false,
    });
    renderWithNav();
    expect(await screen.findByText('AppNavigator')).toBeTruthy();
  });

  it('shows nothing while auth state is loading', async () => {
    jest.spyOn(useAuthModule, 'useAuth').mockReturnValue({ user: null, loading: true });
    renderWithNav();
    await waitFor(() => {
      expect(screen.queryByText('LoginScreen')).toBeNull();
      expect(screen.queryByText('AppNavigator')).toBeNull();
    });
  });

  it('shows OnboardingNavigator on first launch', async () => {
    jest.mocked(checkFirstLaunch).mockResolvedValue(true);
    jest.spyOn(useAuthModule, 'useAuth').mockReturnValue({ user: null, loading: false });
    renderWithNav();
    expect(await screen.findByText('OnboardingNavigator')).toBeTruthy();
  });

  it('shows OnboardingNavigator on first launch even when user is already signed in', async () => {
    jest.mocked(checkFirstLaunch).mockResolvedValue(true);
    jest.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      user: { uid: 'abc123' } as any,
      loading: false,
    });
    renderWithNav();
    expect(await screen.findByText('OnboardingNavigator')).toBeTruthy();
  });

  it('registers the push token on startup when user is authenticated and onboarding is done', async () => {
    jest.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      user: { uid: 'abc123' } as any,
      loading: false,
    });
    renderWithNav();
    await waitFor(() =>
      expect(registerPushTokenIfPermitted).toHaveBeenCalledWith('abc123'),
    );
  });

  it('does not register the push token on startup when user is signed out', async () => {
    jest.spyOn(useAuthModule, 'useAuth').mockReturnValue({ user: null, loading: false });
    renderWithNav();
    await screen.findByText('LoginScreen');
    expect(registerPushTokenIfPermitted).not.toHaveBeenCalled();
  });

  it('does not register the push token while onboarding is still active', async () => {
    jest.mocked(checkFirstLaunch).mockResolvedValue(true);
    jest.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      user: { uid: 'abc123' } as any,
      loading: false,
    });
    renderWithNav();
    await screen.findByText('OnboardingNavigator');
    expect(registerPushTokenIfPermitted).not.toHaveBeenCalled();
  });

  it('ensures a handle on startup when user is authenticated and onboarding is done', async () => {
    jest.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      user: { uid: 'abc123' } as any,
      loading: false,
    });
    renderWithNav();
    await waitFor(() => expect(ensureHandle).toHaveBeenCalledWith('abc123'));
  });

  it('does not ensure a handle on startup when user is signed out', async () => {
    jest.spyOn(useAuthModule, 'useAuth').mockReturnValue({ user: null, loading: false });
    renderWithNav();
    await screen.findByText('LoginScreen');
    expect(ensureHandle).not.toHaveBeenCalled();
  });

  it('does not ensure a handle while onboarding is still active', async () => {
    jest.mocked(checkFirstLaunch).mockResolvedValue(true);
    jest.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      user: { uid: 'abc123' } as any,
      loading: false,
    });
    renderWithNav();
    await screen.findByText('OnboardingNavigator');
    expect(ensureHandle).not.toHaveBeenCalled();
  });
});
