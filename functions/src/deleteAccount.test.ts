import type { Auth } from 'firebase-admin/auth';
import type { Firestore } from 'firebase-admin/firestore';
import { deleteUserData } from './deleteAccount';

type FakeDoc = { id: string; data: Record<string, unknown> };

interface FakeRef {
  id: string;
}

function makeFake(opts: { activities?: FakeDoc[]; follows?: FakeDoc[] }) {
  const activities = opts.activities ?? [];
  const follows = opts.follows ?? [];

  const updated: Array<{ id: string; data: Record<string, unknown> }> = [];
  const deleted: string[] = [];
  const recursiveDeleted: string[] = [];

  const makeQuery = (docs: FakeDoc[]) => ({
    async get() {
      return {
        empty: docs.length === 0,
        size: docs.length,
        docs: docs.map((d) => ({
          id: d.id,
          ref: { id: d.id } as FakeRef,
          get: (field: string) => d.data[field],
        })),
      };
    },
  });

  const collection = (name: string) => ({
    where(field: string, op: string, val: unknown) {
      if (op !== '==') throw new Error(`Unexpected op: ${op}`);
      if (name === 'readingActivities') {
        return makeQuery(activities.filter((d) => d.data[field] === val));
      }
      if (name === 'follows') {
        return makeQuery(follows.filter((d) => d.data[field] === val));
      }
      throw new Error(`Unexpected where on ${name}`);
    },
    doc(id: string): FakeRef {
      return { id };
    },
  });

  const batch = () => ({
    update(ref: FakeRef, data: Record<string, unknown>) {
      updated.push({ id: ref.id, data });
    },
    delete(ref: FakeRef) {
      deleted.push(ref.id);
    },
    async commit() {
      /* no-op */
    },
  });

  const db = {
    collection,
    batch,
    async recursiveDelete(ref: FakeRef) {
      recursiveDeleted.push(ref.id);
    },
  } as unknown as Firestore;

  return { db, updated, deleted, recursiveDeleted };
}

function makeFakeAuth() {
  const deletedUsers: string[] = [];
  const auth = {
    async deleteUser(uid: string) {
      deletedUsers.push(uid);
    },
  } as unknown as Auth;
  return { auth, deletedUsers };
}

const UID = 'user-1';

describe('deleteUserData', () => {
  it('anonymizes the user reading activities instead of deleting them', async () => {
    const { db, updated, deleted } = makeFake({
      activities: [
        { id: `${UID}_book-a`, data: { userId: UID, displayName: 'Foxy', displayAvatar: 'fox' } },
        { id: `${UID}_book-b`, data: { userId: UID, displayName: 'Foxy', displayAvatar: 'fox' } },
      ],
    });
    const { auth } = makeFakeAuth();

    await deleteUserData(db, auth, UID);

    // Activities are updated, never deleted, so bookmark references survive.
    expect(deleted).not.toContain(`${UID}_book-a`);
    expect(updated).toHaveLength(2);
    for (const u of updated) {
      expect(u.data.authorDeleted).toBe(true);
      expect(u.data.displayAvatar).toBeNull();
      expect(u.data.displayName).toBe('');
      expect(u.data.displayLabel).toBe('');
    }
  });

  it('deletes follow edges in both directions, deduplicated', async () => {
    const { db, deleted } = makeFake({
      follows: [
        { id: 'f1', data: { followerId: UID, followedUid: 'other-1' } },
        { id: 'f2', data: { followerId: 'other-2', followedUid: UID } },
      ],
    });
    const { auth } = makeFakeAuth();

    const result = await deleteUserData(db, auth, UID);

    expect(deleted).toEqual(expect.arrayContaining(['f1', 'f2']));
    expect(result.followsDeleted).toBe(2);
  });

  it('does not double-delete a follow doc matched by both queries', async () => {
    // Pathological self-follow: same doc returned by both where() queries.
    const { db, deleted } = makeFake({
      follows: [{ id: 'self', data: { followerId: UID, followedUid: UID } }],
    });
    const { auth } = makeFakeAuth();

    const result = await deleteUserData(db, auth, UID);

    expect(deleted).toEqual(['self']);
    expect(result.followsDeleted).toBe(1);
  });

  it('recursively deletes the user document and its subcollections', async () => {
    const { db, recursiveDeleted } = makeFake({});
    const { auth } = makeFakeAuth();

    await deleteUserData(db, auth, UID);

    expect(recursiveDeleted).toContain(UID);
  });

  it('deletes the firebase auth user', async () => {
    const { db } = makeFake({});
    const { auth, deletedUsers } = makeFakeAuth();

    await deleteUserData(db, auth, UID);

    expect(deletedUsers).toEqual([UID]);
  });

  it('tolerates an already-deleted auth user on retry', async () => {
    const { db } = makeFake({});
    const auth = {
      async deleteUser() {
        throw Object.assign(new Error('not found'), {
          code: 'auth/user-not-found',
        });
      },
    } as unknown as Auth;

    await expect(deleteUserData(db, auth, UID)).resolves.toEqual({
      followsDeleted: 0,
      activitiesAnonymized: 0,
    });
  });

  it('propagates unexpected auth deletion errors', async () => {
    const { db } = makeFake({});
    const auth = {
      async deleteUser() {
        throw Object.assign(new Error('boom'), { code: 'auth/internal-error' });
      },
    } as unknown as Auth;

    await expect(deleteUserData(db, auth, UID)).rejects.toThrow('boom');
  });

  it('returns zero counts when the user has no data', async () => {
    const { db } = makeFake({});
    const { auth } = makeFakeAuth();

    const result = await deleteUserData(db, auth, UID);

    expect(result).toEqual({ followsDeleted: 0, activitiesAnonymized: 0 });
  });
});
