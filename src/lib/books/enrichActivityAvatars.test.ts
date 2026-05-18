import { enrichActivityAvatars } from './enrichActivityAvatars';
import type { ReadingActivity } from './readingActivity';
import type { AnimalKey } from '@/lib/users/avatarIdentity';

type AvatarCache = Map<string, AnimalKey | null>;

const baseItem = (overrides: Partial<ReadingActivity>): ReadingActivity => ({
  id: 'a1',
  userId: 'u1',
  bookId: 'b1',
  title: 'Book',
  authors: ['Author'],
  thumbnail: null,
  status: 'finished',
  finishedAt: null,
  displayName: 'Alice',
  displayAvatar: null,
  ...overrides,
});

const fakeIdentity = (animalKey: AnimalKey) => ({
  animalKey,
  displayName: 'Whatever',
  finalizedAt: null,
});

describe('enrichActivityAvatars', () => {
  it('returns items unchanged when displayAvatar is already set', async () => {
    const items = [baseItem({ displayAvatar: 'fox' })];
    const getAvatar = jest.fn();
    const result = await enrichActivityAvatars(items, new Map() as AvatarCache, getAvatar);
    expect(result[0].displayAvatar).toBe('fox');
    expect(getAvatar).not.toHaveBeenCalled();
  });

  it('looks up the avatar when displayAvatar is missing', async () => {
    const items = [baseItem({ displayAvatar: null })];
    const getAvatar = jest.fn().mockResolvedValue(fakeIdentity('bear'));
    const result = await enrichActivityAvatars(items, new Map() as AvatarCache, getAvatar);
    expect(result[0].displayAvatar).toBe('bear');
    expect(getAvatar).toHaveBeenCalledWith('u1');
  });

  it('dedupes lookups when multiple items share a userId', async () => {
    const items = [
      baseItem({ id: 'a1', userId: 'u1', displayAvatar: null }),
      baseItem({ id: 'a2', userId: 'u1', displayAvatar: null }),
    ];
    const getAvatar = jest.fn().mockResolvedValue(fakeIdentity('bear'));
    const result = await enrichActivityAvatars(items, new Map() as AvatarCache, getAvatar);
    expect(getAvatar).toHaveBeenCalledTimes(1);
    expect(result[0].displayAvatar).toBe('bear');
    expect(result[1].displayAvatar).toBe('bear');
  });

  it('uses cache to skip already-resolved userIds', async () => {
    const cache: AvatarCache = new Map([['u1', 'wolf' as AnimalKey]]);
    const items = [baseItem({ displayAvatar: null })];
    const getAvatar = jest.fn();
    const result = await enrichActivityAvatars(items, cache, getAvatar);
    expect(result[0].displayAvatar).toBe('wolf');
    expect(getAvatar).not.toHaveBeenCalled();
  });

  it('writes a cache entry per resolved userId so later calls can reuse it', async () => {
    const cache: AvatarCache = new Map();
    const items = [baseItem({ displayAvatar: null })];
    const getAvatar = jest.fn().mockResolvedValue(fakeIdentity('bear'));
    await enrichActivityAvatars(items, cache, getAvatar);
    expect(cache.get('u1')).toBe('bear');
  });

  it('keeps displayAvatar as null when lookup fails', async () => {
    const items = [baseItem({ displayAvatar: null })];
    const getAvatar = jest.fn().mockRejectedValue(new Error('boom'));
    const result = await enrichActivityAvatars(items, new Map() as AvatarCache, getAvatar);
    expect(result[0].displayAvatar).toBeNull();
  });

  it('caches null for failed lookups so we do not retry within the same session', async () => {
    const cache: AvatarCache = new Map();
    const items = [baseItem({ displayAvatar: null })];
    const getAvatar = jest.fn().mockRejectedValue(new Error('boom'));
    await enrichActivityAvatars(items, cache, getAvatar);
    expect(cache.has('u1')).toBe(true);
    expect(cache.get('u1')).toBeNull();
  });

  it('keeps displayAvatar as null when lookup returns null (no identity yet)', async () => {
    const items = [baseItem({ displayAvatar: null })];
    const getAvatar = jest.fn().mockResolvedValue(null);
    const result = await enrichActivityAvatars(items, new Map() as AvatarCache, getAvatar);
    expect(result[0].displayAvatar).toBeNull();
  });

  it('returns the original items reference shape (does not mutate inputs)', async () => {
    const original = baseItem({ displayAvatar: null });
    const items = [original];
    const getAvatar = jest.fn().mockResolvedValue(fakeIdentity('bear'));
    await enrichActivityAvatars(items, new Map() as AvatarCache, getAvatar);
    expect(original.displayAvatar).toBeNull();
  });

  it('returns an empty array when given an empty array', async () => {
    const getAvatar = jest.fn();
    const result = await enrichActivityAvatars([], new Map() as AvatarCache, getAvatar);
    expect(result).toEqual([]);
    expect(getAvatar).not.toHaveBeenCalled();
  });
});
