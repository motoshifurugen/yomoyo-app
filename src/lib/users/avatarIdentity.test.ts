import {
  generateRandomIdentity,
  saveAvatarIdentity,
  finalizeAvatarIdentity,
  getAvatarIdentity,
  ANIMAL_POOL,
  ADJECTIVE_POOL,
} from './avatarIdentity';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('generateRandomIdentity', () => {
  it('returns an animalKey from ANIMAL_POOL', () => {
    const identity = generateRandomIdentity();
    expect(ANIMAL_POOL).toContain(identity.animalKey);
  });

  it('returns an adjective from ADJECTIVE_POOL', () => {
    const identity = generateRandomIdentity();
    expect(ADJECTIVE_POOL).toContain(identity.adjective);
  });

  it('returns a displayLabel combining adjective and capitalized animal', () => {
    const identity = generateRandomIdentity();
    const capitalizedAnimal =
      identity.animalKey.charAt(0).toUpperCase() + identity.animalKey.slice(1);
    expect(identity.displayLabel).toBe(`${identity.adjective} ${capitalizedAnimal}`);
  });

  it('returns different identities over multiple calls (probabilistic)', () => {
    const results = new Set<string>();
    for (let i = 0; i < 30; i++) {
      results.add(JSON.stringify(generateRandomIdentity()));
    }
    expect(results.size).toBeGreaterThan(1);
  });
});

describe('saveAvatarIdentity', () => {
  const draft = { animalKey: 'fox' as const, adjective: 'Quiet', displayLabel: 'Quiet Fox' };

  it('writes to the users collection with the given userId', async () => {
    await saveAvatarIdentity('user1', draft);
    expect(jest.mocked(doc)).toHaveBeenCalledWith(expect.anything(), 'users', 'user1');
  });

  it('stores animalKey, adjective, displayLabel, and sets finalizedAt to null', async () => {
    await saveAvatarIdentity('user1', draft);
    expect(jest.mocked(setDoc)).toHaveBeenCalledWith(
      expect.anything(),
      { animalKey: 'fox', adjective: 'Quiet', displayLabel: 'Quiet Fox', finalizedAt: null },
      { merge: true },
    );
  });

  it('resolves without error', async () => {
    await expect(saveAvatarIdentity('user1', draft)).resolves.toBeUndefined();
  });
});

describe('finalizeAvatarIdentity', () => {
  it('writes to the users collection with the given userId', async () => {
    await finalizeAvatarIdentity('user1');
    expect(jest.mocked(doc)).toHaveBeenCalledWith(expect.anything(), 'users', 'user1');
  });

  it('sets finalizedAt to serverTimestamp', async () => {
    await finalizeAvatarIdentity('user1');
    expect(jest.mocked(serverTimestamp)).toHaveBeenCalled();
    expect(jest.mocked(setDoc)).toHaveBeenCalledWith(
      expect.anything(),
      { finalizedAt: expect.anything() },
      { merge: true },
    );
  });

  it('resolves without error', async () => {
    await expect(finalizeAvatarIdentity('user1')).resolves.toBeUndefined();
  });
});

describe('getAvatarIdentity', () => {
  it('returns null when no document exists', async () => {
    jest.mocked(getDoc).mockResolvedValueOnce({ exists: () => false } as any);
    const result = await getAvatarIdentity('user1');
    expect(result).toBeNull();
  });

  it('returns null when document is missing required fields', async () => {
    jest.mocked(getDoc).mockResolvedValueOnce({
      exists: () => true,
      data: () => ({ finalizedAt: null }),
    } as any);
    const result = await getAvatarIdentity('user1');
    expect(result).toBeNull();
  });

  it('returns null when animalKey is not in ANIMAL_POOL', async () => {
    jest.mocked(getDoc).mockResolvedValueOnce({
      exists: () => true,
      data: () => ({
        animalKey: 'dragon',
        adjective: 'Quiet',
        displayLabel: 'Quiet Dragon',
        finalizedAt: null,
      }),
    } as any);
    const result = await getAvatarIdentity('user1');
    expect(result).toBeNull();
  });

  it('returns the avatar identity when document has all required fields', async () => {
    jest.mocked(getDoc).mockResolvedValueOnce({
      exists: () => true,
      data: () => ({
        animalKey: 'fox',
        adjective: 'Quiet',
        displayLabel: 'Quiet Fox',
        finalizedAt: null,
      }),
    } as any);
    const result = await getAvatarIdentity('user1');
    expect(result).toEqual({
      animalKey: 'fox',
      adjective: 'Quiet',
      displayLabel: 'Quiet Fox',
      finalizedAt: null,
    });
  });

  it('includes a finalizedAt timestamp when the identity is locked', async () => {
    const ts = { toMillis: () => 1234567890 };
    jest.mocked(getDoc).mockResolvedValueOnce({
      exists: () => true,
      data: () => ({
        animalKey: 'bear',
        adjective: 'Bold',
        displayLabel: 'Bold Bear',
        finalizedAt: ts,
      }),
    } as any);
    const result = await getAvatarIdentity('user1');
    expect(result?.finalizedAt).toBe(ts);
  });

  it('queries the users collection with the given userId', async () => {
    jest.mocked(getDoc).mockResolvedValueOnce({ exists: () => false } as any);
    await getAvatarIdentity('user42');
    expect(jest.mocked(doc)).toHaveBeenCalledWith(expect.anything(), 'users', 'user42');
  });
});
