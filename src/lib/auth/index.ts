import { getAuth, signOut as firebaseSignOut } from '@react-native-firebase/auth';
import { signOutJsSdk } from './jsSdkBridge';

export async function signOut(): Promise<void> {
  // Sign out the JS SDK regardless of native outcome so that, on failure,
  // the app does not retain a stale JS SDK session that the rules would honor.
  const nativeResult = await Promise.allSettled([firebaseSignOut(getAuth())]);
  const jsResult = await Promise.allSettled([signOutJsSdk()]);
  const failure =
    nativeResult[0].status === 'rejected'
      ? nativeResult[0].reason
      : jsResult[0].status === 'rejected'
      ? jsResult[0].reason
      : null;
  if (failure) throw failure;
}

export { signInWithGoogle } from './google';
export { signInWithApple } from './apple';
