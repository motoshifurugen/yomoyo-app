import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from 'firebase/firestore';

export const ANIMAL_POOL = ['fox', 'bear'] as const;
export type AnimalKey = (typeof ANIMAL_POOL)[number];

export const ADJECTIVE_POOL = [
  'Quiet',
  'Gentle',
  'Sleepy',
  'Bold',
  'Wise',
  'Swift',
  'Calm',
  'Bright',
  'Misty',
  'Little',
] as const;

export const ANIMAL_ASSETS: Record<AnimalKey, ReturnType<typeof require>> = {
  fox: require('../../../assets/avatars/animals/fox.png'),
  bear: require('../../../assets/avatars/animals/bear.png'),
};

type FirestoreTimestamp = { toMillis: () => number };

export type AvatarIdentity = {
  animalKey: AnimalKey;
  adjective: string;
  displayLabel: string;
  finalizedAt: FirestoreTimestamp | null;
};

export type DraftIdentity = Omit<AvatarIdentity, 'finalizedAt'>;

export function generateRandomIdentity(): DraftIdentity {
  const animalKey = ANIMAL_POOL[Math.floor(Math.random() * ANIMAL_POOL.length)];
  const adjective = ADJECTIVE_POOL[Math.floor(Math.random() * ADJECTIVE_POOL.length)];
  const animalLabel = animalKey.charAt(0).toUpperCase() + animalKey.slice(1);
  return { animalKey, adjective, displayLabel: `${adjective} ${animalLabel}` };
}

export async function saveAvatarIdentity(
  userId: string,
  identity: DraftIdentity,
): Promise<void> {
  const db = getFirestore();
  const ref = doc(db, 'users', userId);
  await setDoc(
    ref,
    {
      animalKey: identity.animalKey,
      adjective: identity.adjective,
      displayLabel: identity.displayLabel,
      finalizedAt: null,
    },
    { merge: true },
  );
}

export async function finalizeAvatarIdentity(userId: string): Promise<void> {
  const db = getFirestore();
  const ref = doc(db, 'users', userId);
  await setDoc(ref, { finalizedAt: serverTimestamp() }, { merge: true });
}

export async function getAvatarIdentity(userId: string): Promise<AvatarIdentity | null> {
  const db = getFirestore();
  const ref = doc(db, 'users', userId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const data = snap.data();
  if (!data?.animalKey || !data?.adjective || !data?.displayLabel) return null;
  if (!(ANIMAL_POOL as readonly string[]).includes(data.animalKey)) return null;
  return {
    animalKey: data.animalKey as AnimalKey,
    adjective: data.adjective as string,
    displayLabel: data.displayLabel as string,
    finalizedAt: (data.finalizedAt as FirestoreTimestamp | undefined) ?? null,
  };
}
