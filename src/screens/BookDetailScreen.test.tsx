import React from 'react';
import { render, screen } from '@testing-library/react-native';
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

describe('BookDetailScreen', () => {
  beforeEach(() => {
    jest.mocked(useRoute).mockReturnValue({
      params: { book: mockBook },
      key: 'BookDetail',
      name: 'BookDetail',
    });
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
});
