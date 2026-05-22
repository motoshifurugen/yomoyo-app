import React from 'react';
import { screen, fireEvent, waitFor, act } from '@testing-library/react-native';
import { ThemeProvider } from '@/lib/theme/ThemeProvider';
import { render as rtlRender } from '@testing-library/react-native';
import {
  BookmarkFilterProvider,
  type BookmarkFilterMode,
} from '@/lib/books/bookmarkFilterContext';
import FeedScreen from './FeedScreen';

function render(
  ui: React.ReactElement,
  options?: { initialMode?: BookmarkFilterMode },
) {
  return rtlRender(
    <ThemeProvider>
      <BookmarkFilterProvider initialMode={options?.initialMode ?? 'all'}>
        {ui}
      </BookmarkFilterProvider>
    </ThemeProvider>,
  );
}

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

jest.mock('@/lib/books/bookmarks', () => ({
  getBookmarkIds: jest.fn(() => Promise.resolve(new Set())),
  getBookmarkedActivities: jest.fn(() =>
    Promise.resolve({ items: [], lastDoc: null }),
  ),
  addBookmark: jest.fn(() => Promise.resolve()),
  removeBookmark: jest.fn(() => Promise.resolve()),
}));

jest.mock('@/lib/users/avatarIdentity', () => ({
  ANIMAL_ASSETS: { fox: 1, bear: 2, seal: 3 },
  getAvatarIdentity: jest.fn(() => Promise.resolve(null)),
}));

jest.mock('@/components/ads/TimelineBannerAd', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: () => React.createElement(View, { testID: 'timeline-banner-ad' }),
  };
});

import { getFollowingUids } from '@/lib/users/follows';
import { getFriendsFeed } from '@/lib/books/friendsFeed';
import { getAvatarIdentity } from '@/lib/users/avatarIdentity';
import {
  getBookmarkIds,
  getBookmarkedActivities,
  addBookmark,
  removeBookmark,
} from '@/lib/books/bookmarks';

const mockGetFollowingUids = getFollowingUids as jest.Mock;
const mockGetFriendsFeed = getFriendsFeed as jest.Mock;
const mockGetAvatarIdentity = getAvatarIdentity as jest.Mock;
const mockGetBookmarkIds = getBookmarkIds as jest.Mock;
const mockGetBookmarkedActivities = getBookmarkedActivities as jest.Mock;
const mockAddBookmark = addBookmark as jest.Mock;
const mockRemoveBookmark = removeBookmark as jest.Mock;

const mockActivity = {
  id: 'act1',
  userId: 'user2',
  bookId: 'book1',
  title: 'Dune',
  authors: ['Frank Herbert'],
  thumbnail: null,
  status: 'finished' as const,
  finishedAt: null,
  displayName: 'Bold Bear',
  displayAvatar: 'bear',
};

const secondActivity = {
  ...mockActivity,
  id: 'act2',
  userId: 'user3',
  title: 'Kindred',
  displayName: 'Quiet Fox',
  displayAvatar: 'fox',
};

const legacyOnlyActivity = {
  id: 'act-legacy',
  userId: 'user4',
  bookId: 'book2',
  title: 'Legacy Book',
  authors: ['Old Author'],
  thumbnail: null,
  status: 'finished' as const,
  finishedAt: null,
  displayLabel: 'Quiet Fox',
  displayAvatar: 'fox',
};

