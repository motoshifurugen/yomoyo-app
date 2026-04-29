import React from 'react';
import { render, screen } from '@testing-library/react-native';
import HomeScreen from './HomeScreen';

describe('HomeScreen', () => {
  it('renders the app name', () => {
    render(<HomeScreen />);
    expect(screen.getByText('Yomoyo')).toBeTruthy();
  });

  it('renders the welcome message', () => {
    render(<HomeScreen />);
    expect(screen.getByText('A warm reading app')).toBeTruthy();
  });
});
