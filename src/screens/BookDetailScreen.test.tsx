import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react-native';
import { renderWithTheme as render } from '@/lib/theme/testUtils';
import BookDetailScreen from './BookDetailScreen';
import { useRoute } from '@react-navigation/native';

const mockBook = {
  id: 'abc',
  title: 'The Great Gatsby',
  authors: ['F. Scott Fitzgerald'],
  thumbnail: 'https://example.com/cover.jpg',
};

const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useRoute: jest.fn(),
  useNavigation: () => ({ navigate: mockNavigate }),
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

jest.mock('@/lib/users/avatarIdentity', () => ({
  getAvatarIdentity: jest.fn(() =>
    Promise.resolve({
      animalKey: 'fox',
      displayName: 'Quiet Fox',
      finalizedAt: null,
    }),
  ),
}));

import { getAvatarIdentity } from '@/lib/users/avatarIdentity';
const mockGetAvatarIdentity = getAvatarIdentity as jest.Mock;

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
    mockGetAvatarIdentity.mockClear();
    mockNavigate.mockClear();
  });

  it('does not show the view-in-shelf next action before finishing', () => {
    render(<BookDetailScreen />);
    expect(screen.queryByText('bookDetail.goToShelf')).toBeNull();
  });

  it('shows a view-in-shelf next action after finishing', async () => {
    render(<BookDetailScreen />);
    fireEvent.press(screen.getByText('shelf.markAsFinished'));
    await waitFor(() => {
      expect(screen.getByText('bookDetail.goToShelf')).toBeTruthy();
    });
  });

  it('navigates to the Shelf tab when the next action is pressed', async () => {
    render(<BookDetailScreen />);
    fireEvent.press(screen.getByText('shelf.markAsFinished'));
    await waitFor(() => screen.getByText('bookDetail.goToShelf'));
    fireEvent.press(screen.getByText('bookDetail.goToShelf'));
    expect(mockNavigate).toHaveBeenCalledWith('MainTabs', { screen: 'Shelf' });
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

  it('passes the avatar identity animalKey as displayAvatar when avatar identity exists', async () => {
    render(<BookDetailScreen />);
    fireEvent.press(screen.getByText('shelf.markAsFinished'));
    await waitFor(() => {
      expect(mockMarkAsFinished).toHaveBeenCalledWith('user1', mockBook, {
        displayName: 'Quiet Fox',
        displayAvatar: 'fox',
      });
    });
  });

  it('falls back to Firebase Auth displayName and null avatar when no avatar identity exists', async () => {
    mockGetAvatarIdentity.mockResolvedValueOnce(null);
    render(<BookDetailScreen />);
    fireEvent.press(screen.getByText('shelf.markAsFinished'));
    await waitFor(() => {
      expect(mockMarkAsFinished).toHaveBeenCalledWith('user1', mockBook, {
        displayName: 'Alice',
        displayAvatar: null,
      });
    });
  });

  it('shows Finished label and disables button after success', async () => {
    render(<BookDetailScreen />);
    fireEvent.press(screen.getByText('shelf.markAsFinished'));
    await waitFor(() => {
      expect(screen.getByText('shelf.finished')).toBeTruthy();
    });
    // The finished button is the first button; a second "view in shelf"
    // next-action button is also present after finishing.
    const [finishedButton] = screen.getAllByRole('button');
    expect(finishedButton.props.accessibilityState?.disabled).toBe(true);
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
