import { getAuth, signInWithCredential, GoogleAuthProvider } from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

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
}
