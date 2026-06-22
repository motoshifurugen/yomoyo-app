import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { signInWithGoogle } from '@/lib/auth/google';
import { bridgeGoogleCredential } from '@/lib/auth/jsSdkBridge';
import { assertProviderAllowed, setBoundProvider } from '@/lib/auth/deviceAccount';

jest.mock('@react-native-google-signin/google-signin');
jest.mock('@/lib/auth/jsSdkBridge', () => ({
  bridgeGoogleCredential: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('@/lib/auth/deviceAccount', () => ({
  assertProviderAllowed: jest.fn().mockResolvedValue(undefined),
  setBoundProvider: jest.fn().mockResolvedValue(undefined),
}));

describe('signInWithGoogle', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (bridgeGoogleCredential as jest.Mock).mockResolvedValue(undefined);
    (assertProviderAllowed as jest.Mock).mockResolvedValue(undefined);
    (setBoundProvider as jest.Mock).mockResolvedValue(undefined);
  });

  it('binds the device to google after a successful sign-in', async () => {
    (GoogleSignin.signIn as jest.Mock).mockResolvedValue({
      type: 'success',
      data: { idToken: 'tok' },
    });

    await signInWithGoogle();

    expect(assertProviderAllowed).toHaveBeenCalledWith('google');
    expect(setBoundProvider).toHaveBeenCalledWith('google');
  });

  it('does not start the OS sign-in when the device is bound to another provider', async () => {
    (assertProviderAllowed as jest.Mock).mockRejectedValueOnce(new Error('device mismatch'));

    await expect(signInWithGoogle()).rejects.toThrow('device mismatch');
    expect(GoogleSignin.signIn).not.toHaveBeenCalled();
    expect(setBoundProvider).not.toHaveBeenCalled();
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
