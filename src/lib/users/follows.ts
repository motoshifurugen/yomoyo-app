import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';

export async function getFollowingUids(userId: string): Promise<string[]> {
  const db = getFirestore();
  const q = query(collection(db, 'follows'), where('followerId', '==', userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => (d.data() as { followedUid: string }).followedUid);
}
