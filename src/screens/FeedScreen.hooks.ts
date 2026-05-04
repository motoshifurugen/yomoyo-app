import { useEffect, useState, useCallback } from 'react';
import type { QueryDocumentSnapshot } from 'firebase/firestore';
import { useAuth } from '@/hooks/useAuth';
import { followUser, unfollowUser, getFollowingUids } from '@/lib/users/follows';
import { getTimeline } from '@/lib/books/timeline';
import { getFriendsFeed } from '@/lib/books/friendsFeed';
import type { ReadingActivity } from '@/lib/books/readingActivity';

export type ActiveTab = 'timeline' | 'updates';

export function useFeedState() {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<ActiveTab>('timeline');

  const [timelineItems, setTimelineItems] = useState<ReadingActivity[]>([]);
  const [timelineLastDoc, setTimelineLastDoc] = useState<QueryDocumentSnapshot | null>(null);
  const [isLoadingTimeline, setIsLoadingTimeline] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [timelineError, setTimelineError] = useState(false);

  const [followingUids, setFollowingUids] = useState<Set<string>>(new Set());

  const [updatesItems, setUpdatesItems] = useState<ReadingActivity[]>([]);
  const [updatesLastDoc, setUpdatesLastDoc] = useState<QueryDocumentSnapshot | null>(null);
  const [isLoadingUpdates, setIsLoadingUpdates] = useState(false);
  const [updatesLoaded, setUpdatesLoaded] = useState(false);
  const [isLoadingUpdatesMore, setIsLoadingUpdatesMore] = useState(false);
  const [updatesError, setUpdatesError] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;
    setIsLoadingTimeline(true);
    setTimelineError(false);
    Promise.all([getTimeline(null), getFollowingUids(user.uid)])
      .then(([page, uids]) => {
        setTimelineItems(page.items);
        setTimelineLastDoc(page.lastDoc);
        setFollowingUids(new Set(uids));
      })
      .catch((err: unknown) => {
        const e = err as { code?: string; message?: string };
        console.error('[FeedScreen] timeline load failed — code:', e?.code, '— message:', e?.message, err);
        setTimelineError(true);
      })
      .finally(() => setIsLoadingTimeline(false));
  }, [user?.uid]);

  const loadUpdates = useCallback(() => {
    if (!user?.uid || updatesLoaded || isLoadingUpdates) return;
    setIsLoadingUpdates(true);
    setUpdatesError(false);
    getFollowingUids(user.uid)
      .then((uids) => {
        if (uids.length === 0) return Promise.resolve({ items: [] as ReadingActivity[], lastDoc: null });
        return getFriendsFeed(uids, null);
      })
      .then((page) => {
        setUpdatesItems(page.items);
        setUpdatesLastDoc(page.lastDoc);
        setUpdatesLoaded(true);
      })
      .catch((err: unknown) => {
        const e = err as { code?: string; message?: string };
        console.error('[FeedScreen] updates load failed — code:', e?.code, '— message:', e?.message, err);
        setUpdatesError(true);
      })
      .finally(() => setIsLoadingUpdates(false));
  }, [user?.uid, updatesLoaded, isLoadingUpdates]);

  const handleTabChange = useCallback(
    (tab: ActiveTab) => {
      setActiveTab(tab);
      if (tab === 'updates') loadUpdates();
    },
    [loadUpdates],
  );

  const handleLoadMoreTimeline = useCallback(() => {
    if (isLoadingMore || !timelineLastDoc) return;
    setIsLoadingMore(true);
    getTimeline(timelineLastDoc)
      .then((page) => {
        setTimelineItems((prev) => [...prev, ...page.items]);
        setTimelineLastDoc(page.lastDoc);
      })
      .catch(() => {})
      .finally(() => setIsLoadingMore(false));
  }, [isLoadingMore, timelineLastDoc]);

  const handleLoadMoreUpdates = useCallback(() => {
    if (isLoadingUpdatesMore || !updatesLastDoc) return;
    const uids = [...followingUids];
    if (uids.length === 0) return;
    setIsLoadingUpdatesMore(true);
    getFriendsFeed(uids, updatesLastDoc)
      .then((page) => {
        setUpdatesItems((prev) => [...prev, ...page.items]);
        setUpdatesLastDoc(page.lastDoc);
      })
      .catch(() => {})
      .finally(() => setIsLoadingUpdatesMore(false));
  }, [isLoadingUpdatesMore, updatesLastDoc, followingUids]);

  const handleFollow = useCallback(
    (targetUid: string) => {
      if (!user?.uid || user.uid === targetUid) return;
      setFollowingUids((prev) => new Set([...prev, targetUid]));
      setUpdatesLoaded(false);
      followUser(user.uid, targetUid).catch(() => {
        setFollowingUids((prev) => {
          const next = new Set(prev);
          next.delete(targetUid);
          return next;
        });
      });
    },
    [user?.uid],
  );

  const handleUnfollow = useCallback(
    (targetUid: string) => {
      if (!user?.uid) return;
      setFollowingUids((prev) => {
        const next = new Set(prev);
        next.delete(targetUid);
        return next;
      });
      setUpdatesLoaded(false);
      unfollowUser(user.uid, targetUid).catch(() => {
        setFollowingUids((prev) => new Set([...prev, targetUid]));
        setUpdatesLoaded(false);
      });
    },
    [user?.uid],
  );

  return {
    activeTab,
    handleTabChange,
    timelineItems,
    isLoadingTimeline,
    isLoadingMore,
    timelineError,
    handleLoadMoreTimeline,
    followingUids,
    handleFollow,
    handleUnfollow,
    updatesItems,
    isLoadingUpdates,
    updatesError,
    isLoadingUpdatesMore,
    handleLoadMoreUpdates,
    currentUid: user?.uid ?? '',
  };
}
