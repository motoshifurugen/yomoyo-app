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

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
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

describe('OnboardingWelcomeScreen (intro + inline sign-in)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
    Platform.OS = 'ios';
  });

  it('renders a 3-step progress indicator at step 1', () => {
    render(<OnboardingWelcomeScreen />);
    expect(screen.getAllByTestId(/onboarding-progress-segment-/)).toHaveLength(3);
    expect(screen.getByTestId('onboarding-progress-segment-0').props.accessibilityState).toEqual(
      expect.objectContaining({ selected: true }),
    );
    expect(screen.getByTestId('onboarding-progress-segment-1').props.accessibilityState).toEqual(
      expect.objectContaining({ selected: false }),
    );
  });

  it('renders the intro heading and body copy', () => {
    render(<OnboardingWelcomeScreen />);
    expect(screen.getByText('onboarding.introHeading')).toBeTruthy();
    expect(screen.getByText('onboarding.introBody')).toBeTruthy();
  });

  it('renders the Yomoyo hero image', () => {
    render(<OnboardingWelcomeScreen />);
    expect(screen.getByTestId('yomoyo-logo')).toBeTruthy();
  });

  it('renders a Google sign-in button as the inline get-started action', () => {
    render(<OnboardingWelcomeScreen />);
    expect(screen.getByText('Continue with Google')).toBeTruthy();
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

  it('navigates to OnboardingAvatar after Google sign-in succeeds', async () => {
    render(<OnboardingWelcomeScreen />);
    fireEvent.press(screen.getByText('Continue with Google'));
    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith('OnboardingAvatar')
    );
  });

  it('calls signInWithApple when the Apple button is pressed on iOS', async () => {
    Platform.OS = 'ios';
    render(<OnboardingWelcomeScreen />);
    fireEvent.press(screen.getByTestId('apple-signin-button'));
    await waitFor(() => expect(signInWithApple).toHaveBeenCalled());
  });

  it('navigates to OnboardingAvatar after Apple sign-in succeeds', async () => {
    Platform.OS = 'ios';
    render(<OnboardingWelcomeScreen />);
    fireEvent.press(screen.getByTestId('apple-signin-button'));
    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith('OnboardingAvatar')
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
