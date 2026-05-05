import { useEffect, useState, useCallback } from 'react';
import type { QueryDocumentSnapshot } from 'firebase/firestore';
import { useAuth } from '@/hooks/useAuth';
import { getFollowingUids } from '@/lib/users/follows';
import { getFriendsFeed } from '@/lib/books/friendsFeed';
import type { ReadingActivity } from '@/lib/books/readingActivity';

export function useFeedState() {
  const { user } = useAuth();

  const [items, setItems] = useState<ReadingActivity[]>([]);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot | null>(null);
  const [followingUids, setFollowingUids] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;
    setIsLoading(true);
    setHasError(false);
    getFollowingUids(user.uid)
      .then((uids) => {
        setFollowingUids(uids);
        if (uids.length === 0) {
          return { items: [] as ReadingActivity[], lastDoc: null };
        }
        return getFriendsFeed(uids, null);
      })
      .then((page) => {
        setItems(page.items);
        setLastDoc(page.lastDoc);
      })
      .catch((err: unknown) => {
        const e = err as { code?: string; message?: string };
        console.error(
          '[FeedScreen] feed load failed — code:',
          e?.code,
          '— message:',
          e?.message,
          err,
        );
        setHasError(true);
      })
      .finally(() => setIsLoading(false));
  }, [user?.uid]);

  const handleLoadMore = useCallback(() => {
    if (isLoadingMore || !lastDoc || followingUids.length === 0) return;
    setIsLoadingMore(true);
    getFriendsFeed(followingUids, lastDoc)
      .then((page) => {
        setItems((prev) => [...prev, ...page.items]);
        setLastDoc(page.lastDoc);
      })
      .catch(() => {})
      .finally(() => setIsLoadingMore(false));
  }, [isLoadingMore, lastDoc, followingUids]);

  return {
    items,
    isLoading,
    isLoadingMore,
    hasError,
    handleLoadMore,
  };
}
