import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { bridgeGoogleCredential } from './jsSdkBridge';

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
});

// The native OS flow (GoogleSignin.signIn) yields the idToken; the Firebase
// credential exchange happens ONLY on the JS SDK (which Firestore uses), so a
// single client owns the session. See src/lib/auth/apple.ts for the rationale.
export async function signInWithGoogle(): Promise<void> {
  const response = await GoogleSignin.signIn();

  if (response.type === 'cancelled') {
    throw new Error('Google sign-in cancelled');
  }

  const { idToken } = response.data;
  if (!idToken) {
    throw new Error('Google sign-in failed: no id token');
  }

  await bridgeGoogleCredential(idToken);
}
