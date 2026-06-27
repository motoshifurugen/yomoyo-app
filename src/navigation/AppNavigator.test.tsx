import React from 'react';
import { render } from '@testing-library/react-native';
import AppNavigator from './AppNavigator';

let capturedScreenOptions: Record<string, unknown> | null = null;

jest.mock('@react-navigation/native-stack', () => {
  const ReactInner = require('react');
  const { View } = require('react-native');
  return {
    createNativeStackNavigator: () => ({
      Navigator: ({
        children,
        screenOptions,
      }: {
        children: React.ReactNode;
        screenOptions?: unknown;
      }) => {
        capturedScreenOptions = (typeof screenOptions === 'function'
          ? screenOptions({})
          : screenOptions) as Record<string, unknown> | null;
        return ReactInner.createElement(View, null, children);
      },
      Screen: () => null,
      Group: ({ children }: { children: React.ReactNode }) =>
        ReactInner.createElement(View, null, children),
    }),
  };
});

jest.mock('./MainTabNavigator', () => () => null);
jest.mock('@/screens/BookSearchScreen', () => () => null);
jest.mock('@/screens/BookDetailScreen', () => () => null);
jest.mock('@/screens/UserProfileScreen', () => () => null);
jest.mock('./AddFriendModalNavigator', () => () => null);

beforeEach(() => {
  capturedScreenOptions = null;
});

describe('AppNavigator — header title suppression', () => {
  it('configures screenOptions with a headerTitle that renders null', () => {
    render(<AppNavigator />);
    expect(capturedScreenOptions).not.toBeNull();
    const headerTitle = (capturedScreenOptions as Record<string, unknown>).headerTitle;
    expect(typeof headerTitle).toBe('function');
    expect((headerTitle as (props?: unknown) => unknown)({})).toBeNull();
  });
});
