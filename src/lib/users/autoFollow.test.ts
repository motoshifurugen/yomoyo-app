import { autoFollowAdmin, getAdminUid } from './autoFollow';
import { followUser } from './follows';
import { getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

jest.mock('./follows', () => ({
  followUser: jest.fn(() => Promise.resolve()),
}));

const originalAdminUid = process.env.EXPO_PUBLIC_ADMIN_UID;

const noMarker = { exists: () => false, data: () => undefined } as any;
const withMarker = {
  exists: () => true,
  data: () => ({ adminAutoFollowedAt: { _isServerTimestamp: true } }),
} as any;

afterEach(() => {
  jest.clearAllMocks();
  if (originalAdminUid === undefined) {
    delete process.env.EXPO_PUBLIC_ADMIN_UID;
  } else {
    process.env.EXPO_PUBLIC_ADMIN_UID = originalAdminUid;
  }
});

describe('getAdminUid', () => {
  it('returns the configured admin uid', () => {
    process.env.EXPO_PUBLIC_ADMIN_UID = 'admin-123';
    expect(getAdminUid()).toBe('admin-123');
  });

  it('returns null when the env var is unset', () => {
    delete process.env.EXPO_PUBLIC_ADMIN_UID;
    expect(getAdminUid()).toBeNull();
  });

  it('returns null when the env var is blank', () => {
    process.env.EXPO_PUBLIC_ADMIN_UID = '   ';
    expect(getAdminUid()).toBeNull();
  });

  it('trims surrounding whitespace', () => {
    process.env.EXPO_PUBLIC_ADMIN_UID = '  admin-123  ';
    expect(getAdminUid()).toBe('admin-123');
  });
});

describe('autoFollowAdmin', () => {
  it('follows the admin from the new user and records the marker', async () => {
    process.env.EXPO_PUBLIC_ADMIN_UID = 'admin-123';
    jest.mocked(getDoc).mockResolvedValueOnce(noMarker);

    await autoFollowAdmin('new-user');

    expect(jest.mocked(followUser)).toHaveBeenCalledWith('new-user', 'admin-123');
    expect(jest.mocked(setDoc)).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ adminAutoFollowedAt: expect.anything() }),
      { merge: true },
    );
    expect(jest.mocked(serverTimestamp)).toHaveBeenCalled();
  });

  it('does nothing when the admin uid is unset', async () => {
    delete process.env.EXPO_PUBLIC_ADMIN_UID;
    await autoFollowAdmin('new-user');
    expect(jest.mocked(getDoc)).not.toHaveBeenCalled();
    expect(jest.mocked(followUser)).not.toHaveBeenCalled();
  });

  it('does not follow when the new user is the admin', async () => {
    process.env.EXPO_PUBLIC_ADMIN_UID = 'admin-123';
    await autoFollowAdmin('admin-123');
    expect(jest.mocked(getDoc)).not.toHaveBeenCalled();
    expect(jest.mocked(followUser)).not.toHaveBeenCalled();
  });

  it('does not re-follow when the account was already auto-followed once', async () => {
    process.env.EXPO_PUBLIC_ADMIN_UID = 'admin-123';
    jest.mocked(getDoc).mockResolvedValueOnce(withMarker);

    await autoFollowAdmin('returning-user');

    expect(jest.mocked(followUser)).not.toHaveBeenCalled();
    expect(jest.mocked(setDoc)).not.toHaveBeenCalled();
  });
});
