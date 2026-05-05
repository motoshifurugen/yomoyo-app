import {
  getFirestore,
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
} from 'firebase/firestore';
import type { QueryDocumentSnapshot } from 'firebase/firestore';
import type { ReadingActivity } from './readingActivity';

const DEFAULT_PAGE_SIZE = 20;

export type TimelinePage = {
  items: ReadingActivity[];
  lastDoc: QueryDocumentSnapshot | null;
};

export async function getTimeline(
  cursor: QueryDocumentSnapshot | null = null,
  pageSize: number = DEFAULT_PAGE_SIZE,
): Promise<TimelinePage> {
  const db = getFirestore();
  const baseQuery = query(
    collection(db, 'readingActivities'),
    where('status', '==', 'finished'),
    orderBy('finishedAt', 'desc'),
    limit(pageSize),
  );
  const q = cursor ? query(baseQuery, startAfter(cursor)) : baseQuery;
  const snapshot = await getDocs(q);
  const items: ReadingActivity[] = snapshot.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<ReadingActivity, 'id'>),
  }));
  const lastDoc = (snapshot.docs[snapshot.docs.length - 1] as QueryDocumentSnapshot) ?? null;
  return { items, lastDoc };
}
