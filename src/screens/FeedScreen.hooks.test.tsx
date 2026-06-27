import React from 'react';
import { Text, Pressable, View } from 'react-native';
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react-native';
import {
  BookmarkFilterProvider,
  useBookmarkFilter,
} from '@/lib/books/bookmarkFilterContext';
import { useFeedState } from './FeedScreen.hooks';

jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: { uid: 'user1' }, loading: false }),
}));

jest.mock('@/lib/users/follows', () => ({
  getFollowingUids: jest.fn(() => Promise.resolve(['user2'])),
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
  ANIMAL_ASSETS: { fox: 1, bear: 2 },
  getAvatarIdentity: jest.fn(() => Promise.resolve(null)),
}));

import { getFollowingUids } from '@/lib/users/follows';
import { getFriendsFeed } from '@/lib/books/friendsFeed';
import {
  getBookmarkIds,
  getBookmarkedActivities,
  addBookmark,
  removeBookmark,
} from '@/lib/books/bookmarks';

const mockGetFriendsFeed = getFriendsFeed as jest.Mock;
const mockGetBookmarkIds = getBookmarkIds as jest.Mock;
const mockGetBookmarkedActivities = getBookmarkedActivities as jest.Mock;
const mockAddBookmark = addBookmark as jest.Mock;
const mockRemoveBookmark = removeBookmark as jest.Mock;

const activity = (id: string, overrides: object = {}) => ({
  id,
  userId: 'user2',
  bookId: `book-${id}`,
  title: `Title ${id}`,
  authors: [],
  thumbnail: null,
  status: 'finished' as const,
  finishedAt: null,
  displayName: 'Bold Bear',
  displayAvatar: 'bear',
  ...overrides,
});

function Probe() {
  const state = useFeedState();
  const filter = useBookmarkFilter();
  return (
    <View>
      <Text testID="items">{state.items.map((i) => i.id).join(',')}</Text>
      <Text testID="ids">{Array.from(state.bookmarkedIds).join(',')}</Text>
      <Text testID="loading">{String(state.isLoading)}</Text>
      <Text testID="refreshing">{String(state.isRefreshing)}</Text>
      <Text testID="error">{String(state.hasError)}</Text>
      <Pressable testID="switch-bookmarks" onPress={() => filter.setMode('bookmarks')}>
        <Text>switch</Text>
      </Pressable>
      <Pressable testID="switch-all" onPress={() => filter.setMode('all')}>
        <Text>switch-all</Text>
      </Pressable>
      <Pressable testID="toggle-act1" onPress={() => state.toggleBookmark('act1')}>
        <Text>toggle</Text>
      </Pressable>
      <Pressable testID="refresh" onPress={() => state.handleRefresh()}>
        <Text>refresh</Text>
      </Pressable>
    </View>
  );
}

function renderProbe() {
  return render(
    <BookmarkFilterProvider>
      <Probe />
    </BookmarkFilterProvider>,
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  (getFollowingUids as jest.Mock).mockResolvedValue(['user2']);
  mockGetFriendsFeed.mockResolvedValue({ items: [], lastDoc: null });
  mockGetBookmarkIds.mockResolvedValue(new Set());
  mockGetBookmarkedActivities.mockResolvedValue({ items: [], lastDoc: null });
});

describe('useFeedState — all mode (default)', () => {
  it('loads the friends feed and bookmark ID set on mount', async () => {
    mockGetBookmarkIds.mockResolvedValue(new Set(['act1', 'act2']));
    renderProbe();
    await waitFor(() => {
      expect(mockGetFriendsFeed).toHaveBeenCalled();
      expect(mockGetBookmarkIds).toHaveBeenCalledWith('user1');
    });
    await waitFor(() => {
      expect(screen.getByTestId('ids').props.children).toContain('act1');
    });
  });

  it('does not call the bookmark-only fetcher in all mode', async () => {
    renderProbe();
    await waitFor(() => expect(mockGetFriendsFeed).toHaveBeenCalled());
    expect(mockGetBookmarkedActivities).not.toHaveBeenCalled();
  });

  it('reloads the feed when handleRefresh is called', async () => {
    mockGetFriendsFeed
      .mockResolvedValueOnce({ items: [activity('a1')], lastDoc: null })
      .mockResolvedValueOnce({ items: [activity('a1'), activity('a2')], lastDoc: null });
    renderProbe();
    await waitFor(() =>
      expect(screen.getByTestId('items').props.children).toBe('a1'),
    );

    await act(async () => {
      fireEvent.press(screen.getByTestId('refresh'));
    });
    await waitFor(() => {
      expect(mockGetFriendsFeed).toHaveBeenCalledTimes(2);
      expect(screen.getByTestId('items').props.children).toBe('a1,a2');
      expect(screen.getByTestId('refreshing').props.children).toBe('false');
    });
  });
});

