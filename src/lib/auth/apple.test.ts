import { appleAuth } from '@invertase/react-native-apple-authentication';
import { signInWithApple } from '@/lib/auth/apple';
import { bridgeAppleCredential } from '@/lib/auth/jsSdkBridge';
import { assertProviderAllowed, setBoundProvider } from '@/lib/auth/deviceAccount';

jest.mock('@invertase/react-native-apple-authentication');
jest.mock('@/lib/auth/jsSdkBridge', () => ({
  bridgeAppleCredential: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('@/lib/auth/deviceAccount', () => ({
  assertProviderAllowed: jest.fn().mockResolvedValue(undefined),
  setBoundProvider: jest.fn().mockResolvedValue(undefined),
}));

describe('signInWithApple', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (bridgeAppleCredential as jest.Mock).mockResolvedValue(undefined);
    (assertProviderAllowed as jest.Mock).mockResolvedValue(undefined);
    (setBoundProvider as jest.Mock).mockResolvedValue(undefined);
  });

  it('binds the device to apple after a successful sign-in', async () => {
    (appleAuth.performRequest as jest.Mock).mockResolvedValue({
      identityToken: 'tok',
      nonce: 'n',
    });

    await signInWithApple();

    expect(assertProviderAllowed).toHaveBeenCalledWith('apple');
    expect(setBoundProvider).toHaveBeenCalledWith('apple');
  });

  it('does not start the OS sign-in when the device is bound to another provider', async () => {
    (assertProviderAllowed as jest.Mock).mockRejectedValueOnce(new Error('device mismatch'));

    await expect(signInWithApple()).rejects.toThrow('device mismatch');
    expect(appleAuth.performRequest).not.toHaveBeenCalled();
    expect(setBoundProvider).not.toHaveBeenCalled();
  });

  it('exchanges the Apple identity token with the JS SDK only (single exchange)', async () => {
    const mockToken = 'mock-identity-token';
    const mockNonce = 'mock-nonce';
    (appleAuth.performRequest as jest.Mock).mockResolvedValue({
      identityToken: mockToken,
      nonce: mockNonce,
    });

    await signInWithApple();

    expect(appleAuth.performRequest).toHaveBeenCalledWith({
      requestedOperation: appleAuth.Operation.LOGIN,
      requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
    });
    expect(bridgeAppleCredential).toHaveBeenCalledWith(mockToken, mockNonce);
  });

  it('throws when identity token is missing', async () => {
    (appleAuth.performRequest as jest.Mock).mockResolvedValue({
      identityToken: null,
      nonce: 'mock-nonce',
    });

    await expect(signInWithApple()).rejects.toThrow('Apple sign-in failed: no identity token');
  });

  it('propagates the error when the JS SDK sign-in fails (no rollback to swallow it)', async () => {
    (appleAuth.performRequest as jest.Mock).mockResolvedValue({
      identityToken: 'tok',
      nonce: 'n',
    });
    (bridgeAppleCredential as jest.Mock).mockRejectedValueOnce(new Error('jsdk down'));

    await expect(signInWithApple()).rejects.toThrow('jsdk down');
  });
});
