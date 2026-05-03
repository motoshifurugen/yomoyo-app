import React from 'react';
import { render, screen } from '@testing-library/react-native';
import SettingsScreen from './SettingsScreen';

describe('SettingsScreen', () => {
  it('renders without crashing', () => {
    render(<SettingsScreen />);
  });

  it('renders the Settings title', () => {
    render(<SettingsScreen />);
    expect(screen.getByText('Settings')).toBeTruthy();
  });
});
