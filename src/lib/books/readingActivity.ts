import firestore from '@react-native-firebase/firestore';
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
};

export async function startReading(userId: string, book: Book): Promise<void> {
  // Deterministic doc ID prevents duplicate records for the same user+book
  const docId = `${userId}_${book.id}`;
  await firestore()
    .collection('readingActivities')
    .doc(docId)
    .set({
      userId,
      bookId: book.id,
      title: book.title,
      authors: book.authors,
      thumbnail: book.thumbnail,
      startedAt: firestore.FieldValue.serverTimestamp(),
    });
}

export function subscribeToReadingActivities(
  userId: string,
  onUpdate: (activities: ReadingActivity[]) => void,
  onError?: (error: Error) => void,
): () => void {
  return firestore()
    .collection('readingActivities')
    .where('userId', '==', userId)
    .orderBy('startedAt', 'desc')
    .onSnapshot(
      (snapshot) => {
        const items: ReadingActivity[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<ReadingActivity, 'id'>),
        }));
        onUpdate(items);
      },
      (error) => {
        if (onError) onError(error);
      },
    );
}
