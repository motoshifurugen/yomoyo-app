export { getAuth } from '@react-native-firebase/auth';

import { initializeApp, getApps } from 'firebase/app';
// `getReactNativePersistence` is exported at runtime from firebase/auth's
// React Native build (selected by Metro via the package's `react-native`
// field) but is missing from the public type declarations. A single ES
// import keeps Metro from loading two module instances — important because
// only the loaded instance registers the auth Component with FirebaseApp.
// @ts-expect-error: getReactNativePersistence is untyped in firebase v10
import { initializeAuth, onAuthStateChanged, getReactNativePersistence } from 'firebase/auth';
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
  persistence: getReactNativePersistence(AsyncStorage),
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
