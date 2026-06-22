import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { signInWithGoogle } from '@/lib/auth/google';
import { bridgeGoogleCredential } from '@/lib/auth/jsSdkBridge';

jest.mock('@react-native-google-signin/google-signin');
jest.mock('@/lib/auth/jsSdkBridge', () => ({
  bridgeGoogleCredential: jest.fn().mockResolvedValue(undefined),
}));

describe('signInWithGoogle', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (bridgeGoogleCredential as jest.Mock).mockResolvedValue(undefined);
  });

  it('exchanges the Google idToken with the JS SDK only (single exchange)', async () => {
    const mockIdToken = 'mock-google-id-token';
    (GoogleSignin.signIn as jest.Mock).mockResolvedValue({
      type: 'success',
      data: { idToken: mockIdToken },
    });

    await signInWithGoogle();

    expect(GoogleSignin.signIn).toHaveBeenCalled();
    expect(bridgeGoogleCredential).toHaveBeenCalledWith(mockIdToken);
  });

  it('throws when the user cancels sign-in', async () => {
    (GoogleSignin.signIn as jest.Mock).mockResolvedValue({ type: 'cancelled' });

    await expect(signInWithGoogle()).rejects.toThrow('Google sign-in cancelled');
  });

  it('throws when idToken is missing from response', async () => {
    (GoogleSignin.signIn as jest.Mock).mockResolvedValue({
      type: 'success',
      data: { idToken: null },
    });

    await expect(signInWithGoogle()).rejects.toThrow('Google sign-in failed: no id token');
  });

  it('propagates the error when the JS SDK sign-in fails (no rollback to swallow it)', async () => {
    (GoogleSignin.signIn as jest.Mock).mockResolvedValue({
      type: 'success',
      data: { idToken: 'tok' },
    });
    (bridgeGoogleCredential as jest.Mock).mockRejectedValueOnce(new Error('jsdk down'));

    await expect(signInWithGoogle()).rejects.toThrow('jsdk down');
  });
});
