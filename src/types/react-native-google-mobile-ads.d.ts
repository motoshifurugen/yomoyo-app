declare module 'react-native-google-mobile-ads' {
  import type * as React from 'react';

  export type BannerAdSizeValue =
    | 'ANCHORED_ADAPTIVE_BANNER'
    | 'BANNER'
    | 'LARGE_BANNER'
    | 'MEDIUM_RECTANGLE';

  export const BannerAdSize: {
    ANCHORED_ADAPTIVE_BANNER: 'ANCHORED_ADAPTIVE_BANNER';
    BANNER: 'BANNER';
    LARGE_BANNER: 'LARGE_BANNER';
    MEDIUM_RECTANGLE: 'MEDIUM_RECTANGLE';
  };

  export const TestIds: {
    BANNER: string;
    INTERSTITIAL: string;
    REWARDED: string;
  };

  export interface BannerAdProps {
    unitId: string;
    size: BannerAdSizeValue;
  }

  export const BannerAd: React.ComponentType<BannerAdProps>;

  export interface MobileAdsInstance {
    initialize: () => Promise<unknown>;
    setRequestConfiguration: (config: Record<string, unknown>) => Promise<unknown>;
  }

  const mobileAds: () => MobileAdsInstance;
  export default mobileAds;
}
