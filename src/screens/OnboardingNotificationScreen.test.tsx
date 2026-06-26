import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react-native';
import { renderWithTheme as render } from '@/lib/theme/testUtils';
import OnboardingNotificationScreen from './OnboardingNotificationScreen';
import * as Notifications from 'expo-notifications';
import { useNavigation } from '@react-navigation/native';
import { finalizeAvatarIdentity } from '@/lib/users/avatarIdentity';
import { useVideoPlayer } from 'expo-video';

jest.mock('expo-notifications');
jest.mock('expo-video');

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: jest.fn(),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('@/lib/users/avatarIdentity', () => ({
  finalizeAvatarIdentity: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: { uid: 'user1' }, loading: false }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('@/lib/i18n', () => ({
  getCurrentLanguage: jest.fn(() => 'en'),
}));

const mockNavigate = jest.fn();

describe('OnboardingNotificationScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useNavigation).mockReturnValue({ navigate: mockNavigate } as any);
  });

  it('renders the notification heading key', () => {
    render(<OnboardingNotificationScreen />);
    expect(screen.getByText('onboarding.notificationHeading')).toBeTruthy();
  });

  it('renders a 3-step progress indicator at step 2 (first two filled)', () => {
    render(<OnboardingNotificationScreen />);
    expect(screen.getAllByTestId(/onboarding-progress-segment-/)).toHaveLength(3);
    expect(screen.getByTestId('onboarding-progress-segment-0').props.accessibilityState).toEqual(
      expect.objectContaining({ selected: true }),
    );
    expect(screen.getByTestId('onboarding-progress-segment-1').props.accessibilityState).toEqual(
      expect.objectContaining({ selected: true }),
    );
    expect(screen.getByTestId('onboarding-progress-segment-2').props.accessibilityState).toEqual(
      expect.objectContaining({ selected: false }),
    );
  });

  it('renders the notification body key', () => {
    render(<OnboardingNotificationScreen />);
    expect(screen.getByText('onboarding.notificationBody')).toBeTruthy();
  });

  it('renders the receive use-case highlights', () => {
    render(<OnboardingNotificationScreen />);
    expect(screen.getByText('onboarding.receiveHighlightNotify')).toBeTruthy();
    expect(screen.getByText('onboarding.receiveHighlightConnect')).toBeTruthy();
  });

  it('renders an allow button', () => {
    render(<OnboardingNotificationScreen />);
    expect(screen.getByText('onboarding.allowButton')).toBeTruthy();
  });

  it('renders a skip option', () => {
    render(<OnboardingNotificationScreen />);
    expect(screen.getByText('onboarding.skipLink')).toBeTruthy();
  });

  it('requests notification permission when allow is pressed', async () => {
    render(<OnboardingNotificationScreen />);
    fireEvent.press(screen.getByText('onboarding.allowButton'));
    await waitFor(() => expect(Notifications.requestPermissionsAsync).toHaveBeenCalled());
  });

  it('navigates to the sending step after allow', async () => {
    render(<OnboardingNotificationScreen />);
    fireEvent.press(screen.getByText('onboarding.allowButton'));
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('OnboardingSending'));
  });

  it('navigates to the sending step after skip', async () => {
    render(<OnboardingNotificationScreen />);
    fireEvent.press(screen.getByText('onboarding.skipLink'));
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('OnboardingSending'));
  });

  it('finalizes avatar identity when allow is pressed', async () => {
    render(<OnboardingNotificationScreen />);
    fireEvent.press(screen.getByText('onboarding.allowButton'));
    await waitFor(() => expect(finalizeAvatarIdentity).toHaveBeenCalledWith('user1'));
  });

  it('finalizes avatar identity when skip is pressed', async () => {
    render(<OnboardingNotificationScreen />);
    fireEvent.press(screen.getByText('onboarding.skipLink'));
    await waitFor(() => expect(finalizeAvatarIdentity).toHaveBeenCalledWith('user1'));
  });

  it('still advances if finalizeAvatarIdentity throws during allow', async () => {
    (finalizeAvatarIdentity as jest.Mock).mockRejectedValueOnce(new Error('network error'));
    render(<OnboardingNotificationScreen />);
    fireEvent.press(screen.getByText('onboarding.allowButton'));
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('OnboardingSending'));
  });

  it('still advances if finalizeAvatarIdentity throws during skip', async () => {
    (finalizeAvatarIdentity as jest.Mock).mockRejectedValueOnce(new Error('network error'));
    render(<OnboardingNotificationScreen />);
    fireEvent.press(screen.getByText('onboarding.skipLink'));
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('OnboardingSending'));
  });

  it('does not request permission when skip is pressed', async () => {
    render(<OnboardingNotificationScreen />);
    fireEvent.press(screen.getByText('onboarding.skipLink'));
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('OnboardingSending'));
    expect(Notifications.requestPermissionsAsync).not.toHaveBeenCalled();
  });

  it('still advances if requestPermissionsAsync throws', async () => {
    (Notifications.requestPermissionsAsync as jest.Mock).mockRejectedValueOnce(
      new Error('permission error'),
    );
    render(<OnboardingNotificationScreen />);
    fireEvent.press(screen.getByText('onboarding.allowButton'));
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('OnboardingSending'));
  });

  it('fetches expo push token when permission is granted', async () => {
    render(<OnboardingNotificationScreen />);
    fireEvent.press(screen.getByText('onboarding.allowButton'));
    await waitFor(() => expect(Notifications.getExpoPushTokenAsync).toHaveBeenCalled());
  });

  it('does not fetch push token when permission is denied', async () => {
    (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValueOnce({
      status: 'denied',
    });
    render(<OnboardingNotificationScreen />);
    fireEvent.press(screen.getByText('onboarding.allowButton'));
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('OnboardingSending'));
    expect(Notifications.getExpoPushTokenAsync).not.toHaveBeenCalled();
  });

  it('still advances if getExpoPushTokenAsync throws', async () => {
    (Notifications.getExpoPushTokenAsync as jest.Mock).mockRejectedValueOnce(
      new Error('token error'),
    );
    render(<OnboardingNotificationScreen />);
    fireEvent.press(screen.getByText('onboarding.allowButton'));
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('OnboardingSending'));
  });

  it('logs push token to console in dev mode', async () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    render(<OnboardingNotificationScreen />);
    fireEvent.press(screen.getByText('onboarding.allowButton'));
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('OnboardingSending'));
    const pushTokenCalls = spy.mock.calls.filter(
      ([msg]) => typeof msg === 'string' && msg.startsWith('[PushToken]'),
    );
    expect(pushTokenCalls.length).toBeGreaterThan(0);
    spy.mockRestore();
  });

  it('does not log push token in production mode', async () => {
    const originalDev = (global as any).__DEV__;
    (global as any).__DEV__ = false;
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      render(<OnboardingNotificationScreen />);
      fireEvent.press(screen.getByText('onboarding.allowButton'));
      await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('OnboardingSending'));
      const pushTokenLogs = logSpy.mock.calls.filter(
        ([msg]) => typeof msg === 'string' && msg.startsWith('[PushToken]'),
      );
      const pushTokenWarns = warnSpy.mock.calls.filter(
        ([msg]) => typeof msg === 'string' && msg.startsWith('[PushToken]'),
      );
      expect(pushTokenLogs).toHaveLength(0);
      expect(pushTokenWarns).toHaveLength(0);
    } finally {
      (global as any).__DEV__ = originalDev;
      logSpy.mockRestore();
      warnSpy.mockRestore();
    }
  });

  it('logs a warning when token fetch fails in dev mode', async () => {
    (Notifications.getExpoPushTokenAsync as jest.Mock).mockRejectedValueOnce(
      new Error('token error'),
    );
    const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      render(<OnboardingNotificationScreen />);
      fireEvent.press(screen.getByText('onboarding.allowButton'));
      await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('OnboardingSending'));
      const pushTokenWarns = spy.mock.calls.filter(
        ([msg]) => typeof msg === 'string' && msg.startsWith('[PushToken]'),
      );
      expect(pushTokenWarns.length).toBeGreaterThan(0);
    } finally {
      spy.mockRestore();
    }
  });

  it('logs a specific warning when EAS project ID is missing', async () => {
    const noProjectIdError = Object.assign(new Error('No projectId found'), {
      code: 'ERR_NOTIFICATIONS_NO_EXPERIENCE_ID',
    });
    (Notifications.getExpoPushTokenAsync as jest.Mock).mockRejectedValueOnce(noProjectIdError);
    const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      render(<OnboardingNotificationScreen />);
      fireEvent.press(screen.getByText('onboarding.allowButton'));
      await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('OnboardingSending'));
      const projectIdWarns = spy.mock.calls.filter(
        ([msg]) => typeof msg === 'string' && msg.includes('eas init'),
      );
      expect(projectIdWarns.length).toBeGreaterThan(0);
    } finally {
      spy.mockRestore();
    }
  });

  it('renders a video element', () => {
    render(<OnboardingNotificationScreen />);
    expect(screen.getByTestId('notification-video')).toBeTruthy();
  });

  it('renders a soft placeholder behind the video so the area is never empty', () => {
    render(<OnboardingNotificationScreen />);
    // Placeholder is intentionally hidden from a11y tree, so opt into hidden elements.
    expect(
      screen.getByTestId('notification-video-placeholder', { includeHiddenElements: true }),
    ).toBeTruthy();
  });

  it('creates a video player with autoplay, loop, and mute', () => {
    render(<OnboardingNotificationScreen />);
    expect(useVideoPlayer).toHaveBeenCalledWith(expect.anything(), expect.any(Function));
    const setup = (useVideoPlayer as jest.Mock).mock.calls[0][1];
    const mockPlayer = { loop: false, muted: false, play: jest.fn() };
    setup(mockPlayer);
    expect(mockPlayer.loop).toBe(true);
    expect(mockPlayer.muted).toBe(true);
    expect(mockPlayer.play).toHaveBeenCalled();
  });
});