beforeEach(() => {
  jest.clearAllMocks();
  mockGetFollowingUids.mockResolvedValue(['user2']);
  mockGetFriendsFeed.mockResolvedValue({ items: [], lastDoc: null });
  mockGetBookmarkIds.mockResolvedValue(new Set());
  mockGetBookmarkedActivities.mockResolvedValue({ items: [], lastDoc: null });
  mockAddBookmark.mockResolvedValue(undefined);
  mockRemoveBookmark.mockResolvedValue(undefined);
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

  it('falls back to legacy displayLabel when only that field is present', async () => {
    mockGetFriendsFeed.mockResolvedValue({ items: [legacyOnlyActivity], lastDoc: null });
    render(<FeedScreen />);
    await waitFor(() => {
      expect(screen.getByText('Quiet Fox')).toBeTruthy();
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

describe('FeedScreen — ad placement policy', () => {
  const buildItems = (n: number) =>
    Array.from({ length: n }, (_, i) => ({
      ...mockActivity,
      id: `act-${i}`,
      title: `Book ${i}`,
    }));

  it('does not render an ad in the empty state', async () => {
    mockGetFollowingUids.mockResolvedValue([]);
    render(<FeedScreen />);
    await waitFor(() => screen.getByText('timeline.emptyBody'));
    expect(screen.queryByTestId('timeline-banner-ad')).toBeNull();
  });

  it('does not render an ad in the error state', async () => {
    mockGetFriendsFeed.mockRejectedValueOnce(new Error('boom'));
    render(<FeedScreen />);
    await waitFor(() => screen.getByText('timeline.loadErrorBody'));
    expect(screen.queryByTestId('timeline-banner-ad')).toBeNull();
  });

  it('does not render an ad while the feed is loading', () => {
    mockGetFriendsFeed.mockReturnValue(new Promise(() => {}));
    render(<FeedScreen />);
    expect(screen.queryByTestId('timeline-banner-ad')).toBeNull();
  });

  it('does not render any ad when only a few items are present (< cadence)', async () => {
    mockGetFriendsFeed.mockResolvedValue({ items: buildItems(5), lastDoc: null });
    render(<FeedScreen />);
    await waitFor(() => screen.getByText('Book 0'));
    expect(screen.queryByTestId('timeline-banner-ad')).toBeNull();
  });

  it('renders one ad after the 6th item once the cadence is reached with more items following', async () => {
    mockGetFriendsFeed.mockResolvedValue({ items: buildItems(13), lastDoc: null });
    render(<FeedScreen />);
    await waitFor(() => screen.getByText('Book 0'));
    const ads = await screen.findAllByTestId('timeline-banner-ad');
    expect(ads.length).toBeGreaterThanOrEqual(1);
  });
});

describe('FeedScreen — card content', () => {
  const withThumbnailAndDate = {
    ...mockActivity,
    thumbnail: 'https://example.com/cover.jpg',
    finishedAt: {
      toMillis: () => 1747612800000,
      toDate: () => new Date('2026-05-19T00:00:00Z'),
    },
  };

  const withoutAvatar = {
    ...mockActivity,
    id: 'act-no-avatar',
    displayAvatar: null,
  };

  it('does not render the "finished reading" label on cards', async () => {
    mockGetFriendsFeed.mockResolvedValue({ items: [mockActivity], lastDoc: null });
    render(<FeedScreen />);
    await waitFor(() => screen.getByText('Dune'));
    expect(screen.queryByText('timeline.finishedReading')).toBeNull();
  });

  it('renders the book thumbnail when activity.thumbnail is present', async () => {
    mockGetFriendsFeed.mockResolvedValue({ items: [withThumbnailAndDate], lastDoc: null });
    render(<FeedScreen />);
    await waitFor(() => screen.getByText('Dune'));
    const thumb = screen.getByTestId('activity-thumbnail-act1');
    expect(thumb.props.source.uri).toBe('https://example.com/cover.jpg');
  });

  it('renders a thumbnail placeholder when activity.thumbnail is null', async () => {
    mockGetFriendsFeed.mockResolvedValue({ items: [mockActivity], lastDoc: null });
    render(<FeedScreen />);
    await waitFor(() => screen.getByText('Dune'));
    expect(screen.getByTestId('activity-thumbnail-placeholder-act1')).toBeTruthy();
  });

  it('renders an avatar placeholder when displayAvatar is missing', async () => {
    mockGetFriendsFeed.mockResolvedValue({ items: [withoutAvatar], lastDoc: null });
    render(<FeedScreen />);
    await waitFor(() => screen.getByText('Dune'));
    expect(screen.getByTestId('activity-avatar-placeholder-act-no-avatar')).toBeTruthy();
  });

  it('renders the localized date when finishedAt is present', async () => {
    mockGetFriendsFeed.mockResolvedValue({ items: [withThumbnailAndDate], lastDoc: null });
    render(<FeedScreen />);
    await waitFor(() => screen.getByText('Dune'));
    const expected = new Date('2026-05-19T00:00:00Z').toLocaleDateString();
    expect(screen.getByTestId('activity-date-act1').props.children).toBe(expected);
  });

  it('omits the date when finishedAt is null', async () => {
    mockGetFriendsFeed.mockResolvedValue({ items: [mockActivity], lastDoc: null });
    render(<FeedScreen />);
    await waitFor(() => screen.getByText('Dune'));
    expect(screen.queryByTestId('activity-date-act1')).toBeNull();
  });

  it('renders an avatar when displayAvatar is missing on the doc but resolvable via avatar identity', async () => {
    const itemMissingAvatar = {
      ...mockActivity,
      id: 'act-legacy-1',
      userId: 'legacy-user',
      displayAvatar: null,
    };
    mockGetAvatarIdentity.mockResolvedValueOnce({
      animalKey: 'fox',
      displayName: 'Legacy Fox',
      finalizedAt: null,
    });
    mockGetFriendsFeed.mockResolvedValue({ items: [itemMissingAvatar], lastDoc: null });
    render(<FeedScreen />);
    await waitFor(() => screen.getByText('Dune'));
    expect(screen.queryByTestId('activity-avatar-placeholder-act-legacy-1')).toBeNull();
  });

  it('keeps the avatar placeholder when displayAvatar is missing and avatar identity lookup fails', async () => {
    const itemMissingAvatar = {
      ...mockActivity,
      id: 'act-no-identity',
      userId: 'ghost-user',
      displayAvatar: null,
    };
    mockGetAvatarIdentity.mockRejectedValueOnce(new Error('not found'));
    mockGetFriendsFeed.mockResolvedValue({ items: [itemMissingAvatar], lastDoc: null });
    render(<FeedScreen />);
    await waitFor(() => screen.getByText('Dune'));
    expect(screen.getByTestId('activity-avatar-placeholder-act-no-identity')).toBeTruthy();
  });

  it('places the date inside the title block (sibling of the title), matching the shelf card layout', async () => {
    const { within } = require('@testing-library/react-native');
    mockGetFriendsFeed.mockResolvedValue({ items: [withThumbnailAndDate], lastDoc: null });
    render(<FeedScreen />);
    await waitFor(() => screen.getByText('Dune'));
    const titleBlock = screen.getByTestId('activity-info-act1');
    expect(within(titleBlock).getByTestId('activity-date-act1')).toBeTruthy();
    expect(within(titleBlock).getByText('Dune')).toBeTruthy();
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

describe('FeedScreen — bookmark icon on cards', () => {
  beforeEach(() => {
    mockGetFriendsFeed.mockResolvedValue({ items: [mockActivity], lastDoc: null });
  });

  it('renders a bookmark toggle button on each activity card', async () => {
    render(<FeedScreen />);
    await waitFor(() => screen.getByText('Dune'));
    expect(screen.getByTestId('bookmark-toggle-act1')).toBeTruthy();
  });

  it('shows the off (outline) state when the activity is not in the bookmark set', async () => {
    mockGetBookmarkIds.mockResolvedValue(new Set());
    render(<FeedScreen />);
    await waitFor(() => screen.getByText('Dune'));
    expect(
      screen.getByTestId('bookmark-toggle-act1').props.accessibilityState?.selected,
    ).toBe(false);
  });

  it('shows the on (filled) state when the activity is already bookmarked', async () => {
    mockGetBookmarkIds.mockResolvedValue(new Set(['act1']));
    render(<FeedScreen />);
    await waitFor(() => {
      expect(
        screen.getByTestId('bookmark-toggle-act1').props.accessibilityState?.selected,
      ).toBe(true);
    });
  });

  it('calls addBookmark when an unbookmarked icon is pressed', async () => {
    mockGetBookmarkIds.mockResolvedValue(new Set());
    render(<FeedScreen />);
    await waitFor(() => screen.getByTestId('bookmark-toggle-act1'));
    await act(async () => {
      fireEvent.press(screen.getByTestId('bookmark-toggle-act1'));
    });
    expect(mockAddBookmark).toHaveBeenCalledWith('user1', 'act1');
  });

  it('does NOT open the detail modal when the bookmark icon is pressed (tap isolation)', async () => {
    render(<FeedScreen />);
    await waitFor(() => screen.getByTestId('bookmark-toggle-act1'));
    await act(async () => {
      fireEvent.press(screen.getByTestId('bookmark-toggle-act1'));
    });
    expect(screen.queryByTestId('activity-detail-modal')).toBeNull();
  });
});

describe('FeedScreen — bookmark-only mode empty state', () => {
  it('shows the bookmark-specific empty copy when in bookmarks mode with no items', async () => {
    mockGetBookmarkedActivities.mockResolvedValue({ items: [], lastDoc: null });
    render(<FeedScreen />, { initialMode: 'bookmarks' });
    await waitFor(() => {
      expect(screen.getByText('timeline.emptyBookmarks')).toBeTruthy();
    });
    expect(screen.queryByText('timeline.emptyBody')).toBeNull();
    expect(screen.queryByTestId('add-friend-button-inline')).toBeNull();
  });

  it('renders bookmarked activities when bookmarks-mode returns items', async () => {
    mockGetBookmarkedActivities.mockResolvedValue({
      items: [{ ...mockActivity, id: 'bm1', title: 'Saved Book' }],
      lastDoc: null,
    });
    render(<FeedScreen />, { initialMode: 'bookmarks' });
    await waitFor(() => {
      expect(screen.getByText('Saved Book')).toBeTruthy();
    });
  });
});
