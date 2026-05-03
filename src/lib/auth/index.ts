import { getAuth, signOut as firebaseSignOut } from '@react-native-firebase/auth';

export async function signOut(): Promise<void> {
  await firebaseSignOut(getAuth());
}

export { signInWithGoogle } from './google';
export { signInWithApple } from './apple';
