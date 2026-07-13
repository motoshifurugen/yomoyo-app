import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { followUser } from './follows';

/**
 * The app owner's account UID, read from the environment. Configured per
 * environment (dev/prod) via `EXPO_PUBLIC_ADMIN_UID`. Returns null when unset
 * or blank so callers can treat "no admin configured" as a safe no-op.
 */
export function getAdminUid(): string | null {
  const raw = process.env.EXPO_PUBLIC_ADMIN_UID;
  if (typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/**
 * Auto-follows the app's admin account so a brand-new user's timeline isn't
 * empty right after onboarding.
 *
 * One-directional (newUser -> admin): the new user sees the admin's reading
 * activity in their feed. This is a normal follow, so the user can unfollow the
 * admin later from the profile screen.
 *
 * Runs at most once per account. The `adminAutoFollowedAt` marker on the user
 * doc guarantees that a user who has already been auto-followed once — and may
 * have deliberately unfollowed since — is never silently re-followed, even if
 * they pass through onboarding again (e.g. via EXPO_PUBLIC_ALWAYS_SHOW_ONBOARDING).
 *
 * No-op when the admin UID is unset (not yet configured) or when it would be a
 * self-follow (the admin completing their own onboarding).
 */
export async function autoFollowAdmin(newUserUid: string): Promise<void> {
  const adminUid = getAdminUid();
  if (!adminUid) {
    if (__DEV__) console.warn('[autoFollowAdmin] EXPO_PUBLIC_ADMIN_UID is not set — skipping.');
    return;
  }
  if (adminUid === newUserUid) return;

  const db = getFirestore();
  const userRef = doc(db, 'users', newUserUid);
  const snap = await getDoc(userRef);
  if (snap.exists() && snap.data()?.adminAutoFollowedAt) return;

  await followUser(newUserUid, adminUid);
  await setDoc(userRef, { adminAutoFollowedAt: serverTimestamp() }, { merge: true });
}
