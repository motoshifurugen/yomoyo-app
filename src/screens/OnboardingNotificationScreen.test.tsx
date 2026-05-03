import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import OnboardingNotificationScreen from './OnboardingNotificationScreen';
import * as Notifications from 'expo-notifications';
import { markOnboardingDone } from '@/lib/onboarding';

jest.mock('expo-notifications');

jest.mock('@/lib/onboarding', () => ({
  markOnboardingDone: jest.fn().mockResolvedValue(undefined),
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

  it('does not request permission when skip is pressed', async () => {
    render(<OnboardingNotificationScreen onComplete={mockOnComplete} />);
    fireEvent.press(screen.getByText('onboarding.skipLink'));
    await waitFor(() => expect(mockOnComplete).toHaveBeenCalled());
    expect(Notifications.requestPermissionsAsync).not.toHaveBeenCalled();
  });
});
