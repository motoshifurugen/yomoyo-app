import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react-native';
import FeedScreen from './FeedScreen';

const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ bottom: 0, top: 0, left: 0, right: 0 }),
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

jest.mock('@/lib/users/avatarIdentity', () => ({
  ANIMAL_ASSETS: { fox: 1, bear: 2 },
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
  displayLabel: 'Bold Bear',
  displayAvatar: 'bear',
};

const secondActivity = {
  ...mockActivity,
  id: 'act2',
  userId: 'user3',
  title: 'Kindred',
  displayLabel: 'Quiet Fox',
  displayAvatar: 'fox',
};

beforeEach(() => {
  jest.clearAllMocks();
  mockGetFollowingUids.mockResolvedValue(['user2']);
  mockGetFriendsFeed.mockResolvedValue({ items: [], lastDoc: null });
});

describe('FeedScreen — friend updates list', () => {
  it('renders without crashing', async () => {
    render(<FeedScreen />);
    await waitFor(() => expect(mockGetFollowingUids).toHaveBeenCalledWith('user1'));
  });

  it('does not render a tab toggle bar', async () => {
    render(<FeedScreen />);
    await waitFor(() => expect(mockGetFollowingUids).toHaveBeenCalled());
    expect(screen.queryByTestId('toggle-bar')).toBeNull();
    expect(screen.queryByTestId('tab-timeline')).toBeNull();
    expect(screen.queryByTestId('tab-updates')).toBeNull();
  });

  it('eagerly fetches the friend feed on mount', async () => {
    mockGetFollowingUids.mockResolvedValue(['user2']);
    render(<FeedScreen />);
    await waitFor(() => {
      expect(mockGetFollowingUids).toHaveBeenCalledWith('user1');
      expect(mockGetFriendsFeed).toHaveBeenCalledWith(['user2'], null);
    });
  });

  it('does not call getFriendsFeed when the user follows nobody', async () => {
    mockGetFollowingUids.mockResolvedValue([]);
    render(<FeedScreen />);
    await waitFor(() => expect(mockGetFollowingUids).toHaveBeenCalled());
    expect(mockGetFriendsFeed).not.toHaveBeenCalled();
  });

  it('shows the empty state when no items are present', async () => {
    render(<FeedScreen />);
    await waitFor(() => {
      expect(screen.getByText('timeline.emptyBody')).toBeTruthy();
    });
  });

  it('shows an inline add-friend button inside the empty state', async () => {
    render(<FeedScreen />);
    await waitFor(() => {
      expect(screen.getByTestId('add-friend-button-inline')).toBeTruthy();
    });
  });

  it('does not show the inline add-friend button once items are present', async () => {
    mockGetFriendsFeed.mockResolvedValue({ items: [mockActivity], lastDoc: null });
    render(<FeedScreen />);
    await waitFor(() => screen.getByText('Dune'));
    expect(screen.queryByTestId('add-friend-button-inline')).toBeNull();
  });

  it('renders activity rows when the friend feed returns items', async () => {
    mockGetFriendsFeed.mockResolvedValue({ items: [mockActivity], lastDoc: null });
    render(<FeedScreen />);
    await waitFor(() => {
      expect(screen.getByText('Dune')).toBeTruthy();
      expect(screen.getByText('Bold Bear')).toBeTruthy();
    });
  });

  it('does not render any in-row follow / unfollow buttons', async () => {
    mockGetFriendsFeed.mockResolvedValue({ items: [mockActivity], lastDoc: null });
    render(<FeedScreen />);
    await waitFor(() => screen.getByText('Dune'));
    expect(screen.queryByTestId('follow-user2')).toBeNull();
    expect(screen.queryByTestId('unfollow-user2')).toBeNull();
  });

  it('shows the error message when the feed fetch fails', async () => {
    mockGetFriendsFeed.mockRejectedValueOnce(new Error('network error'));
    render(<FeedScreen />);
    await waitFor(() => {
      expect(screen.getByText('timeline.loadErrorBody')).toBeTruthy();
    });
  });

  it('paginates when the list end is reached', async () => {
    const cursor = { id: 'cursor-doc' } as unknown as never;
    mockGetFriendsFeed
      .mockResolvedValueOnce({ items: [mockActivity], lastDoc: cursor })
      .mockResolvedValueOnce({ items: [secondActivity], lastDoc: null });
    render(<FeedScreen />);
    await waitFor(() => screen.getByTestId('updates-list'));
    fireEvent(screen.getByTestId('updates-list'), 'onEndReached');
    await waitFor(() => {
      expect(mockGetFriendsFeed).toHaveBeenCalledTimes(2);
      expect(mockGetFriendsFeed).toHaveBeenNthCalledWith(2, ['user2'], cursor);
    });
  });
});

describe('FeedScreen — row tap modal', () => {
  beforeEach(() => {
    mockGetFriendsFeed.mockResolvedValue({ items: [mockActivity], lastDoc: null });
  });

  it('opens the activity detail modal when a row is tapped', async () => {
    render(<FeedScreen />);
    await waitFor(() => screen.getByTestId('activity-row-act1'));
    await act(async () => {
      fireEvent.press(screen.getByTestId('activity-row-act1'));
    });
    expect(screen.getByTestId('activity-detail-modal')).toBeTruthy();
  });

  it('closes the modal when the close button is pressed', async () => {
    render(<FeedScreen />);
    await waitFor(() => screen.getByTestId('activity-row-act1'));
    await act(async () => {
      fireEvent.press(screen.getByTestId('activity-row-act1'));
    });
    await act(async () => {
      fireEvent.press(screen.getByTestId('modal-close-button'));
    });
    await waitFor(() => {
      expect(screen.queryByTestId('activity-detail-modal')).toBeNull();
    });
  });

  it('navigates to UserProfile and closes the modal when View profile is pressed', async () => {
    render(<FeedScreen />);
    await waitFor(() => screen.getByTestId('activity-row-act1'));
    await act(async () => {
      fireEvent.press(screen.getByTestId('activity-row-act1'));
    });
    await act(async () => {
      fireEvent.press(screen.getByTestId('modal-view-profile-button'));
    });
    expect(mockNavigate).toHaveBeenCalledWith('UserProfile', { uid: 'user2' });
    await waitFor(() => {
      expect(screen.queryByTestId('activity-detail-modal')).toBeNull();
    });
  });
});
