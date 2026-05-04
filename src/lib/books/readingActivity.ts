import {
  getFirestore,
  collection,
  doc,
  setDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import type { Book } from './searchBooks';

type FirestoreTimestamp = { toMillis: () => number; toDate: () => Date };

export type ReadingActivity = {
  id: string;
  userId: string;
  bookId: string;
  title: string;
  authors: string[];
  thumbnail: string | null;
  status: 'finished';
  finishedAt: FirestoreTimestamp | null;
};

export async function markAsFinished(userId: string, book: Book): Promise<void> {
  const db = getFirestore();
  const docRef = doc(db, 'readingActivities', `${userId}_${book.id}`);
  await setDoc(docRef, {
    userId,
    bookId: book.id,
    title: book.title,
    authors: book.authors,
    thumbnail: book.thumbnail,
    finishedAt: serverTimestamp(),
    status: 'finished',
  });
}

export function subscribeToReadingActivities(
  userId: string,
  onUpdate: (activities: ReadingActivity[]) => void,
  onError?: (error: Error) => void,
): () => void {
  const db = getFirestore();
  const q = query(
    collection(db, 'readingActivities'),
    where('userId', '==', userId),
    where('status', '==', 'finished'),
    orderBy('finishedAt', 'desc'),
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const items: ReadingActivity[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<ReadingActivity, 'id'>),
      }));
      onUpdate(items);
    },
    (error) => {
      if (onError) onError(error);
    },
  );
}
