import React from 'react';
import { Platform } from 'react-native';
import { screen, fireEvent, waitFor } from '@testing-library/react-native';
import { renderWithTheme as render } from '@/lib/theme/testUtils';
import LoginScreen from '@/screens/LoginScreen';
import { signInWithGoogle } from '@/lib/auth/google';
import { signInWithApple } from '@/lib/auth/apple';

jest.mock('@/lib/auth/google');
jest.mock('@/lib/auth/apple');

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Platform.OS = 'ios';
  });

  it('renders the Yomoyo logo image', () => {
    render(<LoginScreen />);
    expect(screen.getByTestId('yomoyo-logo')).toBeTruthy();
  });

  it('renders the subtitle', () => {
    render(<LoginScreen />);
    expect(screen.getByText('Book notes from friends.')).toBeTruthy();
  });

  it('renders the Google sign-in button with correct label', () => {
    render(<LoginScreen />);
    expect(screen.getByText('Continue with Google')).toBeTruthy();
  });

  it('renders the Google icon image', () => {
    render(<LoginScreen />);
    expect(screen.getByTestId('google-icon')).toBeTruthy();
  });

  it('renders the Apple sign-in button on iOS', () => {
    Platform.OS = 'ios';
    render(<LoginScreen />);
    expect(screen.getByTestId('apple-signin-button')).toBeTruthy();
  });

  it('does not render the Apple sign-in button on Android', () => {
    Platform.OS = 'android';
    render(<LoginScreen />);
    expect(screen.queryByTestId('apple-signin-button')).toBeNull();
  });

  it('calls signInWithGoogle when the Google button is pressed', () => {
    render(<LoginScreen />);
    fireEvent.press(screen.getByText('Continue with Google'));
    expect(signInWithGoogle).toHaveBeenCalledTimes(1);
  });

  it('calls signInWithApple when the Apple button is pressed on iOS', () => {
    Platform.OS = 'ios';
    render(<LoginScreen />);
    fireEvent.press(screen.getByTestId('apple-signin-button'));
    expect(signInWithApple).toHaveBeenCalledTimes(1);
  });

  it('shows an error message when signInWithGoogle throws a non-cancellation error', async () => {
    (signInWithGoogle as jest.Mock).mockRejectedValue(new Error('Network error'));
    render(<LoginScreen />);
    fireEvent.press(screen.getByText('Continue with Google'));
    await waitFor(() => {
      expect(screen.getByText('Sign-in failed. Please try again.')).toBeTruthy();
    });
  });

  it('does not show an error when signInWithGoogle is cancelled by the user', async () => {
    (signInWithGoogle as jest.Mock).mockRejectedValue(new Error('Google sign-in cancelled'));
    render(<LoginScreen />);
    fireEvent.press(screen.getByText('Continue with Google'));
    await waitFor(() => {
      expect(screen.queryByText('Sign-in failed. Please try again.')).toBeNull();
    });
  });

  it('shows an error message when signInWithApple throws', async () => {
    Platform.OS = 'ios';
    (signInWithApple as jest.Mock).mockRejectedValue(new Error('Apple error'));
    render(<LoginScreen />);
    fireEvent.press(screen.getByTestId('apple-signin-button'));
    await waitFor(() => {
      expect(screen.getByText('Sign-in failed. Please try again.')).toBeTruthy();
    });
  });

  it('does not show an error when Apple sign-in is cancelled by the user', async () => {
    Platform.OS = 'ios';
    const cancelError = Object.assign(new Error('User cancelled'), { code: '1001' });
    (signInWithApple as jest.Mock).mockRejectedValue(cancelError);
    render(<LoginScreen />);
    fireEvent.press(screen.getByTestId('apple-signin-button'));
    await waitFor(() => expect(signInWithApple).toHaveBeenCalled());
    expect(screen.queryByText('Sign-in failed. Please try again.')).toBeNull();
  });

  it('clears the error message when the user retries', async () => {
    (signInWithGoogle as jest.Mock)
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValue(undefined);
    render(<LoginScreen />);

    fireEvent.press(screen.getByText('Continue with Google'));
    await waitFor(() => {
      expect(screen.getByText('Sign-in failed. Please try again.')).toBeTruthy();
    });

    fireEvent.press(screen.getByText('Continue with Google'));
    await waitFor(() => {
      expect(screen.queryByText('Sign-in failed. Please try again.')).toBeNull();
    });
  });
});
