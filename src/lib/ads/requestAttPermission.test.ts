import { Platform } from 'react-native';
import { requestAttPermission } from './requestAttPermission';
import { requestTrackingPermissionsAsync } from 'expo-tracking-transparency';

const mockRequest = requestTrackingPermissionsAsync as jest.Mock;
const originalOS = Platform.OS;

function setOS(os: string) {
  Object.defineProperty(Platform, 'OS', { value: os, configurable: true });
}

describe('requestAttPermission', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    setOS(originalOS);
  });

  it('returns true without prompting on non-iOS platforms', async () => {
    setOS('android');
    await expect(requestAttPermission()).resolves.toBe(true);
    expect(mockRequest).not.toHaveBeenCalled();
  });

  it('requests tracking permission on iOS and returns true when granted', async () => {
    setOS('ios');
    mockRequest.mockResolvedValueOnce({ status: 'granted', granted: true });
    await expect(requestAttPermission()).resolves.toBe(true);
    expect(mockRequest).toHaveBeenCalledTimes(1);
  });

  it('returns false on iOS when the user denies tracking', async () => {
    setOS('ios');
    mockRequest.mockResolvedValueOnce({ status: 'denied', granted: false });
    await expect(requestAttPermission()).resolves.toBe(false);
  });

  it('returns false on iOS when the request throws', async () => {
    setOS('ios');
    mockRequest.mockRejectedValueOnce(new Error('boom'));
    await expect(requestAttPermission()).resolves.toBe(false);
  });
});
