import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { derivePushTokenId, savePushToken } from './pushTokens';

const mockedDoc = doc as jest.Mock;
const mockedGetDoc = getDoc as jest.Mock;
const mockedSetDoc = setDoc as jest.Mock;
const mockedServerTimestamp = serverTimestamp as jest.Mock;

describe('derivePushTokenId', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('strips brackets and is deterministic for the same token', () => {
    const id1 = derivePushTokenId('ExponentPushToken[abc-123]');
    const id2 = derivePushTokenId('ExponentPushToken[abc-123]');
    expect(id1).toBe(id2);
    expect(id1).not.toContain('[');
    expect(id1).not.toContain(']');
  });

  it('produces different ids for different tokens', () => {
    expect(derivePushTokenId('ExponentPushToken[a]')).not.toBe(
      derivePushTokenId('ExponentPushToken[b]'),
    );
  });

  it('strips slashes so the result is path-safe', () => {
    const id = derivePushTokenId('FCM/abc/def');
    expect(id).not.toContain('/');
  });

  it('returns a non-empty string', () => {
    expect(derivePushTokenId('ExponentPushToken[xyz]').length).toBeGreaterThan(0);
  });
});

describe('savePushToken', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedServerTimestamp.mockReturnValue({ _isServerTimestamp: true });
  });

  it('writes to users/{uid}/pushTokens/{tokenId} with merge', async () => {
    mockedGetDoc.mockResolvedValueOnce({ exists: () => false });

    await savePushToken('user1', 'ExponentPushToken[t1]', 'ios', 'en');

    expect(mockedDoc).toHaveBeenCalledWith(
      expect.anything(),
      'users',
      'user1',
      'pushTokens',
      derivePushTokenId('ExponentPushToken[t1]'),
    );
    expect(mockedSetDoc).toHaveBeenCalledTimes(1);
    expect(mockedSetDoc.mock.calls[0][2]).toEqual({ merge: true });
  });

  it('sets all required fields on first save', async () => {
    mockedGetDoc.mockResolvedValueOnce({ exists: () => false });

    await savePushToken('user1', 'ExponentPushToken[t1]', 'android', 'ja');

    const payload = mockedSetDoc.mock.calls[0][1];
    expect(payload.token).toBe('ExponentPushToken[t1]');
    expect(payload.platform).toBe('android');
    expect(payload.enabled).toBe(true);
    expect(payload.createdAt).toEqual({ _isServerTimestamp: true });
    expect(payload.updatedAt).toEqual({ _isServerTimestamp: true });
    expect(payload.lastSeenAt).toEqual({ _isServerTimestamp: true });
    expect(payload.source).toBe('expo');
  });

  it('does not overwrite createdAt on a repeat save', async () => {
    mockedGetDoc.mockResolvedValueOnce({ exists: () => true });

    await savePushToken('user1', 'ExponentPushToken[t1]', 'ios', 'en');

    const payload = mockedSetDoc.mock.calls[0][1];
    expect(payload).not.toHaveProperty('createdAt');
    expect(payload.updatedAt).toEqual({ _isServerTimestamp: true });
    expect(payload.lastSeenAt).toEqual({ _isServerTimestamp: true });
    expect(payload.enabled).toBe(true);
  });

  it('uses the same tokenId for repeat saves of the same token (upsert)', async () => {
    mockedGetDoc
      .mockResolvedValueOnce({ exists: () => false })
      .mockResolvedValueOnce({ exists: () => true });

    await savePushToken('user1', 'ExponentPushToken[t1]', 'ios', 'ja');
    await savePushToken('user1', 'ExponentPushToken[t1]', 'ios', 'en');

    const firstId = mockedDoc.mock.calls[0][4];
    const secondId = mockedDoc.mock.calls[1][4];
    expect(firstId).toBe(secondId);
  });

  it("persists language as 'ja' on first save", async () => {
    mockedGetDoc.mockResolvedValueOnce({ exists: () => false });

    await savePushToken('user1', 'ExponentPushToken[t1]', 'ios', 'ja');

    const payload = mockedSetDoc.mock.calls[0][1];
    expect(payload.language).toBe('ja');
  });

  it("persists language as 'en' on first save", async () => {
    mockedGetDoc.mockResolvedValueOnce({ exists: () => false });

    await savePushToken('user1', 'ExponentPushToken[t1]', 'ios', 'en');

    const payload = mockedSetDoc.mock.calls[0][1];
    expect(payload.language).toBe('en');
  });

  it('updates language on a repeat save (allows change after onboarding)', async () => {
    mockedGetDoc.mockResolvedValueOnce({ exists: () => true });

    await savePushToken('user1', 'ExponentPushToken[t1]', 'ios', 'en');

    const payload = mockedSetDoc.mock.calls[0][1];
    expect(payload.language).toBe('en');
  });
});
