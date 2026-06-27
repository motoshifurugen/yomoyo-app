import { useEffect, useRef, useState, useCallback } from 'react';
import type { QueryDocumentSnapshot } from 'firebase/firestore';
import { useAuth } from '@/hooks/useAuth';
import { getFollowingUids } from '@/lib/users/follows';
import { getFriendsFeed } from '@/lib/books/friendsFeed';
import {
  addBookmark,
  removeBookmark,
  getBookmarkIds,
  getBookmarkedActivities,
} from '@/lib/books/bookmarks';
import { useBookmarkFilter } from '@/lib/books/bookmarkFilterContext';
import type { ReadingActivity } from '@/lib/books/readingActivity';
import { getAvatarIdentity } from '@/lib/users/avatarIdentity';
import { enrichActivityAvatars, type AvatarCache } from '@/lib/books/enrichActivityAvatars';

export type FeedState = {
  items: ReadingActivity[];
  isLoading: boolean;
  isRefreshing: boolean;
  isLoadingMore: boolean;
  hasError: boolean;
  bookmarkedIds: Set<string>;
  handleLoadMore: () => void;
  handleRefresh: () => void;
  toggleBookmark: (activityId: string) => Promise<void>;
};

type LoadResult = {
  uids: string[];
  ids: Set<string>;
  items: ReadingActivity[];
  lastDoc: QueryDocumentSnapshot | null;
};

async function loadAllFeed(uid: string): Promise<LoadResult> {
  const [uids, ids] = await Promise.all([getFollowingUids(uid), getBookmarkIds(uid)]);
  if (uids.length === 0) {
    return { uids, ids, items: [], lastDoc: null };
  }
  const page = await getFriendsFeed(uids, null);
  return { uids, ids, items: page.items, lastDoc: page.lastDoc };
}

async function loadBookmarkedFeed(uid: string): Promise<LoadResult> {
  const [ids, page] = await Promise.all([
    getBookmarkIds(uid),
    getBookmarkedActivities(uid, null),
  ]);
  return { uids: [], ids, items: page.items, lastDoc: page.lastDoc };
}

function logError(prefix: string, err: unknown) {
  const e = err as { code?: string; message?: string };
  console.error(prefix, '— code:', e?.code, '— message:', e?.message, err);
}

export function useFeedState(): FeedState {
  const { user } = useAuth();
  const { mode } = useBookmarkFilter();

  const [items, setItems] = useState<ReadingActivity[]>([]);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot | null>(null);
  const [followingUids, setFollowingUids] = useState<string[]>([]);
  // Start in the loading state so the first paint shows the skeleton rather
  // than briefly flashing the empty state before the load effect runs.
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const avatarCacheRef = useRef<AvatarCache>(new Map());
  const mountedRef = useRef(true);

  useEffect(() => () => { mountedRef.current = false; }, []);

  const fetchFeed = useCallback(async (uid: string) => {
    const loader = mode === 'bookmarks' ? loadBookmarkedFeed : loadAllFeed;
    const result = await loader(uid);
    const enriched = await enrichActivityAvatars(
      result.items,
      avatarCacheRef.current,
      getAvatarIdentity,
    );
    return { ...result, items: enriched };
  }, [mode]);

  useEffect(() => {
    const uid = user?.uid;
    if (!uid) {
      setIsLoading(false);
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    setHasError(false);
    setItems([]);
    setLastDoc(null);

    fetchFeed(uid)
      .then((result) => {
        if (cancelled || !mountedRef.current) return;
        setFollowingUids(result.uids);
        setBookmarkedIds(result.ids);
        setItems(result.items);
        setLastDoc(result.lastDoc);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        logError('[FeedScreen] feed load failed', err);
        if (!mountedRef.current) return;
        setHasError(true);
      })
      .finally(() => {
        if (cancelled || !mountedRef.current) return;
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user?.uid, mode, fetchFeed]);

  const handleRefresh = useCallback(() => {
    const uid = user?.uid;
    if (!uid || isRefreshing || isLoading) return;
    const hadItems = items.length > 0;
    setIsRefreshing(true);
    setHasError(false);

    fetchFeed(uid)
      .then((result) => {
        if (!mountedRef.current) return;
        setFollowingUids(result.uids);
        setBookmarkedIds(result.ids);
        setItems(result.items);
        setLastDoc(result.lastDoc);
      })
      .catch((err: unknown) => {
        logError('[FeedScreen] feed refresh failed', err);
        if (!mountedRef.current) return;
        if (!hadItems) setHasError(true);
      })
      .finally(() => {
        if (!mountedRef.current) return;
        setIsRefreshing(false);
      });
  }, [user?.uid, isRefreshing, isLoading, items.length, fetchFeed]);

  const handleLoadMore = useCallback(() => {
    if (isLoadingMore || isRefreshing || !lastDoc) return;
    const uid = user?.uid;
    if (!uid) return;
    setIsLoadingMore(true);
    const fetchNext = mode === 'bookmarks'
      ? getBookmarkedActivities(uid, lastDoc)
      : followingUids.length === 0
        ? Promise.resolve({ items: [], lastDoc: null })
        : getFriendsFeed(followingUids, lastDoc);

    fetchNext
      .then(async (page) => {
        if (!mountedRef.current) return;
        const enriched = await enrichActivityAvatars(
          page.items,
          avatarCacheRef.current,
          getAvatarIdentity,
        );
        if (!mountedRef.current) return;
        setItems((prev) => [...prev, ...enriched]);
        setLastDoc(page.lastDoc);
      })
      .catch(() => {})
      .finally(() => {
        if (!mountedRef.current) return;
        setIsLoadingMore(false);
      });
  }, [isLoadingMore, isRefreshing, lastDoc, followingUids, mode, user?.uid]);

  const toggleBookmark = useCallback(async (activityId: string) => {
    const uid = user?.uid;
    if (!uid) return;
    const wasBookmarked = bookmarkedIds.has(activityId);

    // Capture the row to be removed from the current closure so rollback works
    // even though React 18 may not run setState reducers before catch.
    const removedAt = wasBookmarked && mode === 'bookmarks'
      ? items.findIndex((i) => i.id === activityId)
      : -1;
    const removedItem = removedAt >= 0 ? items[removedAt] : undefined;

    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (wasBookmarked) next.delete(activityId);
      else next.add(activityId);
      return next;
    });

    if (removedItem) {
      setItems((prev) => prev.filter((i) => i.id !== activityId));
    }

    try {
      if (wasBookmarked) await removeBookmark(uid, activityId);
      else await addBookmark(uid, activityId);
    } catch (err) {
      console.error('[FeedScreen] bookmark toggle failed', err);
      if (!mountedRef.current) return;
      setBookmarkedIds((prev) => {
        const next = new Set(prev);
        if (wasBookmarked) next.add(activityId);
        else next.delete(activityId);
        return next;
      });
      if (removedItem) {
        setItems((prev) => {
          const clampedAt = Math.min(removedAt, prev.length);
          return [...prev.slice(0, clampedAt), removedItem, ...prev.slice(clampedAt)];
        });
      }
    }
  }, [bookmarkedIds, items, mode, user?.uid]);

  return {
    items,
    isLoading,
    isRefreshing,
    isLoadingMore,
    hasError,
    bookmarkedIds,
    handleLoadMore,
    handleRefresh,
    toggleBookmark,
  };
}
