import { ExpoConfig, ConfigContext } from 'expo/config';

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
});
