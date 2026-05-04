import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  getDoc,
  serverTimestamp,
} from 'firebase/firestore';

export type UserProfile = {
  uid: string;
  displayLabel: string;
  animalKey: string;
};

export async function getFollowingUids(userId: string): Promise<string[]> {
  const db = getFirestore();
  const q = query(collection(db, 'follows'), where('followerId', '==', userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => (d.data() as { followedUid: string }).followedUid);
}

export async function followUser(followerId: string, followedUid: string): Promise<void> {
  const db = getFirestore();
  await setDoc(doc(db, 'follows', `${followerId}_${followedUid}`), {
    followerId,
    followedUid,
    createdAt: serverTimestamp(),
  });
}

export async function unfollowUser(followerId: string, followedUid: string): Promise<void> {
  const db = getFirestore();
  await deleteDoc(doc(db, 'follows', `${followerId}_${followedUid}`));
}

export async function isFollowing(followerId: string, followedUid: string): Promise<boolean> {
  const db = getFirestore();
  const snap = await getDoc(doc(db, 'follows', `${followerId}_${followedUid}`));
  return snap.exists();
}

export async function getFollowingProfiles(userId: string): Promise<UserProfile[]> {
  const uids = await getFollowingUids(userId);
  if (uids.length === 0) return [];
  const db = getFirestore();
  const results = await Promise.allSettled(
    uids.map(async (uid) => {
      const snap = await getDoc(doc(db, 'users', uid));
      if (!snap.exists()) return null;
      const data = snap.data();
      if (!data?.displayLabel || !data?.animalKey) return null;
      return { uid, displayLabel: data.displayLabel as string, animalKey: data.animalKey as string };
    }),
  );
  return results
    .filter((r): r is PromiseFulfilledResult<UserProfile | null> => r.status === 'fulfilled')
    .map((r) => r.value)
    .filter((p): p is UserProfile => p !== null);
}
