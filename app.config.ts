import { ExpoConfig, ConfigContext } from 'expo/config';

// Fallbacks are Google's public sample AdMob app IDs from the official AdMob
// docs — safe to commit, used until real account IDs are wired via env vars.
const ADMOB_IOS_APP_ID =
  process.env.EXPO_PUBLIC_ADMOB_IOS_APP_ID ??
  'ca-app-pub-3940256099942544~1458002511';
const ADMOB_ANDROID_APP_ID =
  process.env.EXPO_PUBLIC_ADMOB_ANDROID_APP_ID ??
  'ca-app-pub-3940256099942544~3347511713';

const APP_ENV = process.env.APP_ENV ?? 'development';
const IS_PROD = APP_ENV === 'production';
const GOOGLE_SERVICES_IOS = IS_PROD
  ? './GoogleService-Info.prod.plist'
  : './GoogleService-Info.dev.plist';
const GOOGLE_SERVICES_ANDROID = IS_PROD
  ? './google-services.prod.json'
  : './google-services.dev.json';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: config.name ?? 'Yomoyo',
  slug: config.slug ?? 'yomoyo',
  ios: {
    ...config.ios,
    bundleIdentifier:
      process.env.IOS_BUNDLE_IDENTIFIER ?? 'com.furugenisland.yomoyo',
    googleServicesFile: GOOGLE_SERVICES_IOS,
  },
  android: {
    ...config.android,
    package:
      process.env.ANDROID_PACKAGE_NAME ?? 'com.furugenisland.yomoyo',
    googleServicesFile: GOOGLE_SERVICES_ANDROID,
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
