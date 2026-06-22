import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { jsSdkAuth } from '@/lib/firebase';
import type { AuthUser } from '@/types/auth';

type AuthState = {
  user: AuthUser | null;
  loading: boolean;
};

// Auth is owned entirely by the Firebase JS SDK (the same client Firestore uses),
// so observing it is the single source of truth for sign-in state.
export function useAuth(): AuthState {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(jsSdkAuth, (newUser) => {
      setUser(newUser);
      setReady(true);
    });
    return unsubscribe;
  }, []);

  return { user, loading: !ready };
}
