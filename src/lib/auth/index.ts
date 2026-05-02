import auth from '@react-native-firebase/auth';

export async function signOut(): Promise<void> {
  await auth().signOut();
}

export { signInWithGoogle } from './google';
export { signInWithApple } from './apple';
