import { TestIds } from 'react-native-google-mobile-ads';

describe('bannerAdUnitId', () => {
  const originalDev = (global as { __DEV__?: boolean }).__DEV__;

  afterEach(() => {
    (global as { __DEV__?: boolean }).__DEV__ = originalDev;
    jest.resetModules();
  });

  it('falls back to the test unit ID in development builds', () => {
    (global as { __DEV__?: boolean }).__DEV__ = true;
    jest.isolateModules(() => {
      const { bannerAdUnitId } = require('./adUnitIds');
      expect(bannerAdUnitId).toBe(TestIds.BANNER);
    });
  });

  it('uses the real platform ad unit ID in release builds', () => {
    (global as { __DEV__?: boolean }).__DEV__ = false;
    jest.isolateModules(() => {
      const { bannerAdUnitId } = require('./adUnitIds');
      // Default jest Platform.OS is 'ios'.
      expect(bannerAdUnitId).toBe('ca-app-pub-2350284268903026/2835928775');
    });
  });
});
