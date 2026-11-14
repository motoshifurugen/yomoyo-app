// Checks what the Firebase CLI would see as deployable functions for each
// deploy target: it deploys exactly the exports of this module.

jest.mock('firebase-admin/app', () => ({ initializeApp: jest.fn() }));
jest.mock('firebase-admin/auth', () => ({ getAuth: jest.fn() }));
jest.mock('firebase-admin/firestore', () => ({ getFirestore: jest.fn() }));
jest.mock('firebase-functions/v2', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));
jest.mock('firebase-functions/v2/https', () => ({
  onCall: (_opts: unknown, handler: unknown) => handler,
  HttpsError: class HttpsError extends Error {
    constructor(
      public code: string,
      message: string,
    ) {
      super(message);
    }
  },
}));
jest.mock('firebase-functions/v2/firestore', () => ({
  onDocumentCreated: (_opts: unknown, handler: unknown) => handler,
  onDocumentWritten: (_opts: unknown, handler: unknown) => handler,
  onDocumentUpdated: (_opts: unknown, handler: unknown) => handler,
}));

const ENV_KEYS = [
  'GCLOUD_PROJECT',
  'GOOGLE_CLOUD_PROJECT',
  'FIREBASE_CONFIG',
  'FUNCTIONS_EMULATOR',
  'ENABLE_DEBUG_FUNCTIONS',
] as const;
const saved: Record<string, string | undefined> = {};

beforeEach(() => {
  for (const k of ENV_KEYS) {
    saved[k] = process.env[k];
    delete process.env[k];
  }
});

afterEach(() => {
  for (const k of ENV_KEYS) {
    if (saved[k] === undefined) delete process.env[k];
    else process.env[k] = saved[k];
  }
});

function loadExports(): string[] {
  let keys: string[] = [];
  jest.isolateModules(() => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('./index');
    keys = Object.keys(mod).sort();
  });
  return keys;
}

describe('deployable functions', () => {
  it('omits debug callables for the production project', () => {
    process.env.GCLOUD_PROJECT = 'yomoyo-prod';
    const keys = loadExports();
    expect(keys).not.toContain('sendTestPush');
    expect(keys).not.toContain('dryRunResolveRecipients');
    expect(keys).toContain('deleteAccount');
    expect(keys).toContain('onReadingActivityFinished');
  });

  it('omits debug callables for production even with ENABLE_DEBUG_FUNCTIONS', () => {
    process.env.GCLOUD_PROJECT = 'yomoyo-prod';
    process.env.ENABLE_DEBUG_FUNCTIONS = 'true';
    expect(loadExports()).not.toContain('sendTestPush');
  });

  it('omits debug callables when the project is unknown', () => {
    expect(loadExports()).not.toContain('sendTestPush');
  });

  it('exports debug callables for the dev project', () => {
    process.env.GCLOUD_PROJECT = 'yomoyo-d9c4a';
    const keys = loadExports();
    expect(keys).toContain('sendTestPush');
    expect(keys).toContain('dryRunResolveRecipients');
    expect(keys).toContain('deleteAccount');
  });
});
