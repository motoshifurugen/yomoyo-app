import {
  DEV_PROJECT_ID,
  PROD_PROJECT_ID,
  debugCallablesAllowed,
  resolveProjectId,
} from './debugGuard';

describe('resolveProjectId', () => {
  it('prefers GCLOUD_PROJECT', () => {
    expect(resolveProjectId({ GCLOUD_PROJECT: 'a', GOOGLE_CLOUD_PROJECT: 'b' })).toBe('a');
  });

  it('falls back to GOOGLE_CLOUD_PROJECT', () => {
    expect(resolveProjectId({ GOOGLE_CLOUD_PROJECT: 'b' })).toBe('b');
  });

  it('falls back to FIREBASE_CONFIG.projectId', () => {
    expect(resolveProjectId({ FIREBASE_CONFIG: JSON.stringify({ projectId: 'c' }) })).toBe('c');
  });

  it('returns undefined for broken FIREBASE_CONFIG', () => {
    expect(resolveProjectId({ FIREBASE_CONFIG: '{not json' })).toBeUndefined();
  });

  it('returns undefined when nothing is set', () => {
    expect(resolveProjectId({})).toBeUndefined();
  });
});

describe('debugCallablesAllowed', () => {
  it('allows the dev project', () => {
    expect(debugCallablesAllowed({ GCLOUD_PROJECT: DEV_PROJECT_ID })).toBe(true);
  });

  it('refuses the prod project', () => {
    expect(debugCallablesAllowed({ GCLOUD_PROJECT: PROD_PROJECT_ID })).toBe(false);
  });

  it('refuses prod even with ENABLE_DEBUG_FUNCTIONS=true', () => {
    expect(
      debugCallablesAllowed({
        GCLOUD_PROJECT: PROD_PROJECT_ID,
        ENABLE_DEBUG_FUNCTIONS: 'true',
      }),
    ).toBe(false);
  });

  it('refuses prod even in the emulator', () => {
    expect(
      debugCallablesAllowed({
        GCLOUD_PROJECT: PROD_PROJECT_ID,
        FUNCTIONS_EMULATOR: 'true',
      }),
    ).toBe(false);
  });

  it('refuses prod resolved from FIREBASE_CONFIG', () => {
    expect(
      debugCallablesAllowed({
        FIREBASE_CONFIG: JSON.stringify({ projectId: PROD_PROJECT_ID }),
      }),
    ).toBe(false);
  });

  it('refuses an unknown project (fails closed)', () => {
    expect(debugCallablesAllowed({})).toBe(false);
    expect(debugCallablesAllowed({ GCLOUD_PROJECT: 'someone-else' })).toBe(false);
  });

  it('allows the emulator for a non-prod project', () => {
    expect(
      debugCallablesAllowed({
        GCLOUD_PROJECT: 'demo-yomoyo',
        FUNCTIONS_EMULATOR: 'true',
      }),
    ).toBe(true);
  });

  it('allows a non-prod project with ENABLE_DEBUG_FUNCTIONS=true', () => {
    expect(
      debugCallablesAllowed({
        GCLOUD_PROJECT: 'someone-else',
        ENABLE_DEBUG_FUNCTIONS: 'true',
      }),
    ).toBe(true);
  });
});
