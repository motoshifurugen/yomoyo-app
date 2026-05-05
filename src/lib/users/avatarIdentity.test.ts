import {
  validateDisplayName,
  saveAvatarIdentity,
  finalizeAvatarIdentity,
  getAvatarIdentity,
  defaultAnimalKey,
  ANIMAL_POOL,
  ANIMAL_ASSETS,
  DISPLAY_NAME_MAX,
} from './avatarIdentity';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('ANIMAL_POOL', () => {
  const expectedKeys = [
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
  ];

  it('contains exactly the 16 in-scope animal keys', () => {
    expect([...ANIMAL_POOL].sort()).toEqual([...expectedKeys].sort());
  });

  it('does not include retired animals', () => {
    const removed = ['hippo', 'cat', 'polar_bear', 'horse', 'elephant', 'pig', 'koala'];
    for (const r of removed) {
      expect(ANIMAL_POOL as readonly string[]).not.toContain(r);
    }
  });

  it('exposes a require() asset for every key', () => {
    for (const key of ANIMAL_POOL) {
      expect(ANIMAL_ASSETS[key]).toBeDefined();
    }
  });
});

describe('defaultAnimalKey', () => {
  it('returns the first key from ANIMAL_POOL', () => {
    expect(defaultAnimalKey()).toBe(ANIMAL_POOL[0]);
  });
});

describe('validateDisplayName', () => {
  it('exposes DISPLAY_NAME_MAX = 20', () => {
    expect(DISPLAY_NAME_MAX).toBe(20);
  });

  it('rejects empty string', () => {
    expect(validateDisplayName('')).toEqual({ ok: false, reason: 'empty' });
  });

  it('rejects whitespace-only input after trim', () => {
    expect(validateDisplayName('   ')).toEqual({ ok: false, reason: 'empty' });
  });

  it('rejects names containing line feed', () => {
    expect(validateDisplayName('hello\nworld')).toEqual({ ok: false, reason: 'has_newline' });
  });

  it('rejects names containing carriage return', () => {
    expect(validateDisplayName('hello\rworld')).toEqual({ ok: false, reason: 'has_newline' });
  });

  it('rejects names longer than 20 code points after trim', () => {
    const tooLong = 'a'.repeat(21);
    expect(validateDisplayName(tooLong)).toEqual({ ok: false, reason: 'too_long' });
  });

  it('counts length by code points (emoji counts as 1)', () => {
    const eighteenAs = 'a'.repeat(18);
    const withEmoji = `${eighteenAs}🦊🐻`;
    const result = validateDisplayName(withEmoji);
    expect(result).toEqual({ ok: true, value: withEmoji });
  });

  it('rejects 21 code points even with emoji', () => {
    const nineteenAs = 'a'.repeat(19);
    const tooLong = `${nineteenAs}🦊🐻`;
    expect(validateDisplayName(tooLong)).toEqual({ ok: false, reason: 'too_long' });
  });

  it('accepts CJK characters within the limit', () => {
    expect(validateDisplayName('もとし')).toEqual({ ok: true, value: 'もとし' });
  });

  it('trims surrounding whitespace before saving', () => {
    expect(validateDisplayName('  hello  ')).toEqual({ ok: true, value: 'hello' });
  });

  it('accepts exactly 20 code points', () => {
    const twenty = 'a'.repeat(20);
    expect(validateDisplayName(twenty)).toEqual({ ok: true, value: twenty });
  });
});

