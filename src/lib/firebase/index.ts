export { getAuth } from '@react-native-firebase/auth';

import { initializeApp, getApps } from 'firebase/app';

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

if (__DEV__) {
  // TEMP DIAGNOSTIC (Issue #43 follow-up): verify which Firestore project
  // the JS SDK is actually talking to at runtime.
  console.log(
    '[FirebaseDiag] JS SDK projectId =',
    firebaseApp?.options?.projectId,
  );
}
