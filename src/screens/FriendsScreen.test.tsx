import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react-native';
import FriendsScreen from './FriendsScreen';

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
  followUser: jest.fn(() => Promise.resolve()),
  unfollowUser: jest.fn(() => Promise.resolve()),
  getFollowingUids: jest.fn(() => Promise.resolve([])),
  getFollowingProfiles: jest.fn(() => Promise.resolve([])),
}));

jest.mock('@/lib/books/timeline', () => ({
  getTimeline: jest.fn(() => Promise.resolve({ items: [], lastDoc: null })),
}));

jest.mock('@/lib/users/avatarIdentity', () => ({
  ANIMAL_ASSETS: { fox: 1, bear: 2 },
}));

import { followUser, unfollowUser, getFollowingUids, getFollowingProfiles } from '@/lib/users/follows';
import { getTimeline } from '@/lib/books/timeline';

const mockFollowUser = followUser as jest.Mock;
const mockUnfollowUser = unfollowUser as jest.Mock;
const mockGetFollowingUids = getFollowingUids as jest.Mock;
const mockGetFollowingProfiles = getFollowingProfiles as jest.Mock;
const mockGetTimeline = getTimeline as jest.Mock;

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

const mockOwnActivity = {
  ...mockActivity,
  id: 'act_self',
  userId: 'user1',
  displayLabel: 'Quiet Fox',
  displayAvatar: 'fox',
};

beforeEach(() => {
  jest.clearAllMocks();
  mockGetTimeline.mockResolvedValue({ items: [], lastDoc: null });
  mockGetFollowingUids.mockResolvedValue([]);
  mockGetFollowingProfiles.mockResolvedValue([]);
});

describe('FriendsScreen — toggle', () => {
  it('renders without crashing', () => {
    render(<FriendsScreen />);
  });

  it('shows the Timeline tab button', () => {
    render(<FriendsScreen />);
    expect(screen.getByTestId('tab-timeline')).toBeTruthy();
  });

  it('shows the Friends tab button', () => {
    render(<FriendsScreen />);
    expect(screen.getByTestId('tab-friends')).toBeTruthy();
  });

  it('shows Timeline tab as the default selected view', async () => {
    render(<FriendsScreen />);
    await waitFor(() => {
      expect(screen.getByText('friends.timelineTab')).toBeTruthy();
    });
  });

  it('switches to Friends view when Friends tab is pressed', async () => {
    render(<FriendsScreen />);
    await act(async () => {
      fireEvent.press(screen.getByTestId('tab-friends'));
    });
    await waitFor(() => {
      expect(mockGetFollowingProfiles).toHaveBeenCalledWith('user1');
    });
  });
});

describe('FriendsScreen — Timeline view', () => {
  it('fetches timeline and following UIDs on mount', async () => {
    render(<FriendsScreen />);
    await waitFor(() => {
      expect(mockGetTimeline).toHaveBeenCalledWith(null);
      expect(mockGetFollowingUids).toHaveBeenCalledWith('user1');
    });
  });

  it('shows empty state when no timeline items', async () => {
    render(<FriendsScreen />);
    await waitFor(() => {
      expect(screen.getByText('friends.timelineEmptyTitle')).toBeTruthy();
    });
  });

  it('renders activity cards when timeline has items', async () => {
    mockGetTimeline.mockResolvedValue({ items: [mockActivity], lastDoc: null });
    render(<FriendsScreen />);
    await waitFor(() => {
      expect(screen.getByText('Dune')).toBeTruthy();
      expect(screen.getByText('Bold Bear')).toBeTruthy();
    });
  });

  it('shows Follow button for non-followed users', async () => {
    mockGetTimeline.mockResolvedValue({ items: [mockActivity], lastDoc: null });
    mockGetFollowingUids.mockResolvedValue([]);
    render(<FriendsScreen />);
    await waitFor(() => {
      expect(screen.getByTestId('follow-user2')).toBeTruthy();
    });
  });

  it('shows Following button for already-followed users', async () => {
    mockGetTimeline.mockResolvedValue({ items: [mockActivity], lastDoc: null });
    mockGetFollowingUids.mockResolvedValue(['user2']);
    render(<FriendsScreen />);
    await waitFor(() => {
      expect(screen.getByTestId('unfollow-user2')).toBeTruthy();
    });
  });

  it("does not show a follow button for the current user's own activity", async () => {
    mockGetTimeline.mockResolvedValue({ items: [mockOwnActivity], lastDoc: null });
    render(<FriendsScreen />);
    await waitFor(() => {
      expect(screen.queryByTestId('follow-user1')).toBeNull();
      expect(screen.queryByTestId('unfollow-user1')).toBeNull();
    });
  });

  it('calls followUser when Follow is pressed', async () => {
    mockGetTimeline.mockResolvedValue({ items: [mockActivity], lastDoc: null });
    render(<FriendsScreen />);
    await waitFor(() => screen.getByTestId('follow-user2'));
    fireEvent.press(screen.getByTestId('follow-user2'));
    expect(mockFollowUser).toHaveBeenCalledWith('user1', 'user2');
  });

  it('calls unfollowUser when Following is pressed on a followed user', async () => {
    mockGetTimeline.mockResolvedValue({ items: [mockActivity], lastDoc: null });
    mockGetFollowingUids.mockResolvedValue(['user2']);
    render(<FriendsScreen />);
    await waitFor(() => screen.getByTestId('unfollow-user2'));
    fireEvent.press(screen.getByTestId('unfollow-user2'));
    expect(mockUnfollowUser).toHaveBeenCalledWith('user1', 'user2');
  });

  it('optimistically switches button state after Follow press', async () => {
    mockGetTimeline.mockResolvedValue({ items: [mockActivity], lastDoc: null });
    render(<FriendsScreen />);
    await waitFor(() => screen.getByTestId('follow-user2'));
    fireEvent.press(screen.getByTestId('follow-user2'));
    await waitFor(() => {
      expect(screen.getByTestId('unfollow-user2')).toBeTruthy();
    });
  });

  it('loads more activities when list end is reached', async () => {
    const mockCursor = { id: 'cursor-doc' };
    mockGetTimeline
      .mockResolvedValueOnce({ items: [mockActivity], lastDoc: mockCursor })
      .mockResolvedValueOnce({ items: [], lastDoc: null });
    render(<FriendsScreen />);
    await waitFor(() => screen.getByTestId('timeline-list'));
    fireEvent(screen.getByTestId('timeline-list'), 'onEndReached');
    await waitFor(() => {
      expect(mockGetTimeline).toHaveBeenCalledTimes(2);
      expect(mockGetTimeline).toHaveBeenNthCalledWith(2, mockCursor);
    });
  });
});

