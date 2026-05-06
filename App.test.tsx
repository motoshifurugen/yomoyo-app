import React from 'react';
import { render, screen } from '@testing-library/react-native';

jest.mock('@/navigation/RootNavigator', () => {
  const { View } = require('react-native');
  return function MockRootNavigator() {
    return <View testID="root-navigator" />;
  };
});

jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({ children }: { children: React.ReactNode }) => children,
  DefaultTheme: { dark: false, colors: {} },
  DarkTheme: { dark: true, colors: {} },
}));

jest.mock('expo-status-bar', () => ({
  StatusBar: () => null,
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('@/lib/i18n', () => ({
  __esModule: true,
  default: { changeLanguage: jest.fn() },
  loadSavedLanguage: jest.fn(),
}));

import App from './App';
import i18n, { loadSavedLanguage } from '@/lib/i18n';

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(loadSavedLanguage).mockResolvedValue(null);
  jest.mocked(i18n.changeLanguage).mockResolvedValue(undefined);
});

describe('App startup', () => {
  it('renders the navigator when no language is saved', async () => {
    render(<App />);
    expect(await screen.findByTestId('root-navigator')).toBeTruthy();
  });

  it('applies the saved language before rendering', async () => {
    jest.mocked(loadSavedLanguage).mockResolvedValue('ja');
    render(<App />);
    expect(await screen.findByTestId('root-navigator')).toBeTruthy();
    expect(i18n.changeLanguage).toHaveBeenCalledWith('ja');
  });

  it('renders the navigator even when loadSavedLanguage rejects', async () => {
    jest.mocked(loadSavedLanguage).mockRejectedValue(new Error('storage error'));
    render(<App />);
    expect(await screen.findByTestId('root-navigator')).toBeTruthy();
  });

  it('renders the navigator even when i18n.changeLanguage rejects', async () => {
    jest.mocked(loadSavedLanguage).mockResolvedValue('ja');
    jest.mocked(i18n.changeLanguage).mockRejectedValue(new Error('i18n error'));
    render(<App />);
    expect(await screen.findByTestId('root-navigator')).toBeTruthy();
  });
});