describe('useFeedState — bookmark mode switch', () => {
  it('fetches bookmarked activities when mode flips to bookmarks', async () => {
    mockGetBookmarkedActivities.mockResolvedValue({
      items: [activity('bm1'), activity('bm2')],
      lastDoc: null,
    });
    renderProbe();
    await waitFor(() => expect(mockGetFriendsFeed).toHaveBeenCalled());

    await act(async () => {
      fireEvent.press(screen.getByTestId('switch-bookmarks'));
    });

    await waitFor(() => {
      expect(mockGetBookmarkedActivities).toHaveBeenCalledWith('user1', null);
      expect(screen.getByTestId('items').props.children).toBe('bm1,bm2');
    });
  });

  it('resets items when switching back to all mode', async () => {
    mockGetFriendsFeed.mockResolvedValue({
      items: [activity('a1')],
      lastDoc: null,
    });
    mockGetBookmarkedActivities.mockResolvedValue({
      items: [activity('bm1')],
      lastDoc: null,
    });
    renderProbe();
    await waitFor(() =>
      expect(screen.getByTestId('items').props.children).toBe('a1'),
    );

    await act(async () => {
      fireEvent.press(screen.getByTestId('switch-bookmarks'));
    });
    await waitFor(() =>
      expect(screen.getByTestId('items').props.children).toBe('bm1'),
    );

    await act(async () => {
      fireEvent.press(screen.getByTestId('switch-all'));
    });
    await waitFor(() =>
      expect(screen.getByTestId('items').props.children).toBe('a1'),
    );
  });
});

describe('useFeedState — toggleBookmark', () => {
  it('adds the bookmark when activity id is not in the set', async () => {
    mockGetBookmarkIds.mockResolvedValue(new Set());
    renderProbe();
    await waitFor(() => expect(mockGetBookmarkIds).toHaveBeenCalled());

    await act(async () => {
      fireEvent.press(screen.getByTestId('toggle-act1'));
    });

    expect(mockAddBookmark).toHaveBeenCalledWith('user1', 'act1');
    expect(mockRemoveBookmark).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.getByTestId('ids').props.children).toContain('act1');
    });
  });

  it('removes the bookmark when activity id is in the set', async () => {
    mockGetBookmarkIds.mockResolvedValue(new Set(['act1']));
    renderProbe();
    await waitFor(() => {
      expect(screen.getByTestId('ids').props.children).toContain('act1');
    });

    await act(async () => {
      fireEvent.press(screen.getByTestId('toggle-act1'));
    });

    expect(mockRemoveBookmark).toHaveBeenCalledWith('user1', 'act1');
    expect(mockAddBookmark).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.getByTestId('ids').props.children).not.toContain('act1');
    });
  });

  it('removes the row from items immediately when in bookmarks mode', async () => {
    mockGetBookmarkIds.mockResolvedValue(new Set(['act1']));
    mockGetBookmarkedActivities.mockResolvedValue({
      items: [activity('act1'), activity('act2')],
      lastDoc: null,
    });
    renderProbe();

    await act(async () => {
      fireEvent.press(screen.getByTestId('switch-bookmarks'));
    });
    await waitFor(() =>
      expect(screen.getByTestId('items').props.children).toBe('act1,act2'),
    );

    await act(async () => {
      fireEvent.press(screen.getByTestId('toggle-act1'));
    });

    await waitFor(() =>
      expect(screen.getByTestId('items').props.children).toBe('act2'),
    );
    expect(mockRemoveBookmark).toHaveBeenCalledWith('user1', 'act1');
  });

  it('restores the row AND the bookmark id when removeBookmark fails in bookmarks mode', async () => {
    mockGetBookmarkIds.mockResolvedValue(new Set(['act1']));
    mockGetBookmarkedActivities.mockResolvedValue({
      items: [activity('act1'), activity('act2')],
      lastDoc: null,
    });
    mockRemoveBookmark.mockRejectedValueOnce(new Error('network'));

    renderProbe();
    await act(async () => {
      fireEvent.press(screen.getByTestId('switch-bookmarks'));
    });
    await waitFor(() =>
      expect(screen.getByTestId('items').props.children).toBe('act1,act2'),
    );

    const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    await act(async () => {
      fireEvent.press(screen.getByTestId('toggle-act1'));
    });

    // Both the items list and the bookmark id set must roll back.
    await waitFor(() => {
      expect(screen.getByTestId('items').props.children).toBe('act1,act2');
      expect(screen.getByTestId('ids').props.children).toContain('act1');
    });
    errSpy.mockRestore();
  });
});

describe('useFeedState — mode-switch race protection', () => {
  function deferred<T>(): { promise: Promise<T>; resolve: (v: T) => void } {
    let resolve!: (v: T) => void;
    const promise = new Promise<T>((r) => {
      resolve = r;
    });
    return { promise, resolve };
  }

  it('ignores a stale all-mode feed result that arrives after switching to bookmarks', async () => {
    const slowAllFeed = deferred<{ items: ReturnType<typeof activity>[]; lastDoc: null }>();
    mockGetFriendsFeed.mockReturnValueOnce(slowAllFeed.promise);

    mockGetBookmarkedActivities.mockResolvedValue({
      items: [activity('bm1')],
      lastDoc: null,
    });

    renderProbe();

    // While the slow all-mode fetch is still pending, switch to bookmarks.
    await act(async () => {
      fireEvent.press(screen.getByTestId('switch-bookmarks'));
    });
    await waitFor(() =>
      expect(screen.getByTestId('items').props.children).toBe('bm1'),
    );

    // Late-arriving stale result from the previous mode must NOT overwrite items.
    await act(async () => {
      slowAllFeed.resolve({ items: [activity('a-stale')], lastDoc: null });
    });

    expect(screen.getByTestId('items').props.children).toBe('bm1');
  });
});
