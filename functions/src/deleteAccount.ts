import type { Auth } from 'firebase-admin/auth';
import type {
  DocumentReference,
  Firestore,
  WriteBatch,
} from 'firebase-admin/firestore';

// Firestore caps a single WriteBatch at 500 operations. Account-level data is
// small in practice, but chunking keeps deletion correct regardless of size.
const MAX_BATCH_OPS = 500;

export interface DeleteAccountResult {
  followsDeleted: number;
  activitiesAnonymized: number;
}

// Deletes all account-owned data for `uid` and the Firebase Auth user.
//
// Reading activities are intentionally NOT deleted: other users may have
// bookmarked them, and a bookmark resolves the activity by document id. We
// anonymize them in place so bookmarked records keep rendering, shown with a
// placeholder avatar and a localized "deleted user" label (see the
// `authorDeleted` flag consumed by the client).
export async function deleteUserData(
  db: Firestore,
  auth: Auth,
  uid: string,
): Promise<DeleteAccountResult> {
  // Steps run sequentially with no transaction, but every step is idempotent
  // and Auth deletion runs LAST on purpose: if an earlier step fails the caller
  // stays authenticated and can safely retry the whole operation.
  const activitiesAnonymized = await anonymizeReadingActivities(db, uid);
  const followsDeleted = await deleteFollows(db, uid);

  // recursiveDelete removes the user document together with its subcollections
  // (pushTokens, bookmarks owned by this user).
  await db.recursiveDelete(db.collection('users').doc(uid));

  await deleteAuthUser(auth, uid);

  return { followsDeleted, activitiesAnonymized };
}

async function deleteAuthUser(auth: Auth, uid: string): Promise<void> {
  try {
    await auth.deleteUser(uid);
  } catch (err) {
    // On a retry after a previously successful Auth deletion the user is already
    // gone; treat that as success so the retry can complete.
    if ((err as { code?: string }).code === 'auth/user-not-found') return;
    throw err;
  }
}

async function anonymizeReadingActivities(
  db: Firestore,
  uid: string,
): Promise<number> {
  const snap = await db
    .collection('readingActivities')
    .where('userId', '==', uid)
    .get();
  if (snap.empty) return 0;

  const refs = snap.docs.map((d) => d.ref);
  await commitInChunks(db, refs, (batch, ref) => {
    batch.update(ref, {
      authorDeleted: true,
      displayAvatar: null,
      // Clear both the current and legacy name fields so no identity leaks.
      displayName: '',
      displayLabel: '',
    });
  });
  return snap.size;
}

async function deleteFollows(db: Firestore, uid: string): Promise<number> {
  const [asFollower, asFollowed] = await Promise.all([
    db.collection('follows').where('followerId', '==', uid).get(),
    db.collection('follows').where('followedUid', '==', uid).get(),
  ]);

  // A doc can match both queries (e.g. a self-follow); dedupe by id.
  const refs = new Map<string, DocumentReference>();
  for (const doc of [...asFollower.docs, ...asFollowed.docs]) {
    refs.set(doc.id, doc.ref);
  }
  if (refs.size === 0) return 0;

  await commitInChunks(db, [...refs.values()], (batch, ref) => {
    batch.delete(ref);
  });
  return refs.size;
}

async function commitInChunks(
  db: Firestore,
  refs: readonly DocumentReference[],
  apply: (batch: WriteBatch, ref: DocumentReference) => void,
): Promise<void> {
  for (let i = 0; i < refs.length; i += MAX_BATCH_OPS) {
    const batch = db.batch();
    for (const ref of refs.slice(i, i + MAX_BATCH_OPS)) {
      apply(batch, ref);
    }
    await batch.commit();
  }
}
