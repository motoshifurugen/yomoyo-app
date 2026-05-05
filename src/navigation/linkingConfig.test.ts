import { getStateFromPath } from '@react-navigation/core';
import { linkingConfig } from './linkingConfig';

describe('linkingConfig — prefixes', () => {
  it('includes yomoyo:// as a prefix', () => {
    expect(linkingConfig.prefixes).toContain('yomoyo://');
  });
});

describe('linkingConfig — URL parsing', () => {
  it('routes user/:uid to the UserProfile screen', () => {
    const state = getStateFromPath('user/abc123', linkingConfig.config);
    const appRoute = state?.routes[0];
    expect(appRoute?.name).toBe('App');
  });

  it('places UserProfile in the App nested navigator', () => {
    const state = getStateFromPath('user/abc123', linkingConfig.config);
    const appRoute = state?.routes[0] as { state?: { routes: Array<{ name: string }> } };
    expect(appRoute?.state?.routes[0].name).toBe('UserProfile');
  });

  it('passes the uid segment as params.uid', () => {
    const state = getStateFromPath('user/abc123', linkingConfig.config);
    const appRoute = state?.routes[0] as {
      state?: { routes: Array<{ name: string; params?: Record<string, string> }> };
    };
    expect(appRoute?.state?.routes[0].params).toEqual({ uid: 'abc123' });
  });

  it('parses different uid values correctly', () => {
    const state = getStateFromPath('user/xyz-999', linkingConfig.config);
    const appRoute = state?.routes[0] as {
      state?: { routes: Array<{ params?: Record<string, string> }> };
    };
    expect(appRoute?.state?.routes[0].params?.uid).toBe('xyz-999');
  });

  it('returns undefined for an unrecognised path', () => {
    const state = getStateFromPath('unknown/path', linkingConfig.config);
    expect(state).toBeUndefined();
  });
});
