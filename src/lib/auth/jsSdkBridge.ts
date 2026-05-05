import {
  getAuth,
  signInWithCredential,
  signOut,
  GoogleAuthProvider,
  OAuthProvider,
} from 'firebase/auth';
import { firebaseApp } from '@/lib/firebase';

function getJsSdkAuth() {
  return getAuth(firebaseApp);
}

export async function bridgeGoogleCredential(idToken: string): Promise<void> {
  const credential = GoogleAuthProvider.credential(idToken);
  await signInWithCredential(getJsSdkAuth(), credential);
}

export async function bridgeAppleCredential(
  identityToken: string,
  rawNonce?: string,
): Promise<void> {
  const provider = new OAuthProvider('apple.com');
  const credential = provider.credential({ idToken: identityToken, rawNonce });
  await signInWithCredential(getJsSdkAuth(), credential);
}

export async function signOutJsSdk(): Promise<void> {
  await signOut(getJsSdkAuth());
}
