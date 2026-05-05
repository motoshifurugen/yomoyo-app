import type { Firestore } from 'firebase-admin/firestore';
import {
  getFollowerUids,
  getEnabledPushTokens,
  resolveRecipients,
} from './recipients';

type FollowDoc = { followerId: string; followedUid: string };
type PushTokenDoc = { token: unknown; enabled: unknown };

interface FakeData {
  follows?: FollowDoc[];
  pushTokens?: Record<string, PushTokenDoc[]>;
}

function makeFakeFirestore(data: FakeData): Firestore {
  const follows = data.follows ?? [];
  const pushTokens = data.pushTokens ?? {};

  const fake = {
    collection(name: string) {
      if (name === 'follows') return makeFollowsRef(follows);
      if (name === 'users') return makeUsersRef(pushTokens);
      throw new Error(`Unexpected collection: ${name}`);
    },
  };
  return fake as unknown as Firestore;
}

function makeFollowsRef(docs: FollowDoc[]) {
  return {
    where(field: string, op: string, val: unknown) {
      if (field !== 'followedUid' || op !== '==') {
        throw new Error(`Unexpected where clause: ${field} ${op} ${String(val)}`);
      }
      const matched = docs.filter((d) => d.followedUid === val);
      return {
        async get() {
          return {
            docs: matched.map((d) => ({
              get(f: string) {
                return (d as Record<string, unknown>)[f];
              },
            })),
          };
        },
      };
    },
  };
}

function makeUsersRef(pushTokens: Record<string, PushTokenDoc[]>) {
  return {
    doc(uid: string) {
      return {
        collection(name: string) {
          if (name !== 'pushTokens') {
            throw new Error(`Unexpected subcollection: ${name}`);
          }
          const docs = pushTokens[uid] ?? [];
          return {
            async get() {
              return {
                empty: docs.length === 0,
                docs: docs.map((d) => ({
                  get(f: string) {
                    return (d as Record<string, unknown>)[f];
                  },
                })),
              };
            },
          };
        },
      };
    },
  };
}

describe('getFollowerUids', () => {
  it('returns empty array when source has no followers', async () => {
    const db = makeFakeFirestore({ follows: [] });
    const result = await getFollowerUids(db, 'X');
    expect(result).toEqual([]);
  });

  it('returns the single follower id', async () => {
    const db = makeFakeFirestore({
      follows: [{ followerId: 'A', followedUid: 'X' }],
    });
    const result = await getFollowerUids(db, 'X');
    expect(result).toEqual(['A']);
  });

  it('returns all distinct follower ids and excludes unrelated follows', async () => {
    const db = makeFakeFirestore({
      follows: [
        { followerId: 'A', followedUid: 'X' },
        { followerId: 'B', followedUid: 'X' },
        { followerId: 'C', followedUid: 'Y' },
      ],
    });
    const result = await getFollowerUids(db, 'X');
    expect([...result].sort()).toEqual(['A', 'B']);
  });

  it('dedupes follower ids if duplicates appear in raw docs', async () => {
    const db = makeFakeFirestore({
      follows: [
        { followerId: 'A', followedUid: 'X' },
        { followerId: 'A', followedUid: 'X' },
      ],
    });
    const result = await getFollowerUids(db, 'X');
    expect(result).toEqual(['A']);
  });
});

describe('getEnabledPushTokens', () => {
  it('returns empty array for empty uid list', async () => {
    const db = makeFakeFirestore({});
    const result = await getEnabledPushTokens(db, []);
    expect(result).toEqual([]);
  });

  it('skips users with no tokens at all', async () => {
    const db = makeFakeFirestore({ pushTokens: { A: [] } });
    const result = await getEnabledPushTokens(db, ['A']);
    expect(result).toEqual([]);
  });

  it('skips disabled tokens', async () => {
    const db = makeFakeFirestore({
      pushTokens: { A: [{ token: 't1', enabled: false }] },
    });
    const result = await getEnabledPushTokens(db, ['A']);
    expect(result).toEqual([]);
  });

  it('returns all enabled tokens for a single user', async () => {
    const db = makeFakeFirestore({
      pushTokens: {
        A: [
          { token: 't1', enabled: true },
          { token: 't2', enabled: false },
          { token: 't3', enabled: true },
        ],
      },
    });
    const result = await getEnabledPushTokens(db, ['A']);
    expect(result).toEqual([
      { uid: 'A', token: 't1' },
      { uid: 'A', token: 't3' },
    ]);
  });

  it('flattens enabled tokens across multiple users in input order', async () => {
    const db = makeFakeFirestore({
      pushTokens: {
        A: [{ token: 't1', enabled: true }],
        B: [{ token: 't2', enabled: true }],
      },
    });
    const result = await getEnabledPushTokens(db, ['A', 'B']);
    expect(result).toEqual([
      { uid: 'A', token: 't1' },
      { uid: 'B', token: 't2' },
    ]);
  });

  it('dedupes the same token across users — first uid wins', async () => {
    const db = makeFakeFirestore({
      pushTokens: {
        A: [{ token: 'shared', enabled: true }],
        B: [{ token: 'shared', enabled: true }],
      },
    });
    const result = await getEnabledPushTokens(db, ['A', 'B']);
    expect(result).toEqual([{ uid: 'A', token: 'shared' }]);
  });

  it('skips tokens with non-string or empty values', async () => {
    const db = makeFakeFirestore({
      pushTokens: {
        A: [
          { token: '', enabled: true },
          { token: null, enabled: true },
          { token: 't1', enabled: true },
        ],
      },
    });
    const result = await getEnabledPushTokens(db, ['A']);
    expect(result).toEqual([{ uid: 'A', token: 't1' }]);
  });
});

describe('resolveRecipients', () => {
  it('returns empty array when source has no followers', async () => {
    const db = makeFakeFirestore({ follows: [] });
    const result = await resolveRecipients(db, 'X');
    expect(result).toEqual([]);
  });

  it('returns empty array when followers exist but have no enabled tokens', async () => {
    const db = makeFakeFirestore({
      follows: [{ followerId: 'A', followedUid: 'X' }],
      pushTokens: { A: [{ token: 't1', enabled: false }] },
    });
    const result = await resolveRecipients(db, 'X');
    expect(result).toEqual([]);
  });

  it("returns the flat (uid, token) list for the source's followers", async () => {
    const db = makeFakeFirestore({
      follows: [
        { followerId: 'A', followedUid: 'X' },
        { followerId: 'B', followedUid: 'X' },
      ],
      pushTokens: {
        A: [{ token: 't1', enabled: true }],
        B: [{ token: 't2', enabled: true }],
      },
    });
    const result = await resolveRecipients(db, 'X');
    const sorted = [...result].sort((a, b) => a.token.localeCompare(b.token));
    expect(sorted).toEqual([
      { uid: 'A', token: 't1' },
      { uid: 'B', token: 't2' },
    ]);
  });

  it('dedupes a token shared by two followers', async () => {
    const db = makeFakeFirestore({
      follows: [
        { followerId: 'A', followedUid: 'X' },
        { followerId: 'B', followedUid: 'X' },
      ],
      pushTokens: {
        A: [{ token: 'shared', enabled: true }],
        B: [{ token: 'shared', enabled: true }],
      },
    });
    const result = await resolveRecipients(db, 'X');
    expect(result).toHaveLength(1);
    expect(result[0].token).toBe('shared');
  });
});
