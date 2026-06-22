import React from 'react';
import { Platform } from 'react-native';
import { screen, fireEvent, waitFor } from '@testing-library/react-native';
import { renderWithTheme as render } from '@/lib/theme/testUtils';
import LoginScreen from '@/screens/LoginScreen';
import { signInWithGoogle } from '@/lib/auth/google';
import { signInWithApple } from '@/lib/auth/apple';
import { getBoundProvider, DeviceAccountMismatchError } from '@/lib/auth/deviceAccount';

jest.mock('@/lib/auth/google');
jest.mock('@/lib/auth/apple');
jest.mock('@/lib/auth/deviceAccount', () => {
  const actual = jest.requireActual('@/lib/auth/deviceAccount');
  return {
    ...actual,
    getBoundProvider: jest.fn().mockResolvedValue(null),
  };
});

const mockedGetBoundProvider = getBoundProvider as jest.Mock;

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Platform.OS = 'ios';
    mockedGetBoundProvider.mockResolvedValue(null);
  });

  it('renders the Yomoyo logo image', () => {
    render(<LoginScreen />);
    expect(screen.getByTestId('yomoyo-logo')).toBeTruthy();
  });

  it('renders the subtitle', () => {
    render(<LoginScreen />);
    expect(screen.getByText('Book notes from friends.')).toBeTruthy();
  });

  it('renders the Google sign-in button with correct label', async () => {
    render(<LoginScreen />);
    expect(await screen.findByText('Continue with Google')).toBeTruthy();
  });

  it('renders the Google icon image', async () => {
    render(<LoginScreen />);
    expect(await screen.findByTestId('google-icon')).toBeTruthy();
  });

  it('renders the Apple sign-in button on iOS', async () => {
    Platform.OS = 'ios';
    render(<LoginScreen />);
    expect(await screen.findByTestId('apple-signin-button')).toBeTruthy();
  });

  it('does not render the Apple sign-in button on Android', async () => {
    Platform.OS = 'android';
    render(<LoginScreen />);
    await screen.findByText('Continue with Google');
    expect(screen.queryByTestId('apple-signin-button')).toBeNull();
  });

  it('shows only the Apple button when the device is bound to Apple', async () => {
    mockedGetBoundProvider.mockResolvedValue('apple');
    Platform.OS = 'ios';
    render(<LoginScreen />);
    expect(await screen.findByTestId('apple-signin-button')).toBeTruthy();
    expect(screen.queryByText('Continue with Google')).toBeNull();
  });

  it('shows both buttons when the device is bound to Google (Apple stays available)', async () => {
    mockedGetBoundProvider.mockResolvedValue('google');
    Platform.OS = 'ios';
    render(<LoginScreen />);
    expect(await screen.findByText('Continue with Google')).toBeTruthy();
    expect(screen.getByTestId('apple-signin-button')).toBeTruthy();
  });

  it('shows both buttons on first launch when no provider is bound', async () => {
    mockedGetBoundProvider.mockResolvedValue(null);
    Platform.OS = 'ios';
    render(<LoginScreen />);
    expect(await screen.findByText('Continue with Google')).toBeTruthy();
    expect(screen.getByTestId('apple-signin-button')).toBeTruthy();
  });

  it('calls signInWithGoogle when the Google button is pressed', async () => {
    render(<LoginScreen />);
    fireEvent.press(await screen.findByText('Continue with Google'));
    expect(signInWithGoogle).toHaveBeenCalledTimes(1);
  });

  it('calls signInWithApple when the Apple button is pressed on iOS', async () => {
    Platform.OS = 'ios';
    render(<LoginScreen />);
    fireEvent.press(await screen.findByTestId('apple-signin-button'));
    expect(signInWithApple).toHaveBeenCalledTimes(1);
  });

  it('shows an error message when signInWithGoogle throws a non-cancellation error', async () => {
    (signInWithGoogle as jest.Mock).mockRejectedValue(new Error('Network error'));
    render(<LoginScreen />);
    fireEvent.press(await screen.findByText('Continue with Google'));
    await waitFor(() => {
      expect(screen.getByText('Sign-in failed. Please try again.')).toBeTruthy();
    });
  });

  it('does not show an error when signInWithGoogle is cancelled by the user', async () => {
    (signInWithGoogle as jest.Mock).mockRejectedValue(new Error('Google sign-in cancelled'));
    render(<LoginScreen />);
    fireEvent.press(await screen.findByText('Continue with Google'));
    await waitFor(() => {
      expect(screen.queryByText('Sign-in failed. Please try again.')).toBeNull();
    });
  });

  it('shows an error message when signInWithApple throws', async () => {
    Platform.OS = 'ios';
    (signInWithApple as jest.Mock).mockRejectedValue(new Error('Apple error'));
    render(<LoginScreen />);
    fireEvent.press(await screen.findByTestId('apple-signin-button'));
    await waitFor(() => {
      expect(screen.getByText('Sign-in failed. Please try again.')).toBeTruthy();
    });
  });

  it('does not show an error when Apple sign-in is cancelled by the user', async () => {
    Platform.OS = 'ios';
    const cancelError = Object.assign(new Error('User cancelled'), { code: '1001' });
    (signInWithApple as jest.Mock).mockRejectedValue(cancelError);
    render(<LoginScreen />);
    fireEvent.press(await screen.findByTestId('apple-signin-button'));
    await waitFor(() => expect(signInWithApple).toHaveBeenCalled());
    expect(screen.queryByText('Sign-in failed. Please try again.')).toBeNull();
  });

  it('shows a device-bound message when signing in with the other provider is rejected', async () => {
    mockedGetBoundProvider.mockResolvedValue('google');
    Platform.OS = 'ios';
    (signInWithApple as jest.Mock).mockRejectedValue(new DeviceAccountMismatchError('google'));
    render(<LoginScreen />);
    fireEvent.press(await screen.findByTestId('apple-signin-button'));
    await waitFor(() => {
      expect(screen.getByText(/already set up with Google/)).toBeTruthy();
    });
  });

  it('clears the error message when the user retries', async () => {
    (signInWithGoogle as jest.Mock)
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValue(undefined);
    render(<LoginScreen />);

    fireEvent.press(await screen.findByText('Continue with Google'));
    await waitFor(() => {
      expect(screen.getByText('Sign-in failed. Please try again.')).toBeTruthy();
    });

    fireEvent.press(screen.getByText('Continue with Google'));
    await waitFor(() => {
      expect(screen.queryByText('Sign-in failed. Please try again.')).toBeNull();
    });
  });
});
