import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import SettingsScreen from './SettingsScreen';
import { setLanguage } from '@/lib/i18n';

jest.mock('@/lib/i18n', () => ({
  setLanguage: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ bottom: 0, top: 0, left: 0, right: 0 }),
}));

jest.mock('expo-blur', () => {
  const { View } = require('react-native');
  return { BlurView: View };
});

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en' },
  }),
}));

describe('SettingsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<SettingsScreen />);
  });

  it('renders the language section title key', () => {
    render(<SettingsScreen />);
    expect(screen.getByText('settings.languageTitle')).toBeTruthy();
  });

  it('renders a Japanese language button', () => {
    render(<SettingsScreen />);
    expect(screen.getByText('日本語')).toBeTruthy();
  });

  it('renders an English language button', () => {
    render(<SettingsScreen />);
    expect(screen.getByText('English')).toBeTruthy();
  });

  it('calls setLanguage with ja when the Japanese button is pressed', () => {
    render(<SettingsScreen />);
    fireEvent.press(screen.getByText('日本語'));
    expect(setLanguage).toHaveBeenCalledWith('ja');
  });

  it('calls setLanguage with en when the English button is pressed', () => {
    render(<SettingsScreen />);
    fireEvent.press(screen.getByText('English'));
    expect(setLanguage).toHaveBeenCalledWith('en');
  });
});
