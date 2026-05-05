import {
  getFirestore,
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
  type Firestore,
  type DocumentReference,
} from 'firebase/firestore';

export const HANDLE_REGEX = /^[a-z0-9_]{4,20}$/;

const HANDLE_ALPHABET = 'abcdefghijklmnopqrstuvwxyz0123456789';
const HANDLE_LENGTH = 8;
const MAX_ENSURE_ATTEMPTS = 5;

export function isValidHandle(handle: string): boolean {
  return HANDLE_REGEX.test(handle);
}

export function normalizeHandle(input: string): string {
  return input.trim().toLowerCase();
}

export function generateRandomHandle(): string {
  let out = '';
  for (let i = 0; i < HANDLE_LENGTH; i++) {
    out += HANDLE_ALPHABET[Math.floor(Math.random() * HANDLE_ALPHABET.length)];
  }
  return out;
}

export async function findUidByHandle(input: string): Promise<string | null> {
  const normalized = normalizeHandle(input);
  if (!isValidHandle(normalized)) return null;
  const db = getFirestore();
  const snap = await getDoc(doc(db, 'handles', normalized));
  if (!snap.exists()) return null;
  const uid = snap.data()?.uid;
  if (typeof uid !== 'string' || uid.length === 0) return null;
  return uid;
}

export async function getUserHandle(uid: string): Promise<string | null> {
  const db = getFirestore();
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;
  const handle = snap.data()?.handle;
  if (typeof handle !== 'string' || !isValidHandle(handle)) return null;
  return handle;
}

export async function ensureHandle(uid: string): Promise<string> {
  const db = getFirestore();
  const userRef = doc(db, 'users', uid);
  const snap = await getDoc(userRef);
  const existing = snap.exists() ? (snap.data()?.handle as string | undefined) : undefined;
  if (existing && isValidHandle(existing)) return existing;

  for (let attempt = 0; attempt < MAX_ENSURE_ATTEMPTS; attempt++) {
    const candidate = generateRandomHandle();
    const handleRef = doc(db, 'handles', candidate);
    const reserved = await tryReserveHandle(db, userRef, handleRef, candidate, uid);
    if (reserved) return reserved;
  }
  throw new Error('failed to reserve handle');
}

async function tryReserveHandle(
  db: Firestore,
  userRef: DocumentReference,
  handleRef: DocumentReference,
  candidate: string,
  uid: string,
): Promise<string | null> {
  return runTransaction(db, async (tx) => {
    const userSnap = await tx.get(userRef);
    const concurrent = userSnap.exists()
      ? (userSnap.data()?.handle as string | undefined)
      : undefined;
    if (concurrent && isValidHandle(concurrent)) return concurrent;

    const handleSnap = await tx.get(handleRef);
    if (handleSnap.exists()) return null;

    tx.set(handleRef, { uid, createdAt: serverTimestamp() });
    tx.set(userRef, { handle: candidate }, { merge: true });
    return candidate;
  });
}
