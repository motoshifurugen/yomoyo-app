import React from 'react';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import AdErrorBoundary from './AdErrorBoundary';

const TimelineBannerAd = React.memo(function TimelineBannerAd() {
  return (
    <AdErrorBoundary>
      <BannerAd unitId={TestIds.BANNER} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} />
    </AdErrorBoundary>
  );
});

export default TimelineBannerAd;
