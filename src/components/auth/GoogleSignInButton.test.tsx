import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import GoogleSignInButton from './GoogleSignInButton';

describe('GoogleSignInButton', () => {
  it('renders the button label', () => {
    render(<GoogleSignInButton onPress={jest.fn()} />);
    expect(screen.getByText('Continue with Google')).toBeTruthy();
  });

  it('renders the Google icon image', () => {
    render(<GoogleSignInButton onPress={jest.fn()} />);
    expect(screen.getByTestId('google-icon')).toBeTruthy();
  });

  it('calls onPress when tapped', () => {
    const onPress = jest.fn();
    render(<GoogleSignInButton onPress={onPress} />);
    fireEvent.press(screen.getByText('Continue with Google'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
