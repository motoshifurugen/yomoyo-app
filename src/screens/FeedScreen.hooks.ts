import { useEffect, useRef, useState, useCallback } from 'react';
import type { QueryDocumentSnapshot } from 'firebase/firestore';
import { useAuth } from '@/hooks/useAuth';
import { getFollowingUids } from '@/lib/users/follows';
import { getFriendsFeed } from '@/lib/books/friendsFeed';
import type { ReadingActivity } from '@/lib/books/readingActivity';
import { getAvatarIdentity } from '@/lib/users/avatarIdentity';
import { enrichActivityAvatars, type AvatarCache } from '@/lib/books/enrichActivityAvatars';

export function useFeedState() {
  const { user } = useAuth();

  const [items, setItems] = useState<ReadingActivity[]>([]);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot | null>(null);
  const [followingUids, setFollowingUids] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasError, setHasError] = useState(false);
  const avatarCacheRef = useRef<AvatarCache>(new Map());
  const mountedRef = useRef(true);

  useEffect(() => () => { mountedRef.current = false; }, []);

  useEffect(() => {
    if (!user?.uid) return;
    setIsLoading(true);
    setHasError(false);
    getFollowingUids(user.uid)
      .then((uids) => {
        if (!mountedRef.current) return null;
        setFollowingUids(uids);
        if (uids.length === 0) {
          return { items: [] as ReadingActivity[], lastDoc: null };
        }
        return getFriendsFeed(uids, null);
      })
      .then(async (page) => {
        if (!page || !mountedRef.current) return;
        const enriched = await enrichActivityAvatars(
          page.items,
          avatarCacheRef.current,
          getAvatarIdentity,
        );
        if (!mountedRef.current) return;
        setItems(enriched);
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
        if (!mountedRef.current) return;
        setHasError(true);
      })
      .finally(() => {
        if (!mountedRef.current) return;
        setIsLoading(false);
      });
  }, [user?.uid]);

  const handleLoadMore = useCallback(() => {
    if (isLoadingMore || !lastDoc || followingUids.length === 0) return;
    setIsLoadingMore(true);
    getFriendsFeed(followingUids, lastDoc)
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
  }, [isLoadingMore, lastDoc, followingUids]);

  return {
    items,
    isLoading,
    isLoadingMore,
    hasError,
    handleLoadMore,
  };
}
