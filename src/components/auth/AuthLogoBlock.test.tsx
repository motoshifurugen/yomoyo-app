import React from 'react';
import { render, screen } from '@testing-library/react-native';
import AuthLogoBlock from './AuthLogoBlock';

describe('AuthLogoBlock', () => {
  it('renders the Yomoyo logo image', () => {
    render(<AuthLogoBlock />);
    expect(screen.getByTestId('yomoyo-logo')).toBeTruthy();
  });

  it('renders the subtitle text', () => {
    render(<AuthLogoBlock />);
    expect(screen.getByText('Book notes from friends.')).toBeTruthy();
  });
});
