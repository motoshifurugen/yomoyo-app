import {
  getAuth,
  signInWithCredential,
  signOut,
  AppleAuthProvider,
} from '@react-native-firebase/auth';
import { appleAuth } from '@invertase/react-native-apple-authentication';
import { bridgeAppleCredential } from './jsSdkBridge';

// iOS only — Apple Sign-In requires Apple Developer entitlement to run.
export async function signInWithApple(): Promise<void> {
  const appleAuthResponse = await appleAuth.performRequest({
    requestedOperation: appleAuth.Operation.LOGIN,
    requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
  });

  const { identityToken, nonce } = appleAuthResponse;
  if (!identityToken) {
    throw new Error('Apple sign-in failed: no identity token');
  }

  const credential = AppleAuthProvider.credential(identityToken, nonce);
  await signInWithCredential(getAuth(), credential);

  try {
    await bridgeAppleCredential(identityToken, nonce);
  } catch (err) {
    // Roll back native sign-in so the app never enters a partially signed-in
    // state where Firestore queries would fail with permission-denied.
    try {
      await signOut(getAuth());
    } catch {
      // Best-effort rollback. If sign-out also fails, the bridge error wins.
    }
    throw err;
  }
}
