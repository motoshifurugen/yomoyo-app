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
