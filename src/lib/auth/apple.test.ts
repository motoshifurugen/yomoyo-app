import { signInWithCredential, AppleAuthProvider } from '@react-native-firebase/auth';
import { appleAuth } from '@invertase/react-native-apple-authentication';
import { signInWithApple } from '@/lib/auth/apple';

jest.mock('@react-native-firebase/auth');
jest.mock('@invertase/react-native-apple-authentication');

describe('signInWithApple', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('requests Apple credential and calls signInWithCredential', async () => {
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
  });

  it('throws when identity token is missing', async () => {
    (appleAuth.performRequest as jest.Mock).mockResolvedValue({
      identityToken: null,
      nonce: 'mock-nonce',
    });

    await expect(signInWithApple()).rejects.toThrow('Apple sign-in failed: no identity token');
  });
});
