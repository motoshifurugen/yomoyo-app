import React from 'react';
import { render, screen } from '@testing-library/react-native';
import ShelfScreen from './ShelfScreen';

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

describe('ShelfScreen', () => {
  beforeEach(() => {
    mockSubscribe.mockClear();
    mockSubscribe.mockReturnValue(jest.fn());
  });

  it('renders the Currently Reading section header', () => {
    render(<ShelfScreen />);
    expect(screen.getByText('shelf.currentlyReading')).toBeTruthy();
  });

  it('renders the Finished section header', () => {
    render(<ShelfScreen />);
    expect(screen.getByText('shelf.finished')).toBeTruthy();
  });

  it('shows empty state when no activities in Currently Reading', () => {
    render(<ShelfScreen />);
    expect(screen.getByText('shelf.emptyCurrentlyReading')).toBeTruthy();
  });

  it('always shows empty state in Finished section', () => {
    render(<ShelfScreen />);
    expect(screen.getByText('shelf.emptyFinished')).toBeTruthy();
  });

  it('subscribes to activities for the current user on mount', () => {
    render(<ShelfScreen />);
    expect(mockSubscribe).toHaveBeenCalledWith('user1', expect.any(Function));
  });

  it('renders book title when activities exist', () => {
    mockSubscribe.mockImplementation((_userId: string, onUpdate: Function) => {
      onUpdate([
        {
          id: 'act1',
          userId: 'user1',
          bookId: 'book123',
          title: 'The Great Gatsby',
          authors: ['F. Scott Fitzgerald'],
          thumbnail: null,
          startedAt: null,
        },
      ]);
      return jest.fn();
    });
    render(<ShelfScreen />);
    expect(screen.getByText('The Great Gatsby')).toBeTruthy();
  });

  it('renders author when activities exist', () => {
    mockSubscribe.mockImplementation((_userId: string, onUpdate: Function) => {
      onUpdate([
        {
          id: 'act1',
          userId: 'user1',
          bookId: 'book123',
          title: 'The Great Gatsby',
          authors: ['F. Scott Fitzgerald'],
          thumbnail: null,
          startedAt: null,
        },
      ]);
      return jest.fn();
    });
    render(<ShelfScreen />);
    expect(screen.getByText('F. Scott Fitzgerald')).toBeTruthy();
  });

  it('hides empty Currently Reading state when activities exist', () => {
    mockSubscribe.mockImplementation((_userId: string, onUpdate: Function) => {
      onUpdate([
        {
          id: 'act1',
          userId: 'user1',
          bookId: 'book123',
          title: 'Dune',
          authors: ['Frank Herbert'],
          thumbnail: null,
          startedAt: null,
        },
      ]);
      return jest.fn();
    });
    render(<ShelfScreen />);
    expect(screen.queryByText('shelf.emptyCurrentlyReading')).toBeNull();
  });

  it('thumbnail image has an accessibilityLabel matching the book title', () => {
    mockSubscribe.mockImplementation((_userId: string, onUpdate: Function) => {
      onUpdate([
        {
          id: 'act1',
          userId: 'user1',
          bookId: 'book123',
          title: 'Accessible Book',
          authors: ['Author'],
          thumbnail: 'https://example.com/cover.jpg',
          startedAt: null,
        },
      ]);
      return jest.fn();
    });
    render(<ShelfScreen />);
    expect(screen.getByLabelText('Accessible Book')).toBeTruthy();
  });

  it('unsubscribes on unmount', () => {
    const mockUnsubscribe = jest.fn();
    mockSubscribe.mockReturnValue(mockUnsubscribe);
    const { unmount } = render(<ShelfScreen />);
    unmount();
    expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
  });
});
