import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { signInWithGoogle } from '@/lib/auth/google';

jest.mock('@react-native-firebase/auth');
jest.mock('@react-native-google-signin/google-signin');

const mockAuth = auth as jest.MockedFunction<typeof auth>;

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
    (mockAuth as unknown as { GoogleAuthProvider: { credential: jest.Mock } }).GoogleAuthProvider.credential.mockReturnValue(mockCredential);
    mockAuth().signInWithCredential.mockResolvedValue({ user: {} });

    await signInWithGoogle();

    expect(GoogleSignin.signIn).toHaveBeenCalled();
    expect((auth as any).GoogleAuthProvider.credential).toHaveBeenCalledWith(mockIdToken);
    expect(mockAuth().signInWithCredential).toHaveBeenCalledWith(mockCredential);
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
