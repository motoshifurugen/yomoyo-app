import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import OnboardingNotificationScreen from './OnboardingNotificationScreen';
import * as Notifications from 'expo-notifications';
import { markOnboardingDone } from '@/lib/onboarding';
import { finalizeAvatarIdentity } from '@/lib/users/avatarIdentity';
import { useVideoPlayer } from 'expo-video';

jest.mock('expo-notifications');
jest.mock('expo-video');

jest.mock('@/lib/onboarding', () => ({
  markOnboardingDone: jest.fn().mockResolvedValue(undefined),
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

const mockOnComplete = jest.fn();

describe('OnboardingNotificationScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOnComplete.mockClear();
  });

  it('renders the notification heading key', () => {
    render(<OnboardingNotificationScreen onComplete={mockOnComplete} />);
    expect(screen.getByText('onboarding.notificationHeading')).toBeTruthy();
  });

  it('renders a 3-step progress indicator at step 3 (all filled)', () => {
    render(<OnboardingNotificationScreen onComplete={mockOnComplete} />);
    expect(screen.getAllByTestId(/onboarding-progress-segment-/)).toHaveLength(3);
    expect(screen.getByTestId('onboarding-progress-segment-0').props.accessibilityState).toEqual(
      expect.objectContaining({ selected: true }),
    );
    expect(screen.getByTestId('onboarding-progress-segment-1').props.accessibilityState).toEqual(
      expect.objectContaining({ selected: true }),
    );
    expect(screen.getByTestId('onboarding-progress-segment-2').props.accessibilityState).toEqual(
      expect.objectContaining({ selected: true }),
    );
  });

  it('renders the notification body key', () => {
    render(<OnboardingNotificationScreen onComplete={mockOnComplete} />);
    expect(screen.getByText('onboarding.notificationBody')).toBeTruthy();
  });

  it('renders an allow button', () => {
    render(<OnboardingNotificationScreen onComplete={mockOnComplete} />);
    expect(screen.getByText('onboarding.allowButton')).toBeTruthy();
  });

  it('renders a skip option', () => {
    render(<OnboardingNotificationScreen onComplete={mockOnComplete} />);
    expect(screen.getByText('onboarding.skipLink')).toBeTruthy();
  });

  it('requests notification permission when allow is pressed', async () => {
    render(<OnboardingNotificationScreen onComplete={mockOnComplete} />);
    fireEvent.press(screen.getByText('onboarding.allowButton'));
    await waitFor(() =>
      expect(Notifications.requestPermissionsAsync).toHaveBeenCalled()
    );
  });

  it('marks onboarding done and calls onComplete after allow', async () => {
    render(<OnboardingNotificationScreen onComplete={mockOnComplete} />);
    fireEvent.press(screen.getByText('onboarding.allowButton'));
    await waitFor(() => expect(markOnboardingDone).toHaveBeenCalled());
    await waitFor(() => expect(mockOnComplete).toHaveBeenCalled());
  });

  it('marks onboarding done and calls onComplete after skip', async () => {
    render(<OnboardingNotificationScreen onComplete={mockOnComplete} />);
    fireEvent.press(screen.getByText('onboarding.skipLink'));
    await waitFor(() => expect(markOnboardingDone).toHaveBeenCalled());
    await waitFor(() => expect(mockOnComplete).toHaveBeenCalled());
  });

  it('finalizes avatar identity when allow is pressed', async () => {
    render(<OnboardingNotificationScreen onComplete={mockOnComplete} />);
    fireEvent.press(screen.getByText('onboarding.allowButton'));
    await waitFor(() => expect(finalizeAvatarIdentity).toHaveBeenCalledWith('user1'));
  });

  it('finalizes avatar identity when skip is pressed', async () => {
    render(<OnboardingNotificationScreen onComplete={mockOnComplete} />);
    fireEvent.press(screen.getByText('onboarding.skipLink'));
    await waitFor(() => expect(finalizeAvatarIdentity).toHaveBeenCalledWith('user1'));
  });

  it('still completes onboarding if finalizeAvatarIdentity throws during allow', async () => {
    (finalizeAvatarIdentity as jest.Mock).mockRejectedValueOnce(new Error('network error'));
    render(<OnboardingNotificationScreen onComplete={mockOnComplete} />);
    fireEvent.press(screen.getByText('onboarding.allowButton'));
    await waitFor(() => expect(mockOnComplete).toHaveBeenCalled());
  });

  it('still completes onboarding if finalizeAvatarIdentity throws during skip', async () => {
    (finalizeAvatarIdentity as jest.Mock).mockRejectedValueOnce(new Error('network error'));
    render(<OnboardingNotificationScreen onComplete={mockOnComplete} />);
    fireEvent.press(screen.getByText('onboarding.skipLink'));
    await waitFor(() => expect(mockOnComplete).toHaveBeenCalled());
  });

  it('does not request permission when skip is pressed', async () => {
    render(<OnboardingNotificationScreen onComplete={mockOnComplete} />);
    fireEvent.press(screen.getByText('onboarding.skipLink'));
    await waitFor(() => expect(mockOnComplete).toHaveBeenCalled());
    expect(Notifications.requestPermissionsAsync).not.toHaveBeenCalled();
  });

  it('still completes onboarding if requestPermissionsAsync throws', async () => {
    (Notifications.requestPermissionsAsync as jest.Mock).mockRejectedValueOnce(
      new Error('permission error')
    );
    render(<OnboardingNotificationScreen onComplete={mockOnComplete} />);
    fireEvent.press(screen.getByText('onboarding.allowButton'));
    await waitFor(() => expect(mockOnComplete).toHaveBeenCalled());
  });

  it('still completes onboarding if markOnboardingDone throws during allow', async () => {
    (markOnboardingDone as jest.Mock).mockRejectedValueOnce(
      new Error('storage error')
    );
    render(<OnboardingNotificationScreen onComplete={mockOnComplete} />);
    fireEvent.press(screen.getByText('onboarding.allowButton'));
    await waitFor(() => expect(mockOnComplete).toHaveBeenCalled());
  });

  it('still completes onboarding if markOnboardingDone throws during skip', async () => {
    (markOnboardingDone as jest.Mock).mockRejectedValueOnce(
      new Error('storage error')
    );
    render(<OnboardingNotificationScreen onComplete={mockOnComplete} />);
    fireEvent.press(screen.getByText('onboarding.skipLink'));
    await waitFor(() => expect(mockOnComplete).toHaveBeenCalled());
  });

  it('fetches expo push token when permission is granted', async () => {
    render(<OnboardingNotificationScreen onComplete={mockOnComplete} />);
    fireEvent.press(screen.getByText('onboarding.allowButton'));
    await waitFor(() => expect(Notifications.getExpoPushTokenAsync).toHaveBeenCalled());
  });

  it('does not fetch push token when permission is denied', async () => {
    (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValueOnce({
      status: 'denied',
    });
    render(<OnboardingNotificationScreen onComplete={mockOnComplete} />);
    fireEvent.press(screen.getByText('onboarding.allowButton'));
    await waitFor(() => expect(mockOnComplete).toHaveBeenCalled());
    expect(Notifications.getExpoPushTokenAsync).not.toHaveBeenCalled();
  });

  it('still completes onboarding if getExpoPushTokenAsync throws', async () => {
    (Notifications.getExpoPushTokenAsync as jest.Mock).mockRejectedValueOnce(
      new Error('token error')
    );
    render(<OnboardingNotificationScreen onComplete={mockOnComplete} />);
    fireEvent.press(screen.getByText('onboarding.allowButton'));
    await waitFor(() => expect(mockOnComplete).toHaveBeenCalled());
  });

  it('logs push token to console in dev mode', async () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    render(<OnboardingNotificationScreen onComplete={mockOnComplete} />);
    fireEvent.press(screen.getByText('onboarding.allowButton'));
    await waitFor(() => expect(mockOnComplete).toHaveBeenCalled());
    const pushTokenCalls = spy.mock.calls.filter(
      ([msg]) => typeof msg === 'string' && msg.startsWith('[PushToken]')
    );
    expect(pushTokenCalls.length).toBeGreaterThan(0);
    spy.mockRestore();
  });

  it('does not log push token in production mode', async () => {
    const originalDev = global.__DEV__;
    global.__DEV__ = false;
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      render(<OnboardingNotificationScreen onComplete={mockOnComplete} />);
      fireEvent.press(screen.getByText('onboarding.allowButton'));
      await waitFor(() => expect(mockOnComplete).toHaveBeenCalled());
      const pushTokenLogs = logSpy.mock.calls.filter(
        ([msg]) => typeof msg === 'string' && msg.startsWith('[PushToken]')
      );
      const pushTokenWarns = warnSpy.mock.calls.filter(
        ([msg]) => typeof msg === 'string' && msg.startsWith('[PushToken]')
      );
      expect(pushTokenLogs).toHaveLength(0);
      expect(pushTokenWarns).toHaveLength(0);
    } finally {
      global.__DEV__ = originalDev;
      logSpy.mockRestore();
      warnSpy.mockRestore();
    }
  });

  it('logs a warning when token fetch fails in dev mode', async () => {
    (Notifications.getExpoPushTokenAsync as jest.Mock).mockRejectedValueOnce(
      new Error('token error')
    );
    const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      render(<OnboardingNotificationScreen onComplete={mockOnComplete} />);
      fireEvent.press(screen.getByText('onboarding.allowButton'));
      await waitFor(() => expect(mockOnComplete).toHaveBeenCalled());
      const pushTokenWarns = spy.mock.calls.filter(
        ([msg]) => typeof msg === 'string' && msg.startsWith('[PushToken]')
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
      render(<OnboardingNotificationScreen onComplete={mockOnComplete} />);
      fireEvent.press(screen.getByText('onboarding.allowButton'));
      await waitFor(() => expect(mockOnComplete).toHaveBeenCalled());
      const projectIdWarns = spy.mock.calls.filter(
        ([msg]) => typeof msg === 'string' && msg.includes('eas init')
      );
      expect(projectIdWarns.length).toBeGreaterThan(0);
    } finally {
      spy.mockRestore();
    }
  });

  it('renders a video element', () => {
    render(<OnboardingNotificationScreen onComplete={mockOnComplete} />);
    expect(screen.getByTestId('notification-video')).toBeTruthy();
  });

  it('creates a video player with autoplay, loop, and mute', () => {
    render(<OnboardingNotificationScreen onComplete={mockOnComplete} />);
    expect(useVideoPlayer).toHaveBeenCalledWith(
      expect.anything(),
      expect.any(Function)
    );
    const setup = (useVideoPlayer as jest.Mock).mock.calls[0][1];
    const mockPlayer = { loop: false, muted: false, play: jest.fn() };
    setup(mockPlayer);
    expect(mockPlayer.loop).toBe(true);
    expect(mockPlayer.muted).toBe(true);
    expect(mockPlayer.play).toHaveBeenCalled();
  });
});