describe('saveAvatarIdentity', () => {
  it('writes to the users collection with the given userId', async () => {
    await saveAvatarIdentity('user1', { animalKey: 'fox', displayName: 'Foxy' });
    expect(jest.mocked(doc)).toHaveBeenCalledWith(expect.anything(), 'users', 'user1');
  });

  it('stores animalKey and displayName only (no adjective/displayLabel)', async () => {
    await saveAvatarIdentity('user1', { animalKey: 'fox', displayName: 'Foxy' });
    expect(jest.mocked(setDoc)).toHaveBeenCalledWith(
      expect.anything(),
      { animalKey: 'fox', displayName: 'Foxy' },
      { merge: true },
    );
  });

  it('trims displayName before persisting', async () => {
    await saveAvatarIdentity('user1', { animalKey: 'bear', displayName: '  Bear  ' });
    expect(jest.mocked(setDoc)).toHaveBeenCalledWith(
      expect.anything(),
      { animalKey: 'bear', displayName: 'Bear' },
      { merge: true },
    );
  });

  it('throws when displayName is invalid (empty)', async () => {
    await expect(
      saveAvatarIdentity('user1', { animalKey: 'fox', displayName: '   ' }),
    ).rejects.toThrow();
    expect(jest.mocked(setDoc)).not.toHaveBeenCalled();
  });

  it('throws when displayName contains a newline', async () => {
    await expect(
      saveAvatarIdentity('user1', { animalKey: 'fox', displayName: 'a\nb' }),
    ).rejects.toThrow();
    expect(jest.mocked(setDoc)).not.toHaveBeenCalled();
  });

  it('throws when animalKey is unknown', async () => {
    await expect(
      saveAvatarIdentity('user1', {
        // @ts-expect-error intentional bad key for test
        animalKey: 'dragon',
        displayName: 'Dragon',
      }),
    ).rejects.toThrow();
    expect(jest.mocked(setDoc)).not.toHaveBeenCalled();
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
});

describe('getAvatarIdentity', () => {
  it('returns null when no document exists', async () => {
    jest.mocked(getDoc).mockResolvedValueOnce({ exists: () => false } as any);
    const result = await getAvatarIdentity('user1');
    expect(result).toBeNull();
  });

  it('returns null when animalKey is missing', async () => {
    jest.mocked(getDoc).mockResolvedValueOnce({
      exists: () => true,
      data: () => ({ displayName: 'Foxy', finalizedAt: null }),
    } as any);
    expect(await getAvatarIdentity('user1')).toBeNull();
  });

  it('returns null when animalKey is not in ANIMAL_POOL', async () => {
    jest.mocked(getDoc).mockResolvedValueOnce({
      exists: () => true,
      data: () => ({ animalKey: 'dragon', displayName: 'Foxy', finalizedAt: null }),
    } as any);
    expect(await getAvatarIdentity('user1')).toBeNull();
  });

  it('returns null when both displayName and displayLabel are missing', async () => {
    jest.mocked(getDoc).mockResolvedValueOnce({
      exists: () => true,
      data: () => ({ animalKey: 'fox', finalizedAt: null }),
    } as any);
    expect(await getAvatarIdentity('user1')).toBeNull();
  });

  it('returns the new shape when displayName is set', async () => {
    jest.mocked(getDoc).mockResolvedValueOnce({
      exists: () => true,
      data: () => ({ animalKey: 'fox', displayName: 'Foxy', finalizedAt: null }),
    } as any);
    expect(await getAvatarIdentity('user1')).toEqual({
      animalKey: 'fox',
      displayName: 'Foxy',
      finalizedAt: null,
    });
  });

  it('falls back to legacy displayLabel when displayName is missing', async () => {
    jest.mocked(getDoc).mockResolvedValueOnce({
      exists: () => true,
      data: () => ({
        animalKey: 'fox',
        adjective: 'Quiet',
        displayLabel: 'Quiet Fox',
        finalizedAt: null,
      }),
    } as any);
    expect(await getAvatarIdentity('user1')).toEqual({
      animalKey: 'fox',
      displayName: 'Quiet Fox',
      finalizedAt: null,
    });
  });

  it('prefers displayName over legacy displayLabel when both are present', async () => {
    jest.mocked(getDoc).mockResolvedValueOnce({
      exists: () => true,
      data: () => ({
        animalKey: 'fox',
        displayName: 'New Name',
        displayLabel: 'Quiet Fox',
        finalizedAt: null,
      }),
    } as any);
    const result = await getAvatarIdentity('user1');
    expect(result?.displayName).toBe('New Name');
  });

  it('preserves a finalizedAt timestamp when present', async () => {
    const ts = { toMillis: () => 1234567890 };
    jest.mocked(getDoc).mockResolvedValueOnce({
      exists: () => true,
      data: () => ({
        animalKey: 'bear',
        displayName: 'Bear',
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
