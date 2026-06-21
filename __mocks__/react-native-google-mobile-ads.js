const React = require('react');
const { View } = require('react-native');

const initialize = jest.fn(() => Promise.resolve([{}]));
const instance = {
  initialize,
  setRequestConfiguration: jest.fn(() => Promise.resolve()),
};
const mobileAds = jest.fn(() => instance);

const BannerAd = ({ unitId, size, requestOptions }) =>
  React.createElement(View, { testID: 'timeline-banner-ad', unitId, size, requestOptions });

const BannerAdSize = {
  ANCHORED_ADAPTIVE_BANNER: 'ANCHORED_ADAPTIVE_BANNER',
  BANNER: 'BANNER',
  LARGE_BANNER: 'LARGE_BANNER',
  MEDIUM_RECTANGLE: 'MEDIUM_RECTANGLE',
};

const TestIds = {
  BANNER: 'ca-app-pub-3940256099942544/6300978111',
  INTERSTITIAL: 'ca-app-pub-3940256099942544/1033173712',
  REWARDED: 'ca-app-pub-3940256099942544/5224354917',
};

const AdsConsentStatus = {
  UNKNOWN: 'UNKNOWN',
  REQUIRED: 'REQUIRED',
  NOT_REQUIRED: 'NOT_REQUIRED',
  OBTAINED: 'OBTAINED',
};

const AdsConsent = {
  requestInfoUpdate: jest.fn(() => Promise.resolve({ status: 'NOT_REQUIRED' })),
  loadAndShowConsentFormIfRequired: jest.fn(() =>
    Promise.resolve({ status: 'NOT_REQUIRED' }),
  ),
  getConsentInfo: jest.fn(() =>
    Promise.resolve({ status: 'NOT_REQUIRED', canRequestAds: true }),
  ),
  getPurposeConsents: jest.fn(() => Promise.resolve('')),
};

module.exports = {
  __esModule: true,
  default: mobileAds,
  BannerAd,
  BannerAdSize,
  TestIds,
  AdsConsentStatus,
  AdsConsent,
};