describe('FriendsScreen — Friends view', () => {
  it('shows friends empty state when following nobody', async () => {
    render(<FriendsScreen />);
    await act(async () => {
      fireEvent.press(screen.getByTestId('tab-friends'));
    });
    await waitFor(() => {
      expect(screen.getByText('friends.updatesEmptyTitle')).toBeTruthy();
    });
  });

  it('renders friend profiles in the Friends view', async () => {
    mockGetFollowingProfiles.mockResolvedValue([
      { uid: 'user2', displayLabel: 'Bold Bear', animalKey: 'bear' },
    ]);
    render(<FriendsScreen />);
    await act(async () => {
      fireEvent.press(screen.getByTestId('tab-friends'));
    });
    await waitFor(() => {
      expect(screen.getByText('Bold Bear')).toBeTruthy();
    });
  });

  it('shows an Unfollow button for each friend', async () => {
    mockGetFollowingProfiles.mockResolvedValue([
      { uid: 'user2', displayLabel: 'Bold Bear', animalKey: 'bear' },
    ]);
    render(<FriendsScreen />);
    await act(async () => {
      fireEvent.press(screen.getByTestId('tab-friends'));
    });
    await waitFor(() => {
      expect(screen.getByTestId('unfollow-friend-user2')).toBeTruthy();
    });
  });

  it('calls unfollowUser when Unfollow is pressed in Friends view', async () => {
    mockGetFollowingProfiles.mockResolvedValue([
      { uid: 'user2', displayLabel: 'Bold Bear', animalKey: 'bear' },
    ]);
    render(<FriendsScreen />);
    await act(async () => {
      fireEvent.press(screen.getByTestId('tab-friends'));
    });
    await waitFor(() => screen.getByTestId('unfollow-friend-user2'));
    fireEvent.press(screen.getByTestId('unfollow-friend-user2'));
    expect(mockUnfollowUser).toHaveBeenCalledWith('user1', 'user2');
  });

  it('removes the friend optimistically after unfollow', async () => {
    mockGetFollowingProfiles.mockResolvedValue([
      { uid: 'user2', displayLabel: 'Bold Bear', animalKey: 'bear' },
    ]);
    render(<FriendsScreen />);
    await act(async () => {
      fireEvent.press(screen.getByTestId('tab-friends'));
    });
    await waitFor(() => screen.getByTestId('unfollow-friend-user2'));
    fireEvent.press(screen.getByTestId('unfollow-friend-user2'));
    await waitFor(() => {
      expect(screen.queryByText('Bold Bear')).toBeNull();
    });
  });

  it('does not re-fetch friends when switching back to Friends tab after load', async () => {
    mockGetFollowingProfiles.mockResolvedValue([
      { uid: 'user2', displayLabel: 'Bold Bear', animalKey: 'bear' },
    ]);
    render(<FriendsScreen />);
    await act(async () => {
      fireEvent.press(screen.getByTestId('tab-friends'));
    });
    await waitFor(() => expect(mockGetFollowingProfiles).toHaveBeenCalledTimes(1));

    fireEvent.press(screen.getByTestId('tab-timeline'));
    await act(async () => {
      fireEvent.press(screen.getByTestId('tab-friends'));
    });
    expect(mockGetFollowingProfiles).toHaveBeenCalledTimes(1);
  });
});
