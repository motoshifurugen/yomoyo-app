import { useState, useEffect } from 'react';
import {
  getAuth as getNativeAuth,
  onAuthStateChanged as nativeOnAuthStateChanged,
} from '@react-native-firebase/auth';
import { onAuthStateChanged as jsOnAuthStateChanged } from 'firebase/auth';
import { jsSdkAuth } from '@/lib/firebase';
import type { AuthUser } from '@/types/auth';

type AuthState = {
  user: AuthUser | null;
  loading: boolean;
};

export function useAuth(): AuthState {
  const [nativeUser, setNativeUser] = useState<AuthUser | null>(null);
  const [jsUser, setJsUser] = useState<unknown>(null);
  const [nativeReady, setNativeReady] = useState(false);
  const [jsReady, setJsReady] = useState(false);

  useEffect(() => {
    const unsubscribe = nativeOnAuthStateChanged(getNativeAuth(), (newUser) => {
      setNativeUser(newUser);
      setNativeReady(true);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const unsubscribe = jsOnAuthStateChanged(jsSdkAuth, (newUser) => {
      setJsUser(newUser);
      setJsReady(true);
    });
    return unsubscribe;
  }, []);

  // Firestore access goes through the JS SDK, so the app is only truly
  // authenticated once BOTH clients have a user. On a fresh sign-in the native
  // client resolves first while the JS SDK bridge is still pending; gating the
  // user on the JS SDK here makes navigation wait for the bridge so Firestore
  // queries never fire before request.auth is set (permission-denied race).
  // The native and JS uids are the same identity, so we surface the native user.
  const user = nativeUser && jsUser ? nativeUser : null;

  return { user, loading: !(nativeReady && jsReady) };
}
