import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import UserProfileScreen from './UserProfileScreen';
import { useRoute } from '@react-navigation/native';

jest.mock('@react-navigation/native', () => ({
  useRoute: jest.fn(),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ bottom: 0, top: 0, left: 0, right: 0 }),
}));

jest.mock('expo-blur', () => {
  const { View } = require('react-native');
  return { BlurView: View };
});

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: { uid: 'user1' }, loading: false }),
}));

jest.mock('@/lib/users/avatarIdentity', () => ({
  getAvatarIdentity: jest.fn(),
  ANIMAL_ASSETS: { fox: 1, bear: 2 },
}));

jest.mock('@/lib/books/readingActivity', () => ({
  subscribeToReadingActivities: jest.fn(() => jest.fn()),
}));

jest.mock('@/lib/users/follows', () => ({
  isFollowing: jest.fn(() => Promise.resolve(false)),
  followUser: jest.fn(() => Promise.resolve()),
  unfollowUser: jest.fn(() => Promise.resolve()),
}));

import { getAvatarIdentity } from '@/lib/users/avatarIdentity';
import { subscribeToReadingActivities } from '@/lib/books/readingActivity';
import { isFollowing, followUser, unfollowUser } from '@/lib/users/follows';

const mockGetAvatarIdentity = getAvatarIdentity as jest.Mock;
const mockSubscribe = subscribeToReadingActivities as jest.Mock;
const mockIsFollowing = isFollowing as jest.Mock;
const mockFollowUser = followUser as jest.Mock;
const mockUnfollowUser = unfollowUser as jest.Mock;

const mockIdentity = {
  animalKey: 'fox' as const,
  adjective: 'Quiet',
  displayLabel: 'Quiet Fox',
  finalizedAt: null,
};

const mockActivity = {
  id: 'act1',
  userId: 'user2',
  bookId: 'book1',
  title: 'Dune',
  authors: ['Frank Herbert'],
  thumbnail: null,
  status: 'finished' as const,
  finishedAt: null,
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useRoute).mockReturnValue({
    params: { uid: 'user2' },
    key: 'UserProfile',
    name: 'UserProfile',
  });
  mockGetAvatarIdentity.mockResolvedValue(mockIdentity);
  mockSubscribe.mockReturnValue(jest.fn());
  mockIsFollowing.mockResolvedValue(false);
});

describe('UserProfileScreen — identity', () => {
  it('renders the displayLabel when user exists', async () => {
    render(<UserProfileScreen />);
    expect(await screen.findByText('Quiet Fox')).toBeTruthy();
  });

  it('shows not-found state when identity is null', async () => {
    mockGetAvatarIdentity.mockResolvedValueOnce(null);
    render(<UserProfileScreen />);
    expect(await screen.findByText('userProfile.notFound')).toBeTruthy();
  });

  it('does not show notFound when user exists', async () => {
    render(<UserProfileScreen />);
    await screen.findByText('Quiet Fox');
    expect(screen.queryByText('userProfile.notFound')).toBeNull();
  });
});

