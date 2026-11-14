const {
  DEV_PROJECT_ID,
  PROD_PROJECT_ID,
  resolveSeedProjectId,
  checkSeedTarget,
} = require('./seedGuard');

describe('checkSeedTarget', () => {
  it('allows the dev project', () => {
    expect(checkSeedTarget({ projectId: DEV_PROJECT_ID, force: false }).ok).toBe(true);
  });

  it('refuses the production project', () => {
    expect(checkSeedTarget({ projectId: PROD_PROJECT_ID, force: false }).ok).toBe(false);
  });

  it('refuses the production project even with --force', () => {
    expect(checkSeedTarget({ projectId: PROD_PROJECT_ID, force: true }).ok).toBe(false);
  });

  it('refuses an unknown project even with --force', () => {
    expect(checkSeedTarget({ projectId: null, force: true }).ok).toBe(false);
    expect(checkSeedTarget({ projectId: '', force: true }).ok).toBe(false);
  });

  it('refuses another project without --force', () => {
    expect(checkSeedTarget({ projectId: 'someone-else', force: false }).ok).toBe(false);
  });

  it('allows another non-prod project with --force', () => {
    expect(checkSeedTarget({ projectId: 'someone-else', force: true }).ok).toBe(true);
  });
});

describe('resolveSeedProjectId', () => {
  it('prefers the service account project_id', () => {
    expect(
      resolveSeedProjectId({
        serviceAccount: { project_id: PROD_PROJECT_ID },
        env: { GOOGLE_CLOUD_PROJECT: DEV_PROJECT_ID },
        appProjectId: DEV_PROJECT_ID,
      }),
    ).toBe(PROD_PROJECT_ID);
  });

  it('falls back through env vars, then the app option', () => {
    expect(resolveSeedProjectId({ serviceAccount: null, env: { GCLOUD_PROJECT: 'b' } })).toBe('b');
    expect(resolveSeedProjectId({ serviceAccount: null, env: { FIREBASE_PROJECT: 'c' } })).toBe(
      'c',
    );
    expect(resolveSeedProjectId({ serviceAccount: null, env: {}, appProjectId: 'd' })).toBe('d');
  });

  it('returns null when nothing is known', () => {
    expect(resolveSeedProjectId({ serviceAccount: null, env: {} })).toBeNull();
  });

  it('feeds a production service account into a refusal', () => {
    const projectId = resolveSeedProjectId({
      serviceAccount: { project_id: PROD_PROJECT_ID },
      env: {},
    });
    expect(checkSeedTarget({ projectId, force: true }).ok).toBe(false);
  });
});
