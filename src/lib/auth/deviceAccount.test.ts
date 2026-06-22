import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getBoundProvider,
  setBoundProvider,
  clearBoundProvider,
  assertProviderAllowed,
  DeviceAccountMismatchError,
  DEVICE_PROVIDER_KEY,
} from './deviceAccount';

describe('deviceAccount', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getBoundProvider', () => {
    it('returns null when nothing is stored', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      expect(await getBoundProvider()).toBeNull();
    });

    it('returns the stored provider', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('google');
      expect(await getBoundProvider()).toBe('google');
    });

    it('returns null for an unrecognized stored value', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('garbage');
      expect(await getBoundProvider()).toBeNull();
    });
  });

  describe('setBoundProvider', () => {
    it('persists the provider', async () => {
      await setBoundProvider('apple');
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(DEVICE_PROVIDER_KEY, 'apple');
    });
  });

  describe('clearBoundProvider', () => {
    it('removes the stored provider', async () => {
      await clearBoundProvider();
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(DEVICE_PROVIDER_KEY);
    });
  });

  describe('assertProviderAllowed', () => {
    it('allows any provider when none is bound', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      await expect(assertProviderAllowed('google')).resolves.toBeUndefined();
    });

    it('allows the same provider that is bound', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('google');
      await expect(assertProviderAllowed('google')).resolves.toBeUndefined();
    });

    it('rejects a different provider with DeviceAccountMismatchError', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('google');
      await expect(assertProviderAllowed('apple')).rejects.toBeInstanceOf(
        DeviceAccountMismatchError,
      );
    });

    it('exposes the bound provider on the error', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('apple');
      expect.assertions(1);
      try {
        await assertProviderAllowed('google');
      } catch (e) {
        expect((e as DeviceAccountMismatchError).boundProvider).toBe('apple');
      }
    });
  });
});
