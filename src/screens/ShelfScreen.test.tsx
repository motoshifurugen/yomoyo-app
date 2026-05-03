import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react-native';
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
  markAsFinished: jest.fn(() => Promise.resolve()),
}));

import { subscribeToReadingActivities, markAsFinished } from '@/lib/books/readingActivity';
const mockSubscribe = subscribeToReadingActivities as jest.Mock;
const mockMarkAsFinished = markAsFinished as jest.Mock;

describe('ShelfScreen', () => {
  beforeEach(() => {
    mockSubscribe.mockClear();
    mockMarkAsFinished.mockClear();
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

  it('shows empty Finished state when no finished books exist', () => {
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

  it('shows Mark as Finished button for each currently reading book', () => {
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
          status: 'reading',
        },
      ]);
      return jest.fn();
    });
    render(<ShelfScreen />);
    expect(screen.getByText('shelf.markAsFinished')).toBeTruthy();
  });

  it('calls markAsFinished with userId and bookId when button is pressed', () => {
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
          status: 'reading',
        },
      ]);
      return jest.fn();
    });
    render(<ShelfScreen />);
    fireEvent.press(screen.getByText('shelf.markAsFinished'));
    expect(mockMarkAsFinished).toHaveBeenCalledWith('user1', 'book123');
  });

  it('renders finished books in the Finished section', () => {
    mockSubscribe.mockImplementation((_userId: string, onUpdate: Function) => {
      onUpdate([
        {
          id: 'act1',
          userId: 'user1',
          bookId: 'book456',
          title: 'Finished Book',
          authors: ['Author'],
          thumbnail: null,
          startedAt: null,
          status: 'finished',
        },
      ]);
      return jest.fn();
    });
    render(<ShelfScreen />);
    expect(screen.getByText('Finished Book')).toBeTruthy();
    expect(screen.queryByText('shelf.emptyFinished')).toBeNull();
  });

  it('does not show finished books in Currently Reading', () => {
    mockSubscribe.mockImplementation((_userId: string, onUpdate: Function) => {
      onUpdate([
        {
          id: 'act1',
          userId: 'user1',
          bookId: 'book456',
          title: 'Finished Book',
          authors: ['Author'],
          thumbnail: null,
          startedAt: null,
          status: 'finished',
        },
      ]);
      return jest.fn();
    });
    render(<ShelfScreen />);
    expect(screen.queryByText('shelf.markAsFinished')).toBeNull();
    expect(screen.getByText('shelf.emptyCurrentlyReading')).toBeTruthy();
  });

  it('does not show currently reading books in the Finished section', () => {
    mockSubscribe.mockImplementation((_userId: string, onUpdate: Function) => {
      onUpdate([
        {
          id: 'act1',
          userId: 'user1',
          bookId: 'book123',
          title: 'Reading Book',
          authors: ['Author'],
          thumbnail: null,
          startedAt: null,
          status: 'reading',
        },
      ]);
      return jest.fn();
    });
    render(<ShelfScreen />);
    expect(screen.getByText('shelf.emptyFinished')).toBeTruthy();
  });

  it('does not crash when markAsFinished rejects', async () => {
    mockMarkAsFinished.mockRejectedValueOnce(new Error('network error'));
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
          status: 'reading',
        },
      ]);
      return jest.fn();
    });
    render(<ShelfScreen />);
    await act(async () => {
      fireEvent.press(screen.getByText('shelf.markAsFinished'));
    });
    expect(screen.getByText('Dune')).toBeTruthy();
  });

  it('logs error to console.error when markAsFinished rejects', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    const error = new Error('network error');
    mockMarkAsFinished.mockRejectedValueOnce(error);
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
          status: 'reading',
        },
      ]);
      return jest.fn();
    });
    render(<ShelfScreen />);
    await act(async () => {
      fireEvent.press(screen.getByText('shelf.markAsFinished'));
    });
    expect(consoleError).toHaveBeenCalledWith('Failed to mark as finished:', error);
    consoleError.mockRestore();
  });
});
