import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from 'firebase/firestore';

export const ANIMAL_POOL = [
  'seal',
  'chicken',
  'buffalo',
  'cow',
  'monkey',
  'fox',
  'wolf',
  'raccoon_dog',
  'sheep',
  'ladybug',
  'rhinoceros_beetle',
  'deer',
  'bulldog',
  'bear',
  'eagle',
  'penguin',
] as const;
export type AnimalKey = (typeof ANIMAL_POOL)[number];

export const ANIMAL_ASSETS: Record<AnimalKey, ReturnType<typeof require>> = {
  seal: require('../../../assets/avatars/animals/seal.png'),
  chicken: require('../../../assets/avatars/animals/chicken.png'),
  buffalo: require('../../../assets/avatars/animals/buffalo.png'),
  cow: require('../../../assets/avatars/animals/cow.png'),
  monkey: require('../../../assets/avatars/animals/monkey.png'),
  fox: require('../../../assets/avatars/animals/fox.png'),
  wolf: require('../../../assets/avatars/animals/wolf.png'),
  raccoon_dog: require('../../../assets/avatars/animals/raccoon_dog.png'),
  sheep: require('../../../assets/avatars/animals/sheep.png'),
  ladybug: require('../../../assets/avatars/animals/ladybug.png'),
  rhinoceros_beetle: require('../../../assets/avatars/animals/rhinoceros_beetle.png'),
  deer: require('../../../assets/avatars/animals/deer.png'),
  bulldog: require('../../../assets/avatars/animals/bulldog.png'),
  bear: require('../../../assets/avatars/animals/bear.png'),
  eagle: require('../../../assets/avatars/animals/eagle.png'),
  penguin: require('../../../assets/avatars/animals/penguin.png'),
};

type FirestoreTimestamp = { toMillis: () => number };

export const DISPLAY_NAME_MAX = 20;

export type AvatarIdentity = {
  animalKey: AnimalKey;
  displayName: string;
  finalizedAt: FirestoreTimestamp | null;
};

export type AvatarIdentityInput = {
  animalKey: AnimalKey;
  displayName: string;
};

export type DisplayNameValidation =
  | { ok: true; value: string }
  | { ok: false; reason: 'empty' | 'too_long' | 'has_newline' };

export function validateDisplayName(input: string): DisplayNameValidation {
  const trimmed = input.trim();
  if (trimmed.length === 0) return { ok: false, reason: 'empty' };
  if (/[\r\n]/.test(trimmed)) return { ok: false, reason: 'has_newline' };
  if ([...trimmed].length > DISPLAY_NAME_MAX) return { ok: false, reason: 'too_long' };
  return { ok: true, value: trimmed };
}

function isKnownAnimalKey(key: string): key is AnimalKey {
  return (ANIMAL_POOL as readonly string[]).includes(key);
}

// Resolves the visible name from a raw user doc, preferring the new
// `displayName` field but falling back to the legacy `displayLabel` for one
// release window so existing accounts keep rendering correctly.
export function pickDisplayName(data: Record<string, unknown>): string | null {
  for (const key of ['displayName', 'displayLabel'] as const) {
    const value = data[key];
    if (typeof value === 'string' && value.length > 0) return value;
  }
  return null;
}

export function defaultAnimalKey(): AnimalKey {
  return ANIMAL_POOL[0];
}

export async function saveAvatarIdentity(
  userId: string,
  identity: AvatarIdentityInput,
): Promise<void> {
  if (!isKnownAnimalKey(identity.animalKey)) {
    throw new Error('invalid animalKey');
  }
  const validation = validateDisplayName(identity.displayName);
  if (!validation.ok) {
    throw new Error(`invalid displayName: ${validation.reason}`);
  }
  const db = getFirestore();
  const ref = doc(db, 'users', userId);
  await setDoc(
    ref,
    {
      animalKey: identity.animalKey,
      displayName: validation.value,
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
  if (!data) return null;
  const animalKey = data.animalKey;
  if (typeof animalKey !== 'string' || !isKnownAnimalKey(animalKey)) return null;

  const displayName = pickDisplayName(data);
  if (displayName === null) return null;

  return {
    animalKey,
    displayName,
    finalizedAt: (data.finalizedAt as FirestoreTimestamp | undefined) ?? null,
  };
}
