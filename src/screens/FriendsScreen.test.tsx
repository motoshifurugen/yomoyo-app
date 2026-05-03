import React from 'react';
import { render, screen } from '@testing-library/react-native';
import FriendsScreen from './FriendsScreen';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe('FriendsScreen', () => {
  it('renders without crashing', () => {
    render(<FriendsScreen />);
  });

  it('renders the empty state title key', () => {
    render(<FriendsScreen />);
    expect(screen.getByText('friends.emptyTitle')).toBeTruthy();
  });

  it('renders the empty state body key', () => {
    render(<FriendsScreen />);
    expect(screen.getByText('friends.emptyBody')).toBeTruthy();
  });
});
