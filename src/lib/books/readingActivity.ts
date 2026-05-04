import {
  getFirestore,
  collection,
  doc,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import type { Book } from './searchBooks';

// Minimal Firestore Timestamp shape needed for reading activity
type FirestoreTimestamp = { toMillis: () => number; toDate: () => Date };

export type ReadingActivity = {
  id: string;
  userId: string;
  bookId: string;
  title: string;
  authors: string[];
  thumbnail: string | null;
  startedAt: FirestoreTimestamp | null;
  status?: 'reading' | 'finished';
  finishedAt?: FirestoreTimestamp | null;
};

export async function startReading(userId: string, book: Book): Promise<void> {
  const db = getFirestore();
  // Deterministic doc ID prevents duplicate records for the same user+book
  const docRef = doc(db, 'readingActivities', `${userId}_${book.id}`);
  await setDoc(docRef, {
    userId,
    bookId: book.id,
    title: book.title,
    authors: book.authors,
    thumbnail: book.thumbnail,
    startedAt: serverTimestamp(),
    status: 'reading',
  });
}

export async function markAsFinished(userId: string, bookId: string): Promise<void> {
  const db = getFirestore();
  const docRef = doc(db, 'readingActivities', `${userId}_${bookId}`);
  await updateDoc(docRef, {
    status: 'finished',
    finishedAt: serverTimestamp(),
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
    orderBy('startedAt', 'desc'),
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
