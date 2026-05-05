import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react-native';
import SettingsScreen from './SettingsScreen';
import { setLanguage } from '@/lib/i18n';
import { registerPushTokenIfPermitted } from '@/lib/notifications/registerPushToken';
import { getUserHandle } from '@/lib/users/handles';
import { Share } from 'react-native';

jest.mock('@/lib/i18n', () => ({
  setLanguage: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/lib/notifications/registerPushToken', () => ({
  registerPushTokenIfPermitted: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/lib/users/handles', () => ({
  getUserHandle: jest.fn().mockResolvedValue('quietfox'),
}));

const mockedRegisterPushToken = registerPushTokenIfPermitted as jest.Mock;
const mockedGetUserHandle = getUserHandle as jest.Mock;

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

jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: { uid: 'user1' }, loading: false }),
}));

jest.spyOn(Share, 'share').mockResolvedValue({ action: Share.sharedAction });

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

  it('re-registers the push token after pressing the Japanese button', async () => {
    render(<SettingsScreen />);
    fireEvent.press(screen.getByText('日本語'));
    await waitFor(() => {
      expect(mockedRegisterPushToken).toHaveBeenCalledWith('user1');
    });
  });

  it('re-registers the push token after pressing the English button', async () => {
    render(<SettingsScreen />);
    fireEvent.press(screen.getByText('English'));
    await waitFor(() => {
      expect(mockedRegisterPushToken).toHaveBeenCalledWith('user1');
    });
  });
});

describe('SettingsScreen — your ID', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetUserHandle.mockResolvedValue('quietfox');
  });

  it('renders the your-ID section title', () => {
    render(<SettingsScreen />);
    expect(screen.getByText('settings.yourIdTitle')).toBeTruthy();
  });

  it('fetches the current user handle on mount', async () => {
    render(<SettingsScreen />);
    await waitFor(() => expect(mockedGetUserHandle).toHaveBeenCalledWith('user1'));
  });

  it('displays the loaded handle', async () => {
    render(<SettingsScreen />);
    expect(await screen.findByText('quietfox')).toBeTruthy();
  });

  it('renders a share-ID button', async () => {
    render(<SettingsScreen />);
    expect(await screen.findByText('settings.shareId')).toBeTruthy();
  });

  it('calls Share.share with the handle as the message', async () => {
    render(<SettingsScreen />);
    fireEvent.press(await screen.findByText('settings.shareId'));
    await waitFor(() => {
      expect(Share.share).toHaveBeenCalledWith({ message: 'quietfox' });
    });
  });

  it('shows the shared confirmation after pressing share', async () => {
    render(<SettingsScreen />);
    fireEvent.press(await screen.findByText('settings.shareId'));
    await waitFor(() => {
      expect(screen.getByText('settings.idShared')).toBeTruthy();
    });
  });

  it('does not show the shared confirmation before share is pressed', () => {
    render(<SettingsScreen />);
    expect(screen.queryByText('settings.idShared')).toBeNull();
  });

  it('does not crash when getUserHandle returns null', async () => {
    mockedGetUserHandle.mockResolvedValueOnce(null);
    render(<SettingsScreen />);
    await waitFor(() => expect(mockedGetUserHandle).toHaveBeenCalled());
    expect(screen.queryByText('quietfox')).toBeNull();
  });

  it('disables the share button while the handle is unavailable', async () => {
    mockedGetUserHandle.mockResolvedValueOnce(null);
    render(<SettingsScreen />);
    await waitFor(() => expect(mockedGetUserHandle).toHaveBeenCalled());
    fireEvent.press(screen.getByText('settings.shareId'));
    expect(Share.share).not.toHaveBeenCalled();
  });

  it('hides the shared confirmation after a short delay', async () => {
    jest.useFakeTimers();
    try {
      render(<SettingsScreen />);
      fireEvent.press(await screen.findByText('settings.shareId'));
      await waitFor(() => {
        expect(screen.getByText('settings.idShared')).toBeTruthy();
      });
      act(() => {
        jest.advanceTimersByTime(2500);
      });
      expect(screen.queryByText('settings.idShared')).toBeNull();
    } finally {
      jest.useRealTimers();
    }
  });
});
