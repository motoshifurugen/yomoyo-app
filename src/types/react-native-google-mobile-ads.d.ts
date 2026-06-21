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

  export interface BannerAdRequestOptions {
    requestNonPersonalizedAdsOnly?: boolean;
  }

  export interface BannerAdProps {
    unitId: string;
    size: BannerAdSizeValue;
    requestOptions?: BannerAdRequestOptions;
  }

  export const BannerAd: React.ComponentType<BannerAdProps>;

  export interface MobileAdsInstance {
    initialize: () => Promise<unknown>;
    setRequestConfiguration: (config: Record<string, unknown>) => Promise<unknown>;
  }

  const mobileAds: () => MobileAdsInstance;
  export default mobileAds;

  export type AdsConsentStatusValue = 'UNKNOWN' | 'REQUIRED' | 'NOT_REQUIRED' | 'OBTAINED';

  export const AdsConsentStatus: {
    UNKNOWN: 'UNKNOWN';
    REQUIRED: 'REQUIRED';
    NOT_REQUIRED: 'NOT_REQUIRED';
    OBTAINED: 'OBTAINED';
  };

  export interface AdsConsentInfo {
    status: AdsConsentStatusValue;
    canRequestAds?: boolean;
  }

  export const AdsConsent: {
    requestInfoUpdate: (options?: Record<string, unknown>) => Promise<AdsConsentInfo>;
    loadAndShowConsentFormIfRequired: () => Promise<AdsConsentInfo>;
    getConsentInfo: () => Promise<AdsConsentInfo>;
    getPurposeConsents: () => Promise<string>;
  };
}
