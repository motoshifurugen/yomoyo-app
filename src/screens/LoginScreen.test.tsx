import React from 'react';
import { Platform } from 'react-native';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import LoginScreen from '@/screens/LoginScreen';
import { signInWithGoogle } from '@/lib/auth/google';
import { signInWithApple } from '@/lib/auth/apple';

jest.mock('@/lib/auth/google');
jest.mock('@/lib/auth/apple');

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the Google sign-in button', () => {
    render(<LoginScreen />);
    expect(screen.getByText('Sign in with Google')).toBeTruthy();
  });

  it('renders the Apple sign-in button on iOS', () => {
    Platform.OS = 'ios';
    render(<LoginScreen />);
    expect(screen.getByText('Sign in with Apple')).toBeTruthy();
  });

  it('does not render the Apple sign-in button on Android', () => {
    Platform.OS = 'android';
    render(<LoginScreen />);
    expect(screen.queryByText('Sign in with Apple')).toBeNull();
  });

  it('calls signInWithGoogle when the Google button is pressed', () => {
    render(<LoginScreen />);
    fireEvent.press(screen.getByText('Sign in with Google'));
    expect(signInWithGoogle).toHaveBeenCalledTimes(1);
  });

  it('calls signInWithApple when the Apple button is pressed on iOS', () => {
    Platform.OS = 'ios';
    render(<LoginScreen />);
    fireEvent.press(screen.getByText('Sign in with Apple'));
    expect(signInWithApple).toHaveBeenCalledTimes(1);
  });

  it('shows an error message when signInWithGoogle throws a non-cancellation error', async () => {
    (signInWithGoogle as jest.Mock).mockRejectedValue(new Error('Network error'));
    render(<LoginScreen />);
    fireEvent.press(screen.getByText('Sign in with Google'));
    await waitFor(() => {
      expect(screen.getByText('Sign-in failed. Please try again.')).toBeTruthy();
    });
  });

  it('does not show an error when signInWithGoogle is cancelled by the user', async () => {
    (signInWithGoogle as jest.Mock).mockRejectedValue(new Error('Google sign-in cancelled'));
    render(<LoginScreen />);
    fireEvent.press(screen.getByText('Sign in with Google'));
    await waitFor(() => {
      expect(screen.queryByText('Sign-in failed. Please try again.')).toBeNull();
    });
  });

  it('shows an error message when signInWithApple throws', async () => {
    Platform.OS = 'ios';
    (signInWithApple as jest.Mock).mockRejectedValue(new Error('Apple error'));
    render(<LoginScreen />);
    fireEvent.press(screen.getByText('Sign in with Apple'));
    await waitFor(() => {
      expect(screen.getByText('Sign-in failed. Please try again.')).toBeTruthy();
    });
  });

  it('clears the error message when the user retries', async () => {
    (signInWithGoogle as jest.Mock)
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValue(undefined);
    render(<LoginScreen />);

    fireEvent.press(screen.getByText('Sign in with Google'));
    await waitFor(() => {
      expect(screen.getByText('Sign-in failed. Please try again.')).toBeTruthy();
    });

    fireEvent.press(screen.getByText('Sign in with Google'));
    await waitFor(() => {
      expect(screen.queryByText('Sign-in failed. Please try again.')).toBeNull();
    });
  });
});
