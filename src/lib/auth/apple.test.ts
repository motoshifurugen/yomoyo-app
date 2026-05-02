import auth from '@react-native-firebase/auth';
import { appleAuth } from '@invertase/react-native-apple-authentication';
import { signInWithApple } from '@/lib/auth/apple';

jest.mock('@react-native-firebase/auth');
jest.mock('@invertase/react-native-apple-authentication');

const mockAuth = auth as jest.MockedFunction<typeof auth>;

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
    (auth as any).AppleAuthProvider.credential.mockReturnValue(mockCredential);
    mockAuth().signInWithCredential.mockResolvedValue({ user: {} });

    await signInWithApple();

    expect(appleAuth.performRequest).toHaveBeenCalledWith({
      requestedOperation: appleAuth.Operation.LOGIN,
      requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
    });
    expect((auth as any).AppleAuthProvider.credential).toHaveBeenCalledWith(mockToken, mockNonce);
    expect(mockAuth().signInWithCredential).toHaveBeenCalledWith(mockCredential);
  });

  it('throws when identity token is missing', async () => {
    (appleAuth.performRequest as jest.Mock).mockResolvedValue({
      identityToken: null,
      nonce: 'mock-nonce',
    });

    await expect(signInWithApple()).rejects.toThrow('Apple sign-in failed: no identity token');
  });
});
