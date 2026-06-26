import { httpsCallable } from 'firebase/functions';
import { jsSdkFunctions } from '@/lib/firebase';
import { signOut } from '@/lib/auth';
import { clearBoundProvider } from '@/lib/auth/deviceAccount';

// Permanently deletes the signed-in user's account.
//
// The actual deletion (Firestore data + Firebase Auth user) runs server-side in
// the `deleteAccount` callable so it can remove data the client has no
// permission to touch (e.g. other users' follow edges) without re-authentication.
//
// Once the callable resolves the account is already gone, so it is the source of
// truth: if it throws, the user stays signed in and can retry. Local teardown
// (sign-out + clearing the one-account-per-device binding) runs only after that
// success and is best-effort — a teardown failure must NOT be reported as a
// failed deletion, or the user would retry against an already-deleted account
// and could be left with a stale device binding that blocks the next sign-in.
export async function deleteAccount(): Promise<void> {
  const callable = httpsCallable(jsSdkFunctions, 'deleteAccount');
  await callable();

  await teardownLocalSession();
}

async function teardownLocalSession(): Promise<void> {
  const results = await Promise.allSettled([signOut(), clearBoundProvider()]);
  for (const result of results) {
    if (result.status === 'rejected') {
      console.error('[deleteAccount] local teardown step failed', result.reason);
    }
  }
}
