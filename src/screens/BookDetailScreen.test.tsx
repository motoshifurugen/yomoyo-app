import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import BookDetailScreen from './BookDetailScreen';
import { useRoute } from '@react-navigation/native';

const mockBook = {
  id: 'abc',
  title: 'The Great Gatsby',
  authors: ['F. Scott Fitzgerald'],
  thumbnail: 'https://example.com/cover.jpg',
};

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useRoute: jest.fn(),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      uid: 'user1',
      displayName: 'Alice',
      photoURL: 'https://example.com/avatar.jpg',
      email: 'alice@example.com',
    },
    loading: false,
  }),
}));

jest.mock('@/lib/books/readingActivity', () => ({
  markAsFinished: jest.fn(() => Promise.resolve()),
}));

import { markAsFinished } from '@/lib/books/readingActivity';
const mockMarkAsFinished = markAsFinished as jest.Mock;

describe('BookDetailScreen', () => {
  beforeEach(() => {
    jest.mocked(useRoute).mockReturnValue({
      params: { book: mockBook },
      key: 'BookDetail',
      name: 'BookDetail',
    });
    mockMarkAsFinished.mockClear();
  });

  it('renders the book title', () => {
    render(<BookDetailScreen />);
    expect(screen.getByText('The Great Gatsby')).toBeTruthy();
  });

  it('renders the book authors', () => {
    render(<BookDetailScreen />);
    expect(screen.getByText('F. Scott Fitzgerald')).toBeTruthy();
  });

  it('renders a thumbnail image when available', () => {
    render(<BookDetailScreen />);
    expect(screen.getByTestId('book-thumbnail')).toBeTruthy();
  });

  it('does not render thumbnail when thumbnail is null', () => {
    jest.mocked(useRoute).mockReturnValue({
      params: { book: { ...mockBook, thumbnail: null } },
      key: 'BookDetail',
      name: 'BookDetail',
    });
    render(<BookDetailScreen />);
    expect(screen.queryByTestId('book-thumbnail')).toBeNull();
  });

  it('shows unknownAuthor key when authors is empty', () => {
    jest.mocked(useRoute).mockReturnValue({
      params: { book: { ...mockBook, authors: [] } },
      key: 'BookDetail',
      name: 'BookDetail',
    });
    render(<BookDetailScreen />);
    expect(screen.getByText('bookDetail.unknownAuthor')).toBeTruthy();
  });

  it('renders the Mark as Finished button', () => {
    render(<BookDetailScreen />);
    expect(screen.getByText('shelf.markAsFinished')).toBeTruthy();
  });

  it('calls markAsFinished with userId, book, and presenter when button is pressed', async () => {
    render(<BookDetailScreen />);
    fireEvent.press(screen.getByText('shelf.markAsFinished'));
    await waitFor(() => {
      expect(mockMarkAsFinished).toHaveBeenCalledWith('user1', mockBook, {
        displayLabel: 'Alice',
        displayAvatar: 'https://example.com/avatar.jpg',
      });
    });
  });

  it('uses email prefix as displayLabel fallback when displayName is null', async () => {
    jest.mock('@/hooks/useAuth', () => ({
      useAuth: () => ({
        user: {
          uid: 'user1',
          displayName: null,
          photoURL: null,
          email: 'alice@example.com',
        },
        loading: false,
      }),
    }));

    render(<BookDetailScreen />);
    fireEvent.press(screen.getByText('shelf.markAsFinished'));
    await waitFor(() => {
      expect(mockMarkAsFinished).toHaveBeenCalledWith('user1', mockBook, expect.objectContaining({
        displayLabel: expect.any(String),
      }));
    });
  });

  it('shows Finished label and disables button after success', async () => {
    render(<BookDetailScreen />);
    fireEvent.press(screen.getByText('shelf.markAsFinished'));
    await waitFor(() => {
      expect(screen.getByText('shelf.finished')).toBeTruthy();
    });
    expect(screen.getByRole('button').props.accessibilityState?.disabled).toBe(true);
  });

  it('returns to Mark as Finished label so the user can retry on failure', async () => {
    mockMarkAsFinished.mockRejectedValueOnce(new Error('network error'));
    render(<BookDetailScreen />);
    fireEvent.press(screen.getByText('shelf.markAsFinished'));
    await waitFor(() => {
      expect(screen.getByText('shelf.markAsFinished')).toBeTruthy();
    });
  });
});
