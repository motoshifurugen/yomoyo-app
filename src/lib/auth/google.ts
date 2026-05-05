import {
  getAuth,
  signInWithCredential,
  signOut,
  GoogleAuthProvider,
} from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { bridgeGoogleCredential } from './jsSdkBridge';

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
});

export async function signInWithGoogle(): Promise<void> {
  const response = await GoogleSignin.signIn();

  if (response.type === 'cancelled') {
    throw new Error('Google sign-in cancelled');
  }

  const { idToken } = response.data;
  if (!idToken) {
    throw new Error('Google sign-in failed: no id token');
  }

  const credential = GoogleAuthProvider.credential(idToken);
  await signInWithCredential(getAuth(), credential);

  try {
    await bridgeGoogleCredential(idToken);
  } catch (err) {
    // Roll back native sign-in so the app never enters a partially signed-in
    // state where Firestore queries would fail with permission-denied.
    try {
      await signOut(getAuth());
    } catch {
      // Best-effort rollback. If sign-out also fails, the native error wins.
    }
    throw err;
  }
}
