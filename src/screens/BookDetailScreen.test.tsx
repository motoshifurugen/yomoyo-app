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
  useAuth: () => ({ user: { uid: 'user1' }, loading: false }),
}));

jest.mock('@/lib/books/readingActivity', () => ({
  startReading: jest.fn(() => Promise.resolve()),
}));

import { startReading } from '@/lib/books/readingActivity';
const mockStartReading = startReading as jest.Mock;

describe('BookDetailScreen', () => {
  beforeEach(() => {
    jest.mocked(useRoute).mockReturnValue({
      params: { book: mockBook },
      key: 'BookDetail',
      name: 'BookDetail',
    });
    mockStartReading.mockClear();
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

  it('renders the Start Reading button', () => {
    render(<BookDetailScreen />);
    expect(screen.getByText('bookDetail.startReading')).toBeTruthy();
  });

  it('calls startReading with user uid and book when button is pressed', async () => {
    render(<BookDetailScreen />);
    fireEvent.press(screen.getByText('bookDetail.startReading'));
    await waitFor(() => {
      expect(mockStartReading).toHaveBeenCalledWith('user1', mockBook);
    });
  });

  it('shows Reading label after successfully pressing the button', async () => {
    render(<BookDetailScreen />);
    fireEvent.press(screen.getByText('bookDetail.startReading'));
    await waitFor(() => {
      expect(screen.getByText('bookDetail.reading')).toBeTruthy();
    });
  });

  it('returns to Start Reading label so the user can retry on failure', async () => {
    mockStartReading.mockRejectedValueOnce(new Error('network error'));
    render(<BookDetailScreen />);
    fireEvent.press(screen.getByText('bookDetail.startReading'));
    await waitFor(() => {
      expect(screen.getByText('bookDetail.startReading')).toBeTruthy();
    });
  });
});
