import { Platform } from 'react-native';
import { TestIds } from 'react-native-google-mobile-ads';

// Real AdMob banner ad unit IDs, selected per platform. Release builds serve
// these; debug builds must not serve live ads (AdMob policy), so `__DEV__`
// always falls back to Google's test unit.
const PROD_BANNER_AD_UNIT_ID = Platform.select({
  ios: 'ca-app-pub-2350284268903026/2835928775',
  android: 'ca-app-pub-2350284268903026/6104214236',
});

export const bannerAdUnitId =
  __DEV__ || !PROD_BANNER_AD_UNIT_ID ? TestIds.BANNER : PROD_BANNER_AD_UNIT_ID;
