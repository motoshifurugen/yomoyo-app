import auth from '@react-native-firebase/auth';
import { appleAuth } from '@invertase/react-native-apple-authentication';

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

  const appleCredential = auth.AppleAuthProvider.credential(identityToken, nonce);
  await auth().signInWithCredential(appleCredential);
}
