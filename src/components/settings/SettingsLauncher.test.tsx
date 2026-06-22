import React from 'react';
import { screen, fireEvent } from '@testing-library/react-native';
import { renderWithTheme as render } from '@/lib/theme/testUtils';
import SettingsLauncher from './SettingsLauncher';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en' },
  }),
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => null,
}));

jest.mock('@/lib/i18n', () => ({
  setLanguage: jest.fn().mockResolvedValue(undefined),
  SUPPORTED_LANGUAGES: ['ja', 'en'],
  LANGUAGE_LABELS: { ja: '日本語', en: 'English' },
  normalizeLanguage: (code: string) => (code === 'ja' ? 'ja' : 'en'),
}));

jest.mock('@/lib/notifications/registerPushToken', () => ({
  registerPushTokenIfPermitted: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: { uid: 'user1' }, loading: false }),
}));

describe('SettingsLauncher', () => {
  it('renders the gear button', () => {
    render(<SettingsLauncher />);
    expect(screen.getByTestId('settings-button')).toBeTruthy();
  });

  it('does not render the dialog content when not opened', () => {
    render(<SettingsLauncher />);
    expect(screen.queryByText('settings.languageTitle')).toBeNull();
  });

  it('opens the dialog when the gear is pressed', () => {
    render(<SettingsLauncher />);
    fireEvent.press(screen.getByTestId('settings-button'));
    expect(screen.getByText('settings.languageTitle')).toBeTruthy();
  });

  it('closes the dialog when the backdrop is pressed', () => {
    render(<SettingsLauncher />);
    fireEvent.press(screen.getByTestId('settings-button'));
    fireEvent.press(screen.getByTestId('settings-dialog-backdrop'));
    expect(screen.queryByText('settings.languageTitle')).toBeNull();
  });
});
