import {
  signInWithCredential,
  signOut,
  AppleAuthProvider,
} from '@react-native-firebase/auth';
import { appleAuth } from '@invertase/react-native-apple-authentication';
import { signInWithApple } from '@/lib/auth/apple';
import { bridgeAppleCredential } from '@/lib/auth/jsSdkBridge';

jest.mock('@react-native-firebase/auth');
jest.mock('@invertase/react-native-apple-authentication');
jest.mock('@/lib/auth/jsSdkBridge', () => ({
  bridgeAppleCredential: jest.fn().mockResolvedValue(undefined),
}));

describe('signInWithApple', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('signs in natively and bridges the same identity token to the JS SDK', async () => {
    const mockToken = 'mock-identity-token';
    const mockNonce = 'mock-nonce';
    (appleAuth.performRequest as jest.Mock).mockResolvedValue({
      identityToken: mockToken,
      nonce: mockNonce,
    });
    const mockCredential = { providerId: 'apple.com' };
    jest.mocked(AppleAuthProvider.credential).mockReturnValue(mockCredential as any);
    jest.mocked(signInWithCredential).mockResolvedValue({ user: {} } as any);

    await signInWithApple();

    expect(appleAuth.performRequest).toHaveBeenCalledWith({
      requestedOperation: appleAuth.Operation.LOGIN,
      requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
    });
    expect(jest.mocked(AppleAuthProvider.credential)).toHaveBeenCalledWith(mockToken, mockNonce);
    expect(jest.mocked(signInWithCredential)).toHaveBeenCalledWith(expect.anything(), mockCredential);
    expect(bridgeAppleCredential).toHaveBeenCalledWith(mockToken, mockNonce);
  });

  it('throws when identity token is missing', async () => {
    (appleAuth.performRequest as jest.Mock).mockResolvedValue({
      identityToken: null,
      nonce: 'mock-nonce',
    });

    await expect(signInWithApple()).rejects.toThrow('Apple sign-in failed: no identity token');
  });

  it('rolls back native sign-in and rethrows when the JS SDK bridge fails', async () => {
    (appleAuth.performRequest as jest.Mock).mockResolvedValue({
      identityToken: 'tok',
      nonce: 'n',
    });
    jest.mocked(AppleAuthProvider.credential).mockReturnValue({} as any);
    jest.mocked(signInWithCredential).mockResolvedValue({ user: {} } as any);
    (bridgeAppleCredential as jest.Mock).mockRejectedValueOnce(new Error('jsdk down'));
    jest.mocked(signOut).mockResolvedValue(undefined);

    await expect(signInWithApple()).rejects.toThrow('jsdk down');
    expect(jest.mocked(signOut)).toHaveBeenCalledTimes(1);
  });
});
