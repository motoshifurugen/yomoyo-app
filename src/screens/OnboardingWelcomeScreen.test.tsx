import React from 'react';
import { Platform } from 'react-native';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import OnboardingWelcomeScreen from './OnboardingWelcomeScreen';
import { signInWithGoogle } from '@/lib/auth/google';
import { signInWithApple } from '@/lib/auth/apple';

const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('@/lib/auth/google', () => ({
  signInWithGoogle: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/lib/auth/apple', () => ({
  signInWithApple: jest.fn().mockResolvedValue(undefined),
}));

describe('OnboardingWelcomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
    Platform.OS = 'ios';
  });

  it('renders the Yomoyo logo image', () => {
    render(<OnboardingWelcomeScreen />);
    expect(screen.getByTestId('yomoyo-logo')).toBeTruthy();
  });

  it('renders the subtitle', () => {
    render(<OnboardingWelcomeScreen />);
    expect(screen.getByText('Book notes from friends.')).toBeTruthy();
  });

  it('renders a Google sign-in button with correct label', () => {
    render(<OnboardingWelcomeScreen />);
    expect(screen.getByText('Continue with Google')).toBeTruthy();
  });

  it('renders the Google icon image', () => {
    render(<OnboardingWelcomeScreen />);
    expect(screen.getByTestId('google-icon')).toBeTruthy();
  });

  it('renders the Apple sign-in button on iOS', () => {
    Platform.OS = 'ios';
    render(<OnboardingWelcomeScreen />);
    expect(screen.getByTestId('apple-signin-button')).toBeTruthy();
  });

  it('does not render the Apple sign-in button on Android', () => {
    Platform.OS = 'android';
    render(<OnboardingWelcomeScreen />);
    expect(screen.queryByTestId('apple-signin-button')).toBeNull();
  });

  it('calls signInWithGoogle when the Google button is pressed', async () => {
    render(<OnboardingWelcomeScreen />);
    fireEvent.press(screen.getByText('Continue with Google'));
    await waitFor(() => expect(signInWithGoogle).toHaveBeenCalled());
  });

  it('navigates to OnboardingNotification after Google sign-in succeeds', async () => {
    render(<OnboardingWelcomeScreen />);
    fireEvent.press(screen.getByText('Continue with Google'));
    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith('OnboardingNotification')
    );
  });

  it('calls signInWithApple when the Apple button is pressed on iOS', async () => {
    Platform.OS = 'ios';
    render(<OnboardingWelcomeScreen />);
    fireEvent.press(screen.getByTestId('apple-signin-button'));
    await waitFor(() => expect(signInWithApple).toHaveBeenCalled());
  });

  it('navigates to OnboardingNotification after Apple sign-in succeeds', async () => {
    Platform.OS = 'ios';
    render(<OnboardingWelcomeScreen />);
    fireEvent.press(screen.getByTestId('apple-signin-button'));
    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith('OnboardingNotification')
    );
  });

  it('does not navigate when sign-in is cancelled', async () => {
    jest.mocked(signInWithGoogle).mockRejectedValueOnce(new Error('cancelled'));
    render(<OnboardingWelcomeScreen />);
    fireEvent.press(screen.getByText('Continue with Google'));
    await waitFor(() => expect(signInWithGoogle).toHaveBeenCalled());
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('shows an error message when signInWithGoogle fails', async () => {
    jest.mocked(signInWithGoogle).mockRejectedValueOnce(new Error('Network error'));
    render(<OnboardingWelcomeScreen />);
    fireEvent.press(screen.getByText('Continue with Google'));
    await waitFor(() => {
      expect(screen.getByText('onboarding.signInError')).toBeTruthy();
    });
  });

  it('does not show an error when Apple sign-in is cancelled by the user', async () => {
    Platform.OS = 'ios';
    const cancelError = Object.assign(new Error('User cancelled'), { code: '1001' });
    jest.mocked(signInWithApple).mockRejectedValueOnce(cancelError);
    render(<OnboardingWelcomeScreen />);
    fireEvent.press(screen.getByTestId('apple-signin-button'));
    await waitFor(() => expect(signInWithApple).toHaveBeenCalled());
    expect(screen.queryByText('onboarding.signInError')).toBeNull();
  });
});
