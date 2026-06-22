import AsyncStorage from '@react-native-async-storage/async-storage';

export type AuthProvider = 'google' | 'apple';

export const DEVICE_PROVIDER_KEY = 'yomoyo_device_provider';

// Thrown when a sign-in is attempted with a provider other than the one this
// device is already bound to (one account per device).
export class DeviceAccountMismatchError extends Error {
  readonly boundProvider: AuthProvider;
  constructor(boundProvider: AuthProvider) {
    super('This device is already linked to a different sign-in method');
    this.name = 'DeviceAccountMismatchError';
    this.boundProvider = boundProvider;
  }
}

export async function getBoundProvider(): Promise<AuthProvider | null> {
  const value = await AsyncStorage.getItem(DEVICE_PROVIDER_KEY);
  return value === 'google' || value === 'apple' ? value : null;
}

export async function setBoundProvider(provider: AuthProvider): Promise<void> {
  await AsyncStorage.setItem(DEVICE_PROVIDER_KEY, provider);
}

export async function clearBoundProvider(): Promise<void> {
  await AsyncStorage.removeItem(DEVICE_PROVIDER_KEY);
}

// One account per device: once a sign-in method has been used on this device,
// reject sign-in with the other method so a second account can't be created.
// Checked BEFORE any OS sign-in / credential exchange, so no stray account is
// ever created on a mismatch.
export async function assertProviderAllowed(provider: AuthProvider): Promise<void> {
  const bound = await getBoundProvider();
  if (bound && bound !== provider) {
    throw new DeviceAccountMismatchError(bound);
  }
}
