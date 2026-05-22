import type { ReadingActivity } from './readingActivity';
import type { AnimalKey, AvatarIdentity } from '@/lib/users/avatarIdentity';

export type IdentitySnapshot = {
  animalKey: AnimalKey;
  displayName: string;
};

export type AvatarCache = Map<string, IdentitySnapshot | null>;

type GetAvatarIdentity = (userId: string) => Promise<AvatarIdentity | null>;

export async function enrichActivityAvatars(
  items: ReadingActivity[],
  cache: AvatarCache,
  getAvatarIdentity: GetAvatarIdentity,
): Promise<ReadingActivity[]> {
  if (items.length === 0) return items;

  const missingUserIds = new Set<string>();
  for (const item of items) {
    if (!cache.has(item.userId)) {
      missingUserIds.add(item.userId);
    }
  }

  if (missingUserIds.size > 0) {
    await Promise.all(
      Array.from(missingUserIds).map(async (userId) => {
        try {
          const identity = await getAvatarIdentity(userId);
          cache.set(
            userId,
            identity
              ? { animalKey: identity.animalKey, displayName: identity.displayName }
              : null,
          );
        } catch {
          cache.set(userId, null);
        }
      }),
    );
  }

  return items.map((item) => {
    const resolved = cache.get(item.userId) ?? null;
    if (resolved === null) return item;
    return {
      ...item,
      displayAvatar: resolved.animalKey,
      displayName: resolved.displayName,
    };
  });
}
