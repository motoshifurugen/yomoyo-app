import type { Firestore } from 'firebase-admin/firestore';

export type RecipientLanguage = 'ja' | 'en';

export interface Recipient {
  uid: string;
  token: string;
  language: RecipientLanguage;
}

function readLanguage(value: unknown): RecipientLanguage {
  return value === 'ja' ? 'ja' : 'en';
}

export async function getFollowerUids(
  db: Firestore,
  sourceUid: string,
): Promise<string[]> {
  const snap = await db
    .collection('follows')
    .where('followedUid', '==', sourceUid)
    .get();
  const seen = new Set<string>();
  for (const doc of snap.docs) {
    const followerId = doc.get('followerId');
    if (typeof followerId === 'string' && followerId.length > 0) {
      seen.add(followerId);
    }
  }
  return Array.from(seen);
}

export async function getEnabledPushTokens(
  db: Firestore,
  uids: readonly string[],
): Promise<Recipient[]> {
  if (uids.length === 0) return [];

  const perUser = await Promise.all(
    uids.map(async (uid) => {
      const snap = await db
        .collection('users')
        .doc(uid)
        .collection('pushTokens')
        .get();
      const entries: Array<{ token: string; language: RecipientLanguage }> = [];
      for (const doc of snap.docs) {
        if (doc.get('enabled') !== true) continue;
        const token = doc.get('token');
        if (typeof token !== 'string' || token.length === 0) continue;
        entries.push({ token, language: readLanguage(doc.get('language')) });
      }
      return { uid, entries };
    }),
  );

  const seen = new Set<string>();
  const out: Recipient[] = [];
  for (const { uid, entries } of perUser) {
    for (const { token, language } of entries) {
      if (seen.has(token)) continue;
      seen.add(token);
      out.push({ uid, token, language });
    }
  }
  return out;
}

export async function resolveRecipients(
  db: Firestore,
  sourceUid: string,
): Promise<Recipient[]> {
  const followerUids = await getFollowerUids(db, sourceUid);
  return getEnabledPushTokens(db, followerUids);
}
