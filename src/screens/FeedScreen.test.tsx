import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import FeedScreen from './FeedScreen';

const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ navigate: mockNavigate }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe('FeedScreen', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('renders the empty state title key', () => {
    render(<FeedScreen />);
    expect(screen.getByText('feed.emptyTitle')).toBeTruthy();
  });

  it('renders the empty state body key', () => {
    render(<FeedScreen />);
    expect(screen.getByText('feed.emptyBody')).toBeTruthy();
  });

  it('shows a search books button', () => {
    render(<FeedScreen />);
    expect(screen.getByText('feed.searchBooks')).toBeTruthy();
  });

  it('navigates to BookSearch when the button is pressed', () => {
    render(<FeedScreen />);
    fireEvent.press(screen.getByText('feed.searchBooks'));
    expect(mockNavigate).toHaveBeenCalledWith('BookSearch');
  });

  it('the search books button has an accessible button role', () => {
    render(<FeedScreen />);
    expect(screen.getByRole('button', { name: 'feed.searchBooks' })).toBeTruthy();
  });
});
