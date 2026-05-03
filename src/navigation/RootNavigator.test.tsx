import React from 'react';
import { render, screen } from '@testing-library/react-native';
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

import { checkFirstLaunch } from '@/lib/onboarding';

function renderWithNav() {
  return render(
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  );
}

describe('RootNavigator', () => {
  beforeEach(() => {
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

  it('shows nothing while auth state is loading', () => {
    jest.spyOn(useAuthModule, 'useAuth').mockReturnValue({ user: null, loading: true });
    renderWithNav();
    expect(screen.queryByText('LoginScreen')).toBeNull();
    expect(screen.queryByText('AppNavigator')).toBeNull();
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
});