describe('UserProfileScreen — book list', () => {
  it('subscribes to reading activities for the profile uid on mount', async () => {
    render(<UserProfileScreen />);
    await screen.findByText('Quiet Fox');
    expect(mockSubscribe).toHaveBeenCalledWith('user2', expect.any(Function), expect.any(Function));
  });

  it('renders book titles from finished activities', async () => {
    mockSubscribe.mockImplementation((_uid: string, onUpdate: Function) => {
      onUpdate([mockActivity]);
      return jest.fn();
    });
    render(<UserProfileScreen />);
    expect(await screen.findByText('Dune')).toBeTruthy();
  });

  it('renders book authors from finished activities', async () => {
    mockSubscribe.mockImplementation((_uid: string, onUpdate: Function) => {
      onUpdate([mockActivity]);
      return jest.fn();
    });
    render(<UserProfileScreen />);
    expect(await screen.findByText('Frank Herbert')).toBeTruthy();
  });

  it('shows empty state when no finished books', async () => {
    render(<UserProfileScreen />);
    await screen.findByText('Quiet Fox');
    expect(screen.getByText('userProfile.emptyBooks')).toBeTruthy();
  });

  it('hides empty state when books exist', async () => {
    mockSubscribe.mockImplementation((_uid: string, onUpdate: Function) => {
      onUpdate([mockActivity]);
      return jest.fn();
    });
    render(<UserProfileScreen />);
    await screen.findByText('Dune');
    expect(screen.queryByText('userProfile.emptyBooks')).toBeNull();
  });

  it('unsubscribes from reading activities on unmount', async () => {
    const mockUnsubscribe = jest.fn();
    mockSubscribe.mockReturnValue(mockUnsubscribe);
    const { unmount } = render(<UserProfileScreen />);
    await screen.findByText('Quiet Fox');
    unmount();
    expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
  });
});

describe('UserProfileScreen — follow actions', () => {
  it('shows follow button when not following', async () => {
    mockIsFollowing.mockResolvedValueOnce(false);
    render(<UserProfileScreen />);
    expect(await screen.findByTestId('follow-button')).toBeTruthy();
  });

  it('shows unfollow button when already following', async () => {
    mockIsFollowing.mockResolvedValueOnce(true);
    render(<UserProfileScreen />);
    expect(await screen.findByTestId('unfollow-button')).toBeTruthy();
  });

  it('hides follow button when viewing own profile', async () => {
    jest.mocked(useRoute).mockReturnValue({
      params: { uid: 'user1' },
      key: 'UserProfile',
      name: 'UserProfile',
    });
    render(<UserProfileScreen />);
    await screen.findByText('Quiet Fox');
    expect(screen.queryByTestId('follow-button')).toBeNull();
    expect(screen.queryByTestId('unfollow-button')).toBeNull();
  });

  it('calls followUser with correct UIDs when follow button is pressed', async () => {
    render(<UserProfileScreen />);
    fireEvent.press(await screen.findByTestId('follow-button'));
    expect(mockFollowUser).toHaveBeenCalledWith('user1', 'user2');
  });

  it('calls unfollowUser with correct UIDs when unfollow button is pressed', async () => {
    mockIsFollowing.mockResolvedValueOnce(true);
    render(<UserProfileScreen />);
    fireEvent.press(await screen.findByTestId('unfollow-button'));
    expect(mockUnfollowUser).toHaveBeenCalledWith('user1', 'user2');
  });

  it('optimistically switches to unfollow button after follow press', async () => {
    render(<UserProfileScreen />);
    fireEvent.press(await screen.findByTestId('follow-button'));
    await waitFor(() => {
      expect(screen.getByTestId('unfollow-button')).toBeTruthy();
    });
  });

  it('optimistically switches to follow button after unfollow press', async () => {
    mockIsFollowing.mockResolvedValueOnce(true);
    render(<UserProfileScreen />);
    fireEvent.press(await screen.findByTestId('unfollow-button'));
    await waitFor(() => {
      expect(screen.getByTestId('follow-button')).toBeTruthy();
    });
  });

  it('reverts to follow button if followUser rejects', async () => {
    mockFollowUser.mockRejectedValueOnce(new Error('network error'));
    render(<UserProfileScreen />);
    fireEvent.press(await screen.findByTestId('follow-button'));
    await waitFor(() => {
      expect(screen.getByTestId('follow-button')).toBeTruthy();
    });
  });

  it('reverts to unfollow button if unfollowUser rejects', async () => {
    mockIsFollowing.mockResolvedValueOnce(true);
    mockUnfollowUser.mockRejectedValueOnce(new Error('network error'));
    render(<UserProfileScreen />);
    fireEvent.press(await screen.findByTestId('unfollow-button'));
    await waitFor(() => {
      expect(screen.getByTestId('unfollow-button')).toBeTruthy();
    });
  });
});
