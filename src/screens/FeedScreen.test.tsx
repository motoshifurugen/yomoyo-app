import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import FeedScreen from './FeedScreen';

const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ navigate: mockNavigate }),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ bottom: 0, top: 0, left: 0, right: 0 }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: { uid: 'user1' }, loading: false }),
}));

jest.mock('@/lib/books/readingActivity', () => ({
  subscribeToReadingActivities: jest.fn(() => jest.fn()),
}));

import { subscribeToReadingActivities } from '@/lib/books/readingActivity';
const mockSubscribe = subscribeToReadingActivities as jest.Mock;

describe('FeedScreen', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockSubscribe.mockClear();
    mockSubscribe.mockReturnValue(jest.fn());
  });

  it('renders the empty state title key when no activities', () => {
    render(<FeedScreen />);
    expect(screen.getByText('feed.emptyTitle')).toBeTruthy();
  });

  it('renders the empty state body key when no activities', () => {
    render(<FeedScreen />);
    expect(screen.getByText('feed.emptyBody')).toBeTruthy();
  });

  it('shows a search books button when no activities', () => {
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

  it('subscribes to activities for the current user on mount', () => {
    render(<FeedScreen />);
    expect(mockSubscribe).toHaveBeenCalledWith('user1', expect.any(Function));
  });

  it('renders activity cards when activities are present', () => {
    mockSubscribe.mockImplementation((_userId: string, onUpdate: Function) => {
      onUpdate([
        {
          id: 'act1',
          userId: 'user1',
          bookId: 'book123',
          title: 'The Great Gatsby',
          authors: ['F. Scott Fitzgerald'],
          thumbnail: null,
        },
      ]);
      return jest.fn();
    });

    render(<FeedScreen />);
    expect(screen.getByText('The Great Gatsby')).toBeTruthy();
  });

  it('shows startedReading label for each activity', () => {
    mockSubscribe.mockImplementation((_userId: string, onUpdate: Function) => {
      onUpdate([
        {
          id: 'act1',
          userId: 'user1',
          bookId: 'book123',
          title: 'Dune',
          authors: ['Frank Herbert'],
          thumbnail: null,
        },
      ]);
      return jest.fn();
    });

    render(<FeedScreen />);
    expect(screen.getByText('feed.startedReading')).toBeTruthy();
  });

  it('hides empty state when activities are present', () => {
    mockSubscribe.mockImplementation((_userId: string, onUpdate: Function) => {
      onUpdate([
        {
          id: 'act1',
          userId: 'user1',
          bookId: 'book123',
          title: 'Dune',
          authors: ['Frank Herbert'],
          thumbnail: null,
        },
      ]);
      return jest.fn();
    });

    render(<FeedScreen />);
    expect(screen.queryByText('feed.emptyTitle')).toBeNull();
  });

  it('unsubscribes on unmount', () => {
    const mockUnsubscribe = jest.fn();
    mockSubscribe.mockReturnValue(mockUnsubscribe);

    const { unmount } = render(<FeedScreen />);
    unmount();

    expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
  });
});
