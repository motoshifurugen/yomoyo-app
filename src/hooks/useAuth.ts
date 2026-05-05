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
  const [user, setUser] = useState<AuthUser | null>(null);
  const [nativeReady, setNativeReady] = useState(false);
  const [jsReady, setJsReady] = useState(false);

  useEffect(() => {
    const unsubscribe = nativeOnAuthStateChanged(getNativeAuth(), (newUser) => {
      if (__DEV__) {
        // TEMP DIAGNOSTIC (Issue #43 follow-up): native auth uid as seen by
        // @react-native-firebase/auth. JS SDK Firestore does NOT see this.
        console.log('[FirebaseDiag] native auth uid =', newUser?.uid ?? null);
      }
      setUser(newUser);
      setNativeReady(true);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const unsubscribe = jsOnAuthStateChanged(jsSdkAuth, () => {
      setJsReady(true);
    });
    return unsubscribe;
  }, []);

  return { user, loading: !(nativeReady && jsReady) };
}
