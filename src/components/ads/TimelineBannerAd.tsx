import React from 'react';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { bannerAdUnitId } from '@/lib/ads/adUnitIds';
import { useAdConsent } from '@/lib/ads/AdConsentContext';
import AdErrorBoundary from './AdErrorBoundary';

const TimelineBannerAd = React.memo(function TimelineBannerAd() {
  const { requestNonPersonalizedAdsOnly } = useAdConsent();
  return (
    <AdErrorBoundary>
      <BannerAd
        unitId={bannerAdUnitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly }}
      />
    </AdErrorBoundary>
  );
});

export default TimelineBannerAd;
