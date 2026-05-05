import { ExpoConfig, ConfigContext } from 'expo/config';

// Fallbacks are Google's public sample AdMob app IDs from the official AdMob
// docs — safe to commit, used until real account IDs are wired via env vars.
const ADMOB_IOS_APP_ID =
  process.env.EXPO_PUBLIC_ADMOB_IOS_APP_ID ??
  'ca-app-pub-3940256099942544~1458002511';
const ADMOB_ANDROID_APP_ID =
  process.env.EXPO_PUBLIC_ADMOB_ANDROID_APP_ID ??
  'ca-app-pub-3940256099942544~3347511713';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  ios: {
    ...config.ios,
    bundleIdentifier:
      process.env.IOS_BUNDLE_IDENTIFIER ?? 'com.furugenisland.yomoyo',
  },
  android: {
    ...config.android,
    package:
      process.env.ANDROID_PACKAGE_NAME ?? 'com.furugenisland.yomoyo',
  },
  plugins: [
    ...(config.plugins ?? []),
    [
      'react-native-google-mobile-ads',
      {
        androidAppId: ADMOB_ANDROID_APP_ID,
        iosAppId: ADMOB_IOS_APP_ID,
      },
    ],
  ],
});
