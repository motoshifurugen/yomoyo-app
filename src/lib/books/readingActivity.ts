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
  displayName?: string;
  displayAvatar?: string | null;
  // Legacy field, kept readable for one release window so existing docs still
  // render correctly. Removed once all live docs have been rewritten.
  displayLabel?: string;
  // Set when the author deleted their account. The activity is kept (bookmarks
  // reference it by id) but its identity is anonymized: the name is replaced
  // with a localized "deleted user" label and the avatar falls back to the
  // placeholder. See functions/src/deleteAccount.ts.
  authorDeleted?: boolean;
};

// Resolves the author name to render for an activity. Anonymized (deleted)
// authors render the provided localized label; otherwise the denormalized
// display name (with a one-release fallback to the legacy field) is used.
export function resolveAuthorName(
  activity: Pick<ReadingActivity, 'displayName' | 'displayLabel' | 'authorDeleted'>,
  deletedLabel: string,
): string | null {
  if (activity.authorDeleted) return deletedLabel;
  return activity.displayName ?? activity.displayLabel ?? null;
}

export type Presenter = {
  displayName: string;
  displayAvatar: string | null;
};

export async function markAsFinished(userId: string, book: Book, presenter: Presenter): Promise<void> {
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
    displayName: presenter.displayName,
    displayAvatar: presenter.displayAvatar,
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
