import React from 'react';
import { render, screen } from '@testing-library/react-native';
import TimelineBannerAd from './TimelineBannerAd';
import { TestIds } from 'react-native-google-mobile-ads';

describe('TimelineBannerAd', () => {
  it('renders the AdMob BannerAd with the test unit ID by default', () => {
    render(<TimelineBannerAd />);
    const banner = screen.getByTestId('timeline-banner-ad');
    expect(banner.props.unitId).toBe(TestIds.BANNER);
  });

  it('uses the adaptive banner size', () => {
    render(<TimelineBannerAd />);
    const banner = screen.getByTestId('timeline-banner-ad');
    expect(banner.props.size).toBe('ANCHORED_ADAPTIVE_BANNER');
  });
});
