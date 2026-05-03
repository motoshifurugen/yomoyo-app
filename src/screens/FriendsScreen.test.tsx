import React from 'react';
import { render, screen } from '@testing-library/react-native';
import FriendsScreen from './FriendsScreen';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ bottom: 0, top: 0, left: 0, right: 0 }),
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
