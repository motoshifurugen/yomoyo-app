import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
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

  it('closes the dialog when the close control is pressed', () => {
    render(<SettingsLauncher />);
    fireEvent.press(screen.getByTestId('settings-button'));
    fireEvent.press(screen.getByTestId('settings-dialog-close'));
    expect(screen.queryByText('settings.languageTitle')).toBeNull();
  });
});
