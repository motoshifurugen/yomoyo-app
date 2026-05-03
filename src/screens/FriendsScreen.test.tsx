import React from 'react';
import { render, screen } from '@testing-library/react-native';
import FriendsScreen from './FriendsScreen';

describe('FriendsScreen', () => {
  it('renders without crashing', () => {
    render(<FriendsScreen />);
  });

  it('renders the Friends title', () => {
    render(<FriendsScreen />);
    expect(screen.getByText('Friends')).toBeTruthy();
  });
});
