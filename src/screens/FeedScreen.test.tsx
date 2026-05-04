import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react-native';
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

jest.mock('@/lib/users/follows', () => ({
  getFollowingUids: jest.fn(() => Promise.resolve([])),
}));

jest.mock('@/lib/books/friendsFeed', () => ({
  getFriendsFeed: jest.fn(() => Promise.resolve({ items: [], lastDoc: null })),
}));

import { getFollowingUids } from '@/lib/users/follows';
import { getFriendsFeed } from '@/lib/books/friendsFeed';

const mockGetFollowingUids = getFollowingUids as jest.Mock;
const mockGetFriendsFeed = getFriendsFeed as jest.Mock;

const mockActivity = {
  id: 'act1',
  userId: 'user2',
  bookId: 'book1',
  title: 'Dune',
  authors: ['Frank Herbert'],
  thumbnail: null,
  status: 'finished' as const,
  finishedAt: null,
  displayLabel: 'Bob',
  displayAvatar: null,
};

describe('FeedScreen', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockGetFollowingUids.mockClear();
    mockGetFriendsFeed.mockClear();
    mockGetFollowingUids.mockResolvedValue([]);
    mockGetFriendsFeed.mockResolvedValue({ items: [], lastDoc: null });
  });

  it('renders the empty state when the user follows nobody', async () => {
    render(<FeedScreen />);
    await waitFor(() => {
      expect(screen.getByText('feed.emptyTitle')).toBeTruthy();
    });
  });

  it('renders the empty state body when following nobody', async () => {
    render(<FeedScreen />);
    await waitFor(() => {
      expect(screen.getByText('feed.emptyBody')).toBeTruthy();
    });
  });

  it('shows a search books button in the empty state', async () => {
    render(<FeedScreen />);
    await waitFor(() => {
      expect(screen.getByText('feed.searchBooks')).toBeTruthy();
    });
  });

  it('navigates to BookSearch when the search button is pressed', async () => {
    render(<FeedScreen />);
    await waitFor(() => screen.getByText('feed.searchBooks'));
    fireEvent.press(screen.getByText('feed.searchBooks'));
    expect(mockNavigate).toHaveBeenCalledWith('BookSearch');
  });

  it('fetches following UIDs for the current user on mount', async () => {
    render(<FeedScreen />);
    await waitFor(() => {
      expect(mockGetFollowingUids).toHaveBeenCalledWith('user1');
    });
  });

  it('calls getFriendsFeed with followed UIDs when the user follows someone', async () => {
    mockGetFollowingUids.mockResolvedValue(['user2', 'user3']);
    render(<FeedScreen />);
    await waitFor(() => {
      expect(mockGetFriendsFeed).toHaveBeenCalledWith(['user2', 'user3'], null);
    });
  });

  it('does not call getFriendsFeed when the user follows nobody', async () => {
    mockGetFollowingUids.mockResolvedValue([]);
    render(<FeedScreen />);
    await waitFor(() => {
      expect(mockGetFollowingUids).toHaveBeenCalled();
    });
    expect(mockGetFriendsFeed).not.toHaveBeenCalled();
  });

  it('renders activity cards when friends have finished books', async () => {
    mockGetFollowingUids.mockResolvedValue(['user2']);
    mockGetFriendsFeed.mockResolvedValue({ items: [mockActivity], lastDoc: null });

    render(<FeedScreen />);
    await waitFor(() => {
      expect(screen.getByText('Dune')).toBeTruthy();
    });
  });

  it('shows the displayLabel in each activity card', async () => {
    mockGetFollowingUids.mockResolvedValue(['user2']);
    mockGetFriendsFeed.mockResolvedValue({ items: [mockActivity], lastDoc: null });

    render(<FeedScreen />);
    await waitFor(() => {
      expect(screen.getByText('Bob')).toBeTruthy();
    });
  });

  it('shows the finishedReading label in each activity card', async () => {
    mockGetFollowingUids.mockResolvedValue(['user2']);
    mockGetFriendsFeed.mockResolvedValue({ items: [mockActivity], lastDoc: null });

    render(<FeedScreen />);
    await waitFor(() => {
      expect(screen.getByText('feed.finishedReading')).toBeTruthy();
    });
  });

  it('hides the empty state when activities are present', async () => {
    mockGetFollowingUids.mockResolvedValue(['user2']);
    mockGetFriendsFeed.mockResolvedValue({ items: [mockActivity], lastDoc: null });

    render(<FeedScreen />);
    await waitFor(() => {
      expect(screen.queryByText('feed.emptyTitle')).toBeNull();
    });
  });

  it('loads more activities when the list end is reached', async () => {
    const mockCursor = { id: 'cursor-doc' };
    mockGetFollowingUids.mockResolvedValue(['user2']);
    mockGetFriendsFeed
      .mockResolvedValueOnce({ items: [mockActivity], lastDoc: mockCursor })
      .mockResolvedValueOnce({ items: [], lastDoc: null });

    render(<FeedScreen />);
    await waitFor(() => screen.getByText('Dune'));

    fireEvent(screen.getByTestId('friends-feed-list'), 'onEndReached');

    await waitFor(() => {
      expect(mockGetFriendsFeed).toHaveBeenCalledTimes(2);
      expect(mockGetFriendsFeed).toHaveBeenNthCalledWith(2, ['user2'], mockCursor);
    });
  });

  it('does not load more when there is no lastDoc', async () => {
    mockGetFollowingUids.mockResolvedValue(['user2']);
    mockGetFriendsFeed.mockResolvedValue({ items: [mockActivity], lastDoc: null });

    render(<FeedScreen />);
    await waitFor(() => screen.getByText('Dune'));

    fireEvent(screen.getByTestId('friends-feed-list'), 'onEndReached');

    await waitFor(() => {
      expect(mockGetFriendsFeed).toHaveBeenCalledTimes(1);
    });
  });

  it('shows empty state when getFollowingUids rejects', async () => {
    mockGetFollowingUids.mockRejectedValueOnce(new Error('network error'));
    render(<FeedScreen />);
    await waitFor(() => {
      expect(screen.getByText('feed.emptyTitle')).toBeTruthy();
    });
  });

  it('shows empty state when getFriendsFeed rejects on initial load', async () => {
    mockGetFollowingUids.mockResolvedValue(['user2']);
    mockGetFriendsFeed.mockRejectedValueOnce(new Error('network error'));
    render(<FeedScreen />);
    await waitFor(() => {
      expect(screen.getByText('feed.emptyTitle')).toBeTruthy();
    });
  });

  it('allows retrying load more after getFriendsFeed rejects', async () => {
    const mockCursor = { id: 'cursor-doc' };
    mockGetFollowingUids.mockResolvedValue(['user2']);
    mockGetFriendsFeed
      .mockResolvedValueOnce({ items: [mockActivity], lastDoc: mockCursor })
      .mockRejectedValueOnce(new Error('network error'))
      .mockResolvedValueOnce({ items: [], lastDoc: null });

    render(<FeedScreen />);
    await waitFor(() => screen.getByText('Dune'));

    // First load more — rejects
    await act(async () => {
      fireEvent(screen.getByTestId('friends-feed-list'), 'onEndReached');
    });

    // Second load more — should work because isLoadingMore was reset after failure
    await act(async () => {
      fireEvent(screen.getByTestId('friends-feed-list'), 'onEndReached');
    });

    expect(mockGetFriendsFeed).toHaveBeenCalledTimes(3);
  });
});
