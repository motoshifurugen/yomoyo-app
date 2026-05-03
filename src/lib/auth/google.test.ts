import { signInWithCredential, GoogleAuthProvider } from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { signInWithGoogle } from '@/lib/auth/google';

jest.mock('@react-native-firebase/auth');
jest.mock('@react-native-google-signin/google-signin');

describe('signInWithGoogle', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('signs in and calls signInWithCredential with a Google credential', async () => {
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
});
