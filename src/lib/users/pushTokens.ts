import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';

export type PushTokenPlatform = 'ios' | 'android' | 'web' | 'windows' | 'macos';
export type PushTokenLanguage = 'ja' | 'en';

export function derivePushTokenId(token: string): string {
  return token.replace(/[\[\]:/\s]/g, '_');
}

export async function savePushToken(
  userId: string,
  token: string,
  platform: PushTokenPlatform,
  language: PushTokenLanguage,
): Promise<void> {
  const db = getFirestore();
  const tokenId = derivePushTokenId(token);
  const ref = doc(db, 'users', userId, 'pushTokens', tokenId);
  const snap = await getDoc(ref);
  const now = serverTimestamp();

  const base = {
    token,
    platform,
    language,
    enabled: true,
    source: 'expo' as const,
    updatedAt: now,
    lastSeenAt: now,
  };

  const payload = snap.exists() ? base : { ...base, createdAt: now };
  await setDoc(ref, payload, { merge: true });
}
