import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import OnboardingWelcomeScreen from './OnboardingWelcomeScreen';
import { signInWithGoogle } from '@/lib/auth/google';

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
  });

  it('renders the heading key', () => {
    render(<OnboardingWelcomeScreen />);
    expect(screen.getByText('onboarding.heading')).toBeTruthy();
  });

  it('renders the concept text key', () => {
    render(<OnboardingWelcomeScreen />);
    expect(screen.getByText('onboarding.concept')).toBeTruthy();
  });

  it('renders a Google sign-in button', () => {
    render(<OnboardingWelcomeScreen />);
    expect(screen.getByText('onboarding.signInWithGoogle')).toBeTruthy();
  });

  it('calls signInWithGoogle when the Google button is pressed', async () => {
    render(<OnboardingWelcomeScreen />);
    fireEvent.press(screen.getByText('onboarding.signInWithGoogle'));
    await waitFor(() => expect(signInWithGoogle).toHaveBeenCalled());
  });

  it('navigates to OnboardingNotification after Google sign-in succeeds', async () => {
    render(<OnboardingWelcomeScreen />);
    fireEvent.press(screen.getByText('onboarding.signInWithGoogle'));
    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith('OnboardingNotification')
    );
  });

  it('does not navigate when sign-in is cancelled', async () => {
    jest.mocked(signInWithGoogle).mockRejectedValueOnce(new Error('cancelled'));
    render(<OnboardingWelcomeScreen />);
    fireEvent.press(screen.getByText('onboarding.signInWithGoogle'));
    await waitFor(() => expect(signInWithGoogle).toHaveBeenCalled());
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
