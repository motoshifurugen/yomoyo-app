import { appleAuth } from '@invertase/react-native-apple-authentication';
import { bridgeAppleCredential } from './jsSdkBridge';

// iOS only — Apple Sign-In requires the Apple Developer entitlement to run.
//
// The Apple identity token is single-use: it may only be exchanged with Firebase
// once. We therefore exchange it ONLY on the Firebase JS SDK (which Firestore
// uses). The native OS flow (appleAuth.performRequest) just yields the token.
export async function signInWithApple(): Promise<void> {
  const { identityToken, nonce } = await appleAuth.performRequest({
    requestedOperation: appleAuth.Operation.LOGIN,
    requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
  });

  if (!identityToken) {
    throw new Error('Apple sign-in failed: no identity token');
  }

  await bridgeAppleCredential(identityToken, nonce);
}
