import {
  getFirestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
} from 'firebase/firestore';
import type { QueryDocumentSnapshot } from 'firebase/firestore';
import type { ReadingActivity } from './readingActivity';

const DEFAULT_PAGE_SIZE = 20;

export type BookmarkPage = {
  items: ReadingActivity[];
  lastDoc: QueryDocumentSnapshot | null;
};

function bookmarkDoc(uid: string, activityId: string) {
  const db = getFirestore();
  return doc(db, 'users', uid, 'bookmarks', activityId);
}

function bookmarkCollection(uid: string) {
  const db = getFirestore();
  return collection(db, 'users', uid, 'bookmarks');
}

export async function addBookmark(uid: string, activityId: string): Promise<void> {
  await setDoc(bookmarkDoc(uid, activityId), {
    activityId,
    bookmarkedAt: serverTimestamp(),
  });
}

export async function removeBookmark(uid: string, activityId: string): Promise<void> {
  await deleteDoc(bookmarkDoc(uid, activityId));
}

export async function getBookmarkIds(uid: string): Promise<Set<string>> {
  const snapshot = await getDocs(bookmarkCollection(uid));
  return new Set(snapshot.docs.map((d) => d.id));
}

export async function getBookmarkedActivities(
  uid: string,
  cursor: QueryDocumentSnapshot | null,
  pageSize: number = DEFAULT_PAGE_SIZE,
): Promise<BookmarkPage> {
  const baseQuery = query(
    bookmarkCollection(uid),
    orderBy('bookmarkedAt', 'desc'),
    limit(pageSize),
  );
  const q = cursor ? query(baseQuery, startAfter(cursor)) : baseQuery;
  const snapshot = await getDocs(q);
  if (snapshot.docs.length === 0) {
    return { items: [], lastDoc: null };
  }

  const db = getFirestore();
  const activitySnaps = await Promise.all(
    snapshot.docs.map((bookmark) => getDoc(doc(db, 'readingActivities', bookmark.id))),
  );

  const items: ReadingActivity[] = [];
  activitySnaps.forEach((snap) => {
    if (!snap.exists()) return;
    items.push({
      id: snap.id,
      ...(snap.data() as Omit<ReadingActivity, 'id'>),
    });
  });

  const lastDoc = (snapshot.docs[snapshot.docs.length - 1] as QueryDocumentSnapshot) ?? null;
  return { items, lastDoc };
}
