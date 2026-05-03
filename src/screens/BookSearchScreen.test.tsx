import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import BookSearchScreen from './BookSearchScreen';
import { searchBooks } from '@/lib/books/searchBooks';

const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ navigate: mockNavigate }),
}));

jest.mock('@/lib/books/searchBooks', () => ({
  searchBooks: jest.fn(),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const mockBook = {
  id: 'abc',
  title: 'The Great Gatsby',
  authors: ['F. Scott Fitzgerald'],
  thumbnail: 'https://example.com/cover.jpg',
};

describe('BookSearchScreen', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    jest.mocked(searchBooks).mockClear();
  });

  it('renders a search input', () => {
    render(<BookSearchScreen />);
    expect(screen.getByPlaceholderText('bookSearch.placeholder')).toBeTruthy();
  });

  it('renders a search button', () => {
    render(<BookSearchScreen />);
    expect(screen.getByRole('button', { name: 'bookSearch.button' })).toBeTruthy();
  });

  it('shows a book result after search', async () => {
    jest.mocked(searchBooks).mockResolvedValue([mockBook]);
    render(<BookSearchScreen />);
    fireEvent.changeText(screen.getByPlaceholderText('bookSearch.placeholder'), 'gatsby');
    fireEvent.press(screen.getByRole('button', { name: 'bookSearch.button' }));
    expect(await screen.findByText('The Great Gatsby')).toBeTruthy();
    expect(await screen.findByText('F. Scott Fitzgerald')).toBeTruthy();
  });

  it('shows no results message when search returns empty', async () => {
    jest.mocked(searchBooks).mockResolvedValue([]);
    render(<BookSearchScreen />);
    fireEvent.changeText(screen.getByPlaceholderText('bookSearch.placeholder'), 'xyz');
    fireEvent.press(screen.getByRole('button', { name: 'bookSearch.button' }));
    expect(await screen.findByText('bookSearch.noResults')).toBeTruthy();
  });

  it('shows unknownAuthor key when authors is empty', async () => {
    jest.mocked(searchBooks).mockResolvedValue([{ ...mockBook, authors: [] }]);
    render(<BookSearchScreen />);
    fireEvent.changeText(screen.getByPlaceholderText('bookSearch.placeholder'), 'gatsby');
    fireEvent.press(screen.getByRole('button', { name: 'bookSearch.button' }));
    expect(await screen.findByText('bookSearch.unknownAuthor')).toBeTruthy();
  });

  it('navigates to BookDetail with the selected book when a result is tapped', async () => {
    jest.mocked(searchBooks).mockResolvedValue([mockBook]);
    render(<BookSearchScreen />);
    fireEvent.changeText(screen.getByPlaceholderText('bookSearch.placeholder'), 'gatsby');
    fireEvent.press(screen.getByRole('button', { name: 'bookSearch.button' }));
    fireEvent.press(await screen.findByText('The Great Gatsby'));
    expect(mockNavigate).toHaveBeenCalledWith('BookDetail', { book: mockBook });
  });

  it('shows rate limit error message when API returns 429', async () => {
    jest.mocked(searchBooks).mockRejectedValue(new Error('Books API error: 429'));
    render(<BookSearchScreen />);
    fireEvent.changeText(screen.getByPlaceholderText('bookSearch.placeholder'), 'gatsby');
    fireEvent.press(screen.getByRole('button', { name: 'bookSearch.button' }));
    expect(await screen.findByText('bookSearch.rateLimitError')).toBeTruthy();
  });

  it('shows generic search error for non-429 failures', async () => {
    jest.mocked(searchBooks).mockRejectedValue(new Error('Books API error: 500'));
    render(<BookSearchScreen />);
    fireEvent.changeText(screen.getByPlaceholderText('bookSearch.placeholder'), 'gatsby');
    fireEvent.press(screen.getByRole('button', { name: 'bookSearch.button' }));
    expect(await screen.findByText('bookSearch.searchError')).toBeTruthy();
  });

  it('does not fire a second search if one is already in flight', async () => {
    let resolveFirst!: (value: typeof mockBook[]) => void;
    const firstSearchPromise = new Promise<typeof mockBook[]>((resolve) => {
      resolveFirst = resolve;
    });
    jest.mocked(searchBooks).mockReturnValueOnce(firstSearchPromise);

    render(<BookSearchScreen />);
    fireEvent.changeText(screen.getByPlaceholderText('bookSearch.placeholder'), 'gatsby');

    fireEvent.press(screen.getByRole('button', { name: 'bookSearch.button' }));
    fireEvent.press(screen.getByRole('button', { name: 'bookSearch.button' }));

    resolveFirst([mockBook]);

    await screen.findByText('The Great Gatsby');
    expect(jest.mocked(searchBooks)).toHaveBeenCalledTimes(1);
  });

  it('does not show error after a successful search clears the previous error', async () => {
    jest.mocked(searchBooks).mockRejectedValueOnce(new Error('Books API error: 500'));
    jest.mocked(searchBooks).mockResolvedValueOnce([mockBook]);
    render(<BookSearchScreen />);
    fireEvent.changeText(screen.getByPlaceholderText('bookSearch.placeholder'), 'gatsby');
    fireEvent.press(screen.getByRole('button', { name: 'bookSearch.button' }));
    await screen.findByText('bookSearch.searchError');

    fireEvent.press(screen.getByRole('button', { name: 'bookSearch.button' }));
    expect(await screen.findByText('The Great Gatsby')).toBeTruthy();
    expect(screen.queryByText('bookSearch.searchError')).toBeNull();
  });
});
