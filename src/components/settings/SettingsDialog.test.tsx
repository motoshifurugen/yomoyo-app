import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { renderWithTheme as render } from '@/lib/theme/testUtils';
import SettingsDialog from './SettingsDialog';
import { setLanguage } from '@/lib/i18n';
import { registerPushTokenIfPermitted } from '@/lib/notifications/registerPushToken';
import { THEME_STORAGE_KEY } from '@/lib/theme/themeStorage';

jest.mock('@/lib/i18n', () => ({
  setLanguage: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/lib/notifications/registerPushToken', () => ({
  registerPushTokenIfPermitted: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en' },
  }),
}));

jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: { uid: 'user1' }, loading: false }),
}));

const mockedRegisterPushToken = registerPushTokenIfPermitted as jest.Mock;

describe('SettingsDialog — visibility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when not visible', () => {
    render(<SettingsDialog visible={false} onClose={jest.fn()} />);
    expect(screen.queryByText('settings.languageTitle')).toBeNull();
  });

  it('renders the language section when visible', () => {
    render(<SettingsDialog visible={true} onClose={jest.fn()} />);
    expect(screen.getByText('settings.languageTitle')).toBeTruthy();
  });

  it('renders a Japanese language button when visible', () => {
    render(<SettingsDialog visible={true} onClose={jest.fn()} />);
    expect(screen.getByText('日本語')).toBeTruthy();
  });

  it('renders an English language button when visible', () => {
    render(<SettingsDialog visible={true} onClose={jest.fn()} />);
    expect(screen.getByText('English')).toBeTruthy();
  });
});

describe('SettingsDialog — language switching', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls setLanguage with ja when the Japanese button is pressed', () => {
    render(<SettingsDialog visible={true} onClose={jest.fn()} />);
    fireEvent.press(screen.getByText('日本語'));
    expect(setLanguage).toHaveBeenCalledWith('ja');
  });

  it('calls setLanguage with en when the English button is pressed', () => {
    render(<SettingsDialog visible={true} onClose={jest.fn()} />);
    fireEvent.press(screen.getByText('English'));
    expect(setLanguage).toHaveBeenCalledWith('en');
  });

  it('re-registers the push token after pressing the Japanese button', async () => {
    render(<SettingsDialog visible={true} onClose={jest.fn()} />);
    fireEvent.press(screen.getByText('日本語'));
    await waitFor(() => {
      expect(mockedRegisterPushToken).toHaveBeenCalledWith('user1');
    });
  });

  it('re-registers the push token after pressing the English button', async () => {
    render(<SettingsDialog visible={true} onClose={jest.fn()} />);
    fireEvent.press(screen.getByText('English'));
    await waitFor(() => {
      expect(mockedRegisterPushToken).toHaveBeenCalledWith('user1');
    });
  });
});

describe('SettingsDialog — accessibility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('marks the English button as selected when current language is en', () => {
    render(<SettingsDialog visible={true} onClose={jest.fn()} />);
    const enButton = screen.getByTestId('settings-dialog-lang-en');
    expect(enButton.props.accessibilityState).toEqual({ selected: true });
  });

  it('marks the Japanese button as not selected when current language is en', () => {
    render(<SettingsDialog visible={true} onClose={jest.fn()} />);
    const jaButton = screen.getByTestId('settings-dialog-lang-ja');
    expect(jaButton.props.accessibilityState).toEqual({ selected: false });
  });
});

describe('SettingsDialog — theme section', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the theme section title when visible', () => {
    render(<SettingsDialog visible={true} onClose={jest.fn()} />);
    expect(screen.getByText('settings.themeTitle')).toBeTruthy();
  });

  it('renders all three theme pills', () => {
    render(<SettingsDialog visible={true} onClose={jest.fn()} />);
    expect(screen.getByTestId('settings-dialog-theme-light')).toBeTruthy();
    expect(screen.getByTestId('settings-dialog-theme-dark')).toBeTruthy();
    expect(screen.getByTestId('settings-dialog-theme-system')).toBeTruthy();
  });

  it('marks the System pill as selected by default (no saved mode)', () => {
    render(<SettingsDialog visible={true} onClose={jest.fn()} />);
    const systemPill = screen.getByTestId('settings-dialog-theme-system');
    const lightPill = screen.getByTestId('settings-dialog-theme-light');
    const darkPill = screen.getByTestId('settings-dialog-theme-dark');
    expect(systemPill.props.accessibilityState).toEqual({ selected: true });
    expect(lightPill.props.accessibilityState).toEqual({ selected: false });
    expect(darkPill.props.accessibilityState).toEqual({ selected: false });
  });

  it('switches selection to Light when the Light pill is pressed', async () => {
    render(<SettingsDialog visible={true} onClose={jest.fn()} />);
    fireEvent.press(screen.getByTestId('settings-dialog-theme-light'));
    await waitFor(() => {
      expect(screen.getByTestId('settings-dialog-theme-light').props.accessibilityState).toEqual({
        selected: true,
      });
    });
    expect(screen.getByTestId('settings-dialog-theme-system').props.accessibilityState).toEqual({
      selected: false,
    });
  });

  it('switches selection to Dark when the Dark pill is pressed', async () => {
    render(<SettingsDialog visible={true} onClose={jest.fn()} />);
    fireEvent.press(screen.getByTestId('settings-dialog-theme-dark'));
    await waitFor(() => {
      expect(screen.getByTestId('settings-dialog-theme-dark').props.accessibilityState).toEqual({
        selected: true,
      });
    });
  });

  it('persists "light" to storage when the Light pill is pressed', async () => {
    render(<SettingsDialog visible={true} onClose={jest.fn()} />);
    fireEvent.press(screen.getByTestId('settings-dialog-theme-light'));
    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(THEME_STORAGE_KEY, 'light');
    });
  });

  it('persists "dark" to storage when the Dark pill is pressed', async () => {
    render(<SettingsDialog visible={true} onClose={jest.fn()} />);
    fireEvent.press(screen.getByTestId('settings-dialog-theme-dark'));
    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(THEME_STORAGE_KEY, 'dark');
    });
  });

  it('persists "system" to storage when the System pill is pressed', async () => {
    render(<SettingsDialog visible={true} onClose={jest.fn()} />);
    // Start by switching away so System press has a meaningful effect.
    fireEvent.press(screen.getByTestId('settings-dialog-theme-light'));
    fireEvent.press(screen.getByTestId('settings-dialog-theme-system'));
    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(THEME_STORAGE_KEY, 'system');
    });
  });
});

describe('SettingsDialog — close behavior', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls onClose when the close button is pressed', () => {
    const onClose = jest.fn();
    render(<SettingsDialog visible={true} onClose={onClose} />);
    fireEvent.press(screen.getByTestId('settings-dialog-close'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when the backdrop is pressed', () => {
    const onClose = jest.fn();
    render(<SettingsDialog visible={true} onClose={onClose} />);
    fireEvent.press(screen.getByTestId('settings-dialog-backdrop'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
