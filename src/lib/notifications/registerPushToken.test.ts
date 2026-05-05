import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import {
  registerPushTokenAfterGrant,
  registerPushTokenIfPermitted,
} from './registerPushToken';
import { savePushToken } from '@/lib/users/pushTokens';

jest.mock('expo-notifications');

jest.mock('@/lib/users/pushTokens', () => ({
  savePushToken: jest.fn().mockResolvedValue(undefined),
}));

const mockedSavePushToken = savePushToken as jest.Mock;
const mockedRequestPermissions = Notifications.requestPermissionsAsync as jest.Mock;
const mockedGetPermissions = Notifications.getPermissionsAsync as jest.Mock;
const mockedGetToken = Notifications.getExpoPushTokenAsync as jest.Mock;

describe('registerPushTokenAfterGrant', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetToken.mockResolvedValue({
      type: 'expo',
      data: 'ExponentPushToken[abc]',
    });
  });

  it('fetches the push token and persists it', async () => {
    await registerPushTokenAfterGrant('user1');

    expect(mockedGetToken).toHaveBeenCalled();
    expect(mockedSavePushToken).toHaveBeenCalledWith(
      'user1',
      'ExponentPushToken[abc]',
      Platform.OS,
    );
  });

  it('does not request permission', async () => {
    await registerPushTokenAfterGrant('user1');
    expect(mockedRequestPermissions).not.toHaveBeenCalled();
  });

  it('does not throw when token retrieval fails', async () => {
    mockedGetToken.mockRejectedValueOnce(new Error('token error'));
    await expect(registerPushTokenAfterGrant('user1')).resolves.toBeUndefined();
    expect(mockedSavePushToken).not.toHaveBeenCalled();
  });

  it('does not throw when persistence fails', async () => {
    mockedSavePushToken.mockRejectedValueOnce(new Error('firestore error'));
    await expect(registerPushTokenAfterGrant('user1')).resolves.toBeUndefined();
  });
});

describe('registerPushTokenIfPermitted', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetToken.mockResolvedValue({
      type: 'expo',
      data: 'ExponentPushToken[abc]',
    });
  });

  it('checks permission status without requesting', async () => {
    mockedGetPermissions.mockResolvedValueOnce({ status: 'granted' });

    await registerPushTokenIfPermitted('user1');

    expect(mockedGetPermissions).toHaveBeenCalled();
    expect(mockedRequestPermissions).not.toHaveBeenCalled();
  });

  it('persists the token when permission is granted', async () => {
    mockedGetPermissions.mockResolvedValueOnce({ status: 'granted' });

    await registerPushTokenIfPermitted('user1');

    expect(mockedGetToken).toHaveBeenCalled();
    expect(mockedSavePushToken).toHaveBeenCalledWith(
      'user1',
      'ExponentPushToken[abc]',
      Platform.OS,
    );
  });

  it('does nothing when permission is not granted', async () => {
    mockedGetPermissions.mockResolvedValueOnce({ status: 'denied' });

    await registerPushTokenIfPermitted('user1');

    expect(mockedGetToken).not.toHaveBeenCalled();
    expect(mockedSavePushToken).not.toHaveBeenCalled();
  });

  it('does nothing when permission is undetermined', async () => {
    mockedGetPermissions.mockResolvedValueOnce({ status: 'undetermined' });

    await registerPushTokenIfPermitted('user1');

    expect(mockedGetToken).not.toHaveBeenCalled();
    expect(mockedSavePushToken).not.toHaveBeenCalled();
  });

  it('does not throw when permission check fails', async () => {
    mockedGetPermissions.mockRejectedValueOnce(new Error('boom'));
    await expect(registerPushTokenIfPermitted('user1')).resolves.toBeUndefined();
    expect(mockedSavePushToken).not.toHaveBeenCalled();
  });

  it('does not throw when token retrieval fails', async () => {
    mockedGetPermissions.mockResolvedValueOnce({ status: 'granted' });
    mockedGetToken.mockRejectedValueOnce(new Error('token error'));
    await expect(registerPushTokenIfPermitted('user1')).resolves.toBeUndefined();
    expect(mockedSavePushToken).not.toHaveBeenCalled();
  });

  it('does not throw when persistence fails', async () => {
    mockedGetPermissions.mockResolvedValueOnce({ status: 'granted' });
    mockedSavePushToken.mockRejectedValueOnce(new Error('firestore error'));
    await expect(registerPushTokenIfPermitted('user1')).resolves.toBeUndefined();
  });
});
