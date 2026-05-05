export { getAuth } from '@react-native-firebase/auth';

import { initializeApp, getApps } from 'firebase/app';
import { initializeAuth, onAuthStateChanged } from 'firebase/auth';
// `getReactNativePersistence` is exported at runtime by firebase v10 but is
// missing from the public type declarations. Pull it via the module object and
// retype it locally so callers stay typed.
// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any
const firebaseAuthModule = require('firebase/auth') as any;
const getReactNativePersistence = firebaseAuthModule.getReactNativePersistence as (
  storage: unknown,
) => unknown;
import AsyncStorage from '@react-native-async-storage/async-storage';

// Values from GoogleService-Info.plist / google-services.json.
// Add these to your .env file (EXPO_PUBLIC_* vars are safe to commit to .env.example).
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

export const firebaseApp =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firebase JS SDK auth with React Native persistence so that
// `firebase/firestore` rule evaluation sees `request.auth` after sign-in
// AND across app restarts. The two clients (RNFB native + JS SDK) are bridged
// at sign-in/sign-out (see src/lib/auth/jsSdkBridge.ts).
export const jsSdkAuth = initializeAuth(firebaseApp, {
  persistence: getReactNativePersistence(AsyncStorage) as never,
});

if (__DEV__) {
  // TEMP DIAGNOSTIC (Issue #43 follow-up): verify which Firestore project
  // the JS SDK is actually talking to at runtime.
  console.log(
    '[FirebaseDiag] JS SDK projectId =',
    firebaseApp?.options?.projectId,
  );
  // TEMP DIAGNOSTIC (Issue #43 follow-up): JS SDK auth uid as it changes.
  // Should match the [FirebaseDiag] native auth uid log after the bridge runs.
  onAuthStateChanged(jsSdkAuth, (jsUser) => {
    console.log('[FirebaseDiag] JS SDK auth uid =', jsUser?.uid ?? null);
  });
}
