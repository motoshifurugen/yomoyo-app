import { signOutJsSdk } from './jsSdkBridge';

// Auth lives entirely on the Firebase JS SDK (see google.ts / apple.ts), so
// signing out is a single JS SDK operation.
export async function signOut(): Promise<void> {
  await signOutJsSdk();
}

export { signInWithGoogle } from './google';
export { signInWithApple } from './apple';
