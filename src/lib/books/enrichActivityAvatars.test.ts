import { enrichActivityAvatars } from './enrichActivityAvatars';
import type { AvatarCache } from './enrichActivityAvatars';
import type { ReadingActivity } from './readingActivity';
import type { AnimalKey } from '@/lib/users/avatarIdentity';

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

const fakeIdentity = (animalKey: AnimalKey, displayName = 'Resolved Name') => ({
  animalKey,
  displayName,
  finalizedAt: null,
});

describe('enrichActivityAvatars', () => {
  it('overrides displayAvatar with the current identity even when it is already set', async () => {
    const items = [baseItem({ displayAvatar: 'eagle', displayName: 'Old Name' })];
    const getAvatar = jest.fn().mockResolvedValue(fakeIdentity('bear', 'Current Name'));
    const result = await enrichActivityAvatars(items, new Map() as AvatarCache, getAvatar);
    expect(result[0].displayAvatar).toBe('bear');
    expect(getAvatar).toHaveBeenCalledWith('u1');
  });

  it('overrides displayName with the current identity', async () => {
    const items = [baseItem({ displayName: 'Old Name', displayAvatar: 'eagle' })];
    const getAvatar = jest.fn().mockResolvedValue(fakeIdentity('bear', 'Current Name'));
    const result = await enrichActivityAvatars(items, new Map() as AvatarCache, getAvatar);
    expect(result[0].displayName).toBe('Current Name');
  });

  it('fills in displayAvatar when it is missing and the identity resolves', async () => {
    const items = [baseItem({ displayAvatar: null })];
    const getAvatar = jest.fn().mockResolvedValue(fakeIdentity('bear'));
    const result = await enrichActivityAvatars(items, new Map() as AvatarCache, getAvatar);
    expect(result[0].displayAvatar).toBe('bear');
  });

  it('dedupes lookups when multiple items share a userId', async () => {
    const items = [
      baseItem({ id: 'a1', userId: 'u1', displayAvatar: 'eagle' }),
      baseItem({ id: 'a2', userId: 'u1', displayAvatar: 'eagle' }),
    ];
    const getAvatar = jest.fn().mockResolvedValue(fakeIdentity('bear', 'New'));
    const result = await enrichActivityAvatars(items, new Map() as AvatarCache, getAvatar);
    expect(getAvatar).toHaveBeenCalledTimes(1);
    expect(result[0].displayAvatar).toBe('bear');
    expect(result[1].displayAvatar).toBe('bear');
    expect(result[0].displayName).toBe('New');
    expect(result[1].displayName).toBe('New');
  });

  it('uses the cache to skip already-resolved userIds', async () => {
    const cache: AvatarCache = new Map([
      ['u1', { animalKey: 'wolf', displayName: 'Cached Name' }],
    ]);
    const items = [baseItem({ displayAvatar: 'eagle', displayName: 'Stale' })];
    const getAvatar = jest.fn();
    const result = await enrichActivityAvatars(items, cache, getAvatar);
    expect(result[0].displayAvatar).toBe('wolf');
    expect(result[0].displayName).toBe('Cached Name');
    expect(getAvatar).not.toHaveBeenCalled();
  });

  it('writes a full identity snapshot to the cache per resolved userId', async () => {
    const cache: AvatarCache = new Map();
    const items = [baseItem({ displayAvatar: null })];
    const getAvatar = jest.fn().mockResolvedValue(fakeIdentity('bear', 'Resolved'));
    await enrichActivityAvatars(items, cache, getAvatar);
    expect(cache.get('u1')).toEqual({ animalKey: 'bear', displayName: 'Resolved' });
  });

  it('keeps the original item when the lookup fails', async () => {
    const items = [baseItem({ displayAvatar: 'eagle', displayName: 'Original' })];
    const getAvatar = jest.fn().mockRejectedValue(new Error('boom'));
    const result = await enrichActivityAvatars(items, new Map() as AvatarCache, getAvatar);
    expect(result[0].displayAvatar).toBe('eagle');
    expect(result[0].displayName).toBe('Original');
  });

  it('caches null for failed lookups so we do not retry within the same session', async () => {
    const cache: AvatarCache = new Map();
    const items = [baseItem({ displayAvatar: 'eagle' })];
    const getAvatar = jest.fn().mockRejectedValue(new Error('boom'));
    await enrichActivityAvatars(items, cache, getAvatar);
    expect(cache.has('u1')).toBe(true);
    expect(cache.get('u1')).toBeNull();
  });

  it('keeps the original item when the identity lookup returns null', async () => {
    const items = [baseItem({ displayAvatar: 'eagle', displayName: 'Original' })];
    const getAvatar = jest.fn().mockResolvedValue(null);
    const result = await enrichActivityAvatars(items, new Map() as AvatarCache, getAvatar);
    expect(result[0].displayAvatar).toBe('eagle');
    expect(result[0].displayName).toBe('Original');
  });

  it('does not mutate the input items', async () => {
    const original = baseItem({ displayAvatar: 'eagle', displayName: 'Original' });
    const items = [original];
    const getAvatar = jest.fn().mockResolvedValue(fakeIdentity('bear', 'New'));
    await enrichActivityAvatars(items, new Map() as AvatarCache, getAvatar);
    expect(original.displayAvatar).toBe('eagle');
    expect(original.displayName).toBe('Original');
  });

  it('returns an empty array when given an empty array', async () => {
    const getAvatar = jest.fn();
    const result = await enrichActivityAvatars([], new Map() as AvatarCache, getAvatar);
    expect(result).toEqual([]);
    expect(getAvatar).not.toHaveBeenCalled();
  });
});
