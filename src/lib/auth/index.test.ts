import { signOut as firebaseSignOut } from '@react-native-firebase/auth';
import { signOut } from '@/lib/auth';
import { signOutJsSdk } from '@/lib/auth/jsSdkBridge';

jest.mock('@react-native-firebase/auth');
jest.mock('@/lib/auth/jsSdkBridge', () => ({
  signOutJsSdk: jest.fn().mockResolvedValue(undefined),
}));

describe('signOut', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('signs out of native and JS SDK auth', async () => {
    jest.mocked(firebaseSignOut).mockResolvedValue(undefined);

    await signOut();

    expect(jest.mocked(firebaseSignOut)).toHaveBeenCalledTimes(1);
    expect(signOutJsSdk).toHaveBeenCalledTimes(1);
  });

  it('still signs out JS SDK even if native sign-out fails', async () => {
    jest.mocked(firebaseSignOut).mockRejectedValueOnce(new Error('native fail'));

    await expect(signOut()).rejects.toThrow('native fail');
    expect(signOutJsSdk).toHaveBeenCalledTimes(1);
  });
});
