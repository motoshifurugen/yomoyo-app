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

function renderWithNav() {
  return render(
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  );
}

describe('RootNavigator', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('shows LoginScreen when user is null', () => {
    jest.spyOn(useAuthModule, 'useAuth').mockReturnValue({ user: null, loading: false });

    renderWithNav();

    expect(screen.getByText('LoginScreen')).toBeTruthy();
  });

  it('shows AppNavigator when user is authenticated', () => {
    jest.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      user: { uid: 'abc123' } as any,
      loading: false,
    });

    renderWithNav();

    expect(screen.getByText('AppNavigator')).toBeTruthy();
  });

  it('shows nothing while the auth state is loading', () => {
    jest.spyOn(useAuthModule, 'useAuth').mockReturnValue({ user: null, loading: true });

    renderWithNav();

    expect(screen.queryByText('LoginScreen')).toBeNull();
    expect(screen.queryByText('AppNavigator')).toBeNull();
  });
});
