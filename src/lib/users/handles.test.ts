import {
  generateRandomHandle,
  isValidHandle,
  normalizeHandle,
  ensureHandle,
  getUserHandle,
  findUidByHandle,
  HANDLE_REGEX,
} from './handles';
import { doc, getDoc, runTransaction, serverTimestamp } from 'firebase/firestore';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('HANDLE_REGEX', () => {
  it('accepts 4 to 20 lowercase ASCII alphanumeric and underscore', () => {
    expect(HANDLE_REGEX.test('abcd')).toBe(true);
    expect(HANDLE_REGEX.test('with_under')).toBe(true);
    expect(HANDLE_REGEX.test('a'.repeat(20))).toBe(true);
  });

  it('rejects too short', () => {
    expect(HANDLE_REGEX.test('abc')).toBe(false);
    expect(HANDLE_REGEX.test('')).toBe(false);
  });

  it('rejects too long', () => {
    expect(HANDLE_REGEX.test('a'.repeat(21))).toBe(false);
  });

  it('rejects uppercase', () => {
    expect(HANDLE_REGEX.test('Abcd')).toBe(false);
  });

  it('rejects whitespace and special characters', () => {
    expect(HANDLE_REGEX.test('ab-cd')).toBe(false);
    expect(HANDLE_REGEX.test('ab.cd')).toBe(false);
    expect(HANDLE_REGEX.test('ab cd')).toBe(false);
    expect(HANDLE_REGEX.test('あいうえ')).toBe(false);
  });
});

describe('isValidHandle', () => {
  it('returns true for a valid handle', () => {
    expect(isValidHandle('quietfox42')).toBe(true);
  });

  it('returns false for an invalid handle', () => {
    expect(isValidHandle('Q!')).toBe(false);
  });
});

describe('normalizeHandle', () => {
  it('lowercases input', () => {
    expect(normalizeHandle('AbcDef')).toBe('abcdef');
  });

  it('trims surrounding whitespace', () => {
    expect(normalizeHandle('  abc  ')).toBe('abc');
  });

  it('does not strip invalid characters', () => {
    expect(normalizeHandle('Ab-cd')).toBe('ab-cd');
  });
});

describe('generateRandomHandle', () => {
  it('always returns a string matching HANDLE_REGEX', () => {
    for (let i = 0; i < 50; i++) {
      expect(HANDLE_REGEX.test(generateRandomHandle())).toBe(true);
    }
  });

  it('returns different handles across multiple calls', () => {
    const seen = new Set<string>();
    for (let i = 0; i < 50; i++) seen.add(generateRandomHandle());
    expect(seen.size).toBeGreaterThan(40);
  });
});

describe('ensureHandle', () => {
  function mockExistingHandle(handle: string) {
    jest.mocked(getDoc).mockResolvedValueOnce({
      exists: () => true,
      data: () => ({ handle }),
    } as any);
  }

  function mockNoHandleYet() {
    jest.mocked(getDoc).mockResolvedValueOnce({
      exists: () => true,
      data: () => ({ animalKey: 'fox' }),
    } as any);
  }

  type TxBehavior = {
    userInTx?: { exists: boolean; data?: Record<string, unknown> };
    handleInTx?: { exists: boolean };
  };

  function queueTransaction(behavior: TxBehavior = {}): jest.Mock {
    const set = jest.fn();
    jest.mocked(runTransaction).mockImplementationOnce(async (_db, cb) => {
      const tx = {
        get: jest
          .fn()
          .mockResolvedValueOnce({
            exists: () => behavior.userInTx?.exists ?? true,
            data: () => behavior.userInTx?.data ?? {},
          })
          .mockResolvedValueOnce({
            exists: () => behavior.handleInTx?.exists ?? false,
            data: () => undefined,
          }),
        set,
        update: jest.fn(),
        delete: jest.fn(),
      };
      return (cb as (tx: any) => any)(tx);
    });
    return set;
  }

  it('returns the existing handle when users/{uid}.handle is already set', async () => {
    mockExistingHandle('foo123');

    const result = await ensureHandle('user1');

    expect(result).toBe('foo123');
    expect(jest.mocked(runTransaction)).not.toHaveBeenCalled();
  });

  it('reads users/{uid} to look up the existing handle', async () => {
    mockExistingHandle('foo123');

    await ensureHandle('user1');

    expect(jest.mocked(doc)).toHaveBeenCalledWith(expect.anything(), 'users', 'user1');
    expect(jest.mocked(getDoc)).toHaveBeenCalled();
  });

  it('regenerates when the existing handle is malformed', async () => {
    jest.mocked(getDoc).mockResolvedValueOnce({
      exists: () => true,
      data: () => ({ handle: 'BAD!HANDLE' }),
    } as any);
    const set = queueTransaction();

    const result = await ensureHandle('user1');

    expect(HANDLE_REGEX.test(result)).toBe(true);
    expect(set).toHaveBeenCalled();
  });

  it('reserves a fresh handle when none is assigned', async () => {
    mockNoHandleYet();
    const set = queueTransaction();

    const result = await ensureHandle('user1');

    expect(HANDLE_REGEX.test(result)).toBe(true);
    expect(set).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ uid: 'user1', createdAt: expect.anything() }),
    );
    expect(set).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ handle: result }),
      { merge: true },
    );
    expect(jest.mocked(serverTimestamp)).toHaveBeenCalled();
  });

  it('addresses the new handle document at handles/{candidate}', async () => {
    mockNoHandleYet();
    queueTransaction();

    const result = await ensureHandle('user1');

    expect(jest.mocked(doc)).toHaveBeenCalledWith(expect.anything(), 'handles', result);
  });

  it('retries with a fresh candidate when the first candidate is taken', async () => {
    mockNoHandleYet();
    queueTransaction({ handleInTx: { exists: true } });
    queueTransaction();

    const result = await ensureHandle('user1');

    expect(HANDLE_REGEX.test(result)).toBe(true);
    expect(jest.mocked(runTransaction)).toHaveBeenCalledTimes(2);
  });

  it('returns the concurrent handle if another caller assigned one during the transaction', async () => {
    mockNoHandleYet();
    queueTransaction({ userInTx: { exists: true, data: { handle: 'concurrent1' } } });

    const result = await ensureHandle('user1');

    expect(result).toBe('concurrent1');
  });

  it('throws after exhausting all retry attempts', async () => {
    mockNoHandleYet();
    jest.mocked(runTransaction).mockImplementation(async (_db, cb) => {
      const tx = {
        get: jest
          .fn()
          .mockResolvedValueOnce({ exists: () => true, data: () => ({}) })
          .mockResolvedValueOnce({ exists: () => true, data: () => ({}) }),
        set: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      };
      return (cb as (tx: any) => any)(tx);
    });

    await expect(ensureHandle('user1')).rejects.toThrow();
  });

  it('propagates non-conflict errors from the transaction', async () => {
    mockNoHandleYet();
    jest.mocked(runTransaction).mockRejectedValueOnce(new Error('network down'));

    await expect(ensureHandle('user1')).rejects.toThrow('network down');
  });
});

