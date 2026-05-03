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

  it('renders the feed title key', () => {
    render(<FeedScreen />);
    expect(screen.getByText('tabs.feed')).toBeTruthy();
  });

  it('shows a button with the go to book detail key', () => {
    render(<FeedScreen />);
    expect(screen.getByText('feed.goToBookDetail')).toBeTruthy();
  });

  it('navigates to BookDetail when the button is pressed', () => {
    render(<FeedScreen />);
    fireEvent.press(screen.getByText('feed.goToBookDetail'));
    expect(mockNavigate).toHaveBeenCalledWith('BookDetail');
  });

  it('the Book Detail button has an accessible button role', () => {
    render(<FeedScreen />);
    expect(screen.getByRole('button', { name: 'feed.goToBookDetail' })).toBeTruthy();
  });
});
