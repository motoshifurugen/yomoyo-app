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

const finishedActivity = {
  id: 'act1',
  userId: 'user1',
  bookId: 'book123',
  title: 'The Great Gatsby',
  authors: ['F. Scott Fitzgerald'],
  thumbnail: null,
  status: 'finished',
  finishedAt: null,
};

describe('ShelfScreen', () => {
  beforeEach(() => {
    mockSubscribe.mockClear();
    mockSubscribe.mockReturnValue(jest.fn());
  });

  it('does not render the Currently Reading section', () => {
    render(<ShelfScreen />);
    expect(screen.queryByText('shelf.currentlyReading')).toBeNull();
  });

  it('renders the Finished section header', () => {
    render(<ShelfScreen />);
    expect(screen.getByText('shelf.finished')).toBeTruthy();
  });

  it('shows empty Finished state when no finished books exist', () => {
    render(<ShelfScreen />);
    expect(screen.getByText('shelf.emptyFinished')).toBeTruthy();
  });

  it('subscribes to activities for the current user on mount', () => {
    render(<ShelfScreen />);
    expect(mockSubscribe).toHaveBeenCalledWith('user1', expect.any(Function));
  });

  it('renders book title when finished activities exist', () => {
    mockSubscribe.mockImplementation((_userId: string, onUpdate: Function) => {
      onUpdate([finishedActivity]);
      return jest.fn();
    });
    render(<ShelfScreen />);
    expect(screen.getByText('The Great Gatsby')).toBeTruthy();
  });

  it('renders author when finished activities exist', () => {
    mockSubscribe.mockImplementation((_userId: string, onUpdate: Function) => {
      onUpdate([finishedActivity]);
      return jest.fn();
    });
    render(<ShelfScreen />);
    expect(screen.getByText('F. Scott Fitzgerald')).toBeTruthy();
  });

  it('hides empty Finished state when finished activities exist', () => {
    mockSubscribe.mockImplementation((_userId: string, onUpdate: Function) => {
      onUpdate([finishedActivity]);
      return jest.fn();
    });
    render(<ShelfScreen />);
    expect(screen.queryByText('shelf.emptyFinished')).toBeNull();
  });

  it('thumbnail image has an accessibilityLabel matching the book title', () => {
    mockSubscribe.mockImplementation((_userId: string, onUpdate: Function) => {
      onUpdate([
        {
          ...finishedActivity,
          title: 'Accessible Book',
          thumbnail: 'https://example.com/cover.jpg',
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

  it('does not show a Mark as Finished button', () => {
    mockSubscribe.mockImplementation((_userId: string, onUpdate: Function) => {
      onUpdate([finishedActivity]);
      return jest.fn();
    });
    render(<ShelfScreen />);
    expect(screen.queryByText('shelf.markAsFinished')).toBeNull();
  });
});