describe('getUserHandle', () => {
  it('returns the handle when users/{uid}.handle is a valid string', async () => {
    jest.mocked(getDoc).mockResolvedValueOnce({
      exists: () => true,
      data: () => ({ handle: 'quietfox' }),
    } as any);

    const result = await getUserHandle('user1');

    expect(result).toBe('quietfox');
  });

  it('reads from users/{uid}', async () => {
    jest.mocked(getDoc).mockResolvedValueOnce({
      exists: () => true,
      data: () => ({ handle: 'quietfox' }),
    } as any);

    await getUserHandle('user1');

    expect(jest.mocked(doc)).toHaveBeenCalledWith(expect.anything(), 'users', 'user1');
  });

  it('returns null when the user document does not exist', async () => {
    jest.mocked(getDoc).mockResolvedValueOnce({
      exists: () => false,
      data: () => undefined,
    } as any);

    const result = await getUserHandle('user1');

    expect(result).toBeNull();
  });

  it('returns null when the handle field is missing', async () => {
    jest.mocked(getDoc).mockResolvedValueOnce({
      exists: () => true,
      data: () => ({ animalKey: 'fox' }),
    } as any);

    const result = await getUserHandle('user1');

    expect(result).toBeNull();
  });

  it('returns null when the handle field is malformed', async () => {
    jest.mocked(getDoc).mockResolvedValueOnce({
      exists: () => true,
      data: () => ({ handle: 'BAD!HANDLE' }),
    } as any);

    const result = await getUserHandle('user1');

    expect(result).toBeNull();
  });

  it('returns null when the handle field is not a string', async () => {
    jest.mocked(getDoc).mockResolvedValueOnce({
      exists: () => true,
      data: () => ({ handle: 42 }),
    } as any);

    const result = await getUserHandle('user1');

    expect(result).toBeNull();
  });
});

describe('findUidByHandle', () => {
  it('returns the uid when handles/{handle} exists', async () => {
    jest.mocked(getDoc).mockResolvedValueOnce({
      exists: () => true,
      data: () => ({ uid: 'user42' }),
    } as any);

    const result = await findUidByHandle('quietfox');

    expect(result).toBe('user42');
  });

  it('reads from handles/{normalizedHandle}', async () => {
    jest.mocked(getDoc).mockResolvedValueOnce({
      exists: () => true,
      data: () => ({ uid: 'user42' }),
    } as any);

    await findUidByHandle('  QuietFox  ');

    expect(jest.mocked(doc)).toHaveBeenCalledWith(expect.anything(), 'handles', 'quietfox');
  });

  it('returns null when handles/{handle} does not exist', async () => {
    jest.mocked(getDoc).mockResolvedValueOnce({
      exists: () => false,
      data: () => undefined,
    } as any);

    const result = await findUidByHandle('quietfox');

    expect(result).toBeNull();
  });

  it('returns null without hitting Firestore when input is empty', async () => {
    const result = await findUidByHandle('');

    expect(result).toBeNull();
    expect(jest.mocked(getDoc)).not.toHaveBeenCalled();
  });

  it('returns null without hitting Firestore when input is too short', async () => {
    const result = await findUidByHandle('abc');

    expect(result).toBeNull();
    expect(jest.mocked(getDoc)).not.toHaveBeenCalled();
  });

  it('returns null without hitting Firestore when input has invalid characters', async () => {
    const result = await findUidByHandle('foo-bar');

    expect(result).toBeNull();
    expect(jest.mocked(getDoc)).not.toHaveBeenCalled();
  });

  it('returns null when the uid field is missing', async () => {
    jest.mocked(getDoc).mockResolvedValueOnce({
      exists: () => true,
      data: () => ({}),
    } as any);

    const result = await findUidByHandle('quietfox');

    expect(result).toBeNull();
  });

  it('returns null when the uid field is not a string', async () => {
    jest.mocked(getDoc).mockResolvedValueOnce({
      exists: () => true,
      data: () => ({ uid: 42 }),
    } as any);

    const result = await findUidByHandle('quietfox');

    expect(result).toBeNull();
  });

  it('returns null when the uid field is an empty string', async () => {
    jest.mocked(getDoc).mockResolvedValueOnce({
      exists: () => true,
      data: () => ({ uid: '' }),
    } as any);

    const result = await findUidByHandle('quietfox');

    expect(result).toBeNull();
  });
});
