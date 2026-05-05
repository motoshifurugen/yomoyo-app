import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from '@react-native-firebase/auth';
import type { AuthUser } from '@/types/auth';

type AuthState = {
  user: AuthUser | null;
  loading: boolean;
};

export function useAuth(): AuthState {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), (newUser) => {
      if (__DEV__) {
        // TEMP DIAGNOSTIC (Issue #43 follow-up): native auth uid as seen by
        // @react-native-firebase/auth. JS SDK Firestore does NOT see this.
        console.log('[FirebaseDiag] native auth uid =', newUser?.uid ?? null);
      }
      setUser(newUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return { user, loading };
}
