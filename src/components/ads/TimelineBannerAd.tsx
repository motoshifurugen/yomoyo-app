import React from 'react';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { bannerAdUnitId } from '@/lib/ads/adUnitIds';
import AdErrorBoundary from './AdErrorBoundary';

const TimelineBannerAd = React.memo(function TimelineBannerAd() {
  return (
    <AdErrorBoundary>
      <BannerAd unitId={bannerAdUnitId} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} />
    </AdErrorBoundary>
  );
});

export default TimelineBannerAd;
