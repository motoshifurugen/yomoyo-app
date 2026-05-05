import {
  signInWithCredential,
  signOut,
  GoogleAuthProvider,
} from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { signInWithGoogle } from '@/lib/auth/google';
import { bridgeGoogleCredential } from '@/lib/auth/jsSdkBridge';

jest.mock('@react-native-firebase/auth');
jest.mock('@react-native-google-signin/google-signin');
jest.mock('@/lib/auth/jsSdkBridge', () => ({
  bridgeGoogleCredential: jest.fn().mockResolvedValue(undefined),
}));

describe('signInWithGoogle', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('signs in natively and bridges the same idToken to the JS SDK', async () => {
    const mockIdToken = 'mock-google-id-token';
    (GoogleSignin.signIn as jest.Mock).mockResolvedValue({
      type: 'success',
      data: { idToken: mockIdToken },
    });
    const mockCredential = { providerId: 'google.com' };
    jest.mocked(GoogleAuthProvider.credential).mockReturnValue(mockCredential as any);
    jest.mocked(signInWithCredential).mockResolvedValue({ user: {} } as any);

    await signInWithGoogle();

    expect(GoogleSignin.signIn).toHaveBeenCalled();
    expect(jest.mocked(GoogleAuthProvider.credential)).toHaveBeenCalledWith(mockIdToken);
    expect(jest.mocked(signInWithCredential)).toHaveBeenCalledWith(expect.anything(), mockCredential);
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

  it('rolls back native sign-in and rethrows when the JS SDK bridge fails', async () => {
    (GoogleSignin.signIn as jest.Mock).mockResolvedValue({
      type: 'success',
      data: { idToken: 'tok' },
    });
    jest.mocked(GoogleAuthProvider.credential).mockReturnValue({} as any);
    jest.mocked(signInWithCredential).mockResolvedValue({ user: {} } as any);
    (bridgeGoogleCredential as jest.Mock).mockRejectedValueOnce(new Error('jsdk down'));
    jest.mocked(signOut).mockResolvedValue(undefined);

    await expect(signInWithGoogle()).rejects.toThrow('jsdk down');
    expect(jest.mocked(signOut)).toHaveBeenCalledTimes(1);
  });
});
