import { signOut } from '@/lib/auth';
import { signOutJsSdk } from '@/lib/auth/jsSdkBridge';

jest.mock('@/lib/auth/jsSdkBridge', () => ({
  signOutJsSdk: jest.fn().mockResolvedValue(undefined),
}));

describe('signOut', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (signOutJsSdk as jest.Mock).mockResolvedValue(undefined);
  });

  it('signs out of the JS SDK', async () => {
    await signOut();

    expect(signOutJsSdk).toHaveBeenCalledTimes(1);
  });

  it('rethrows when JS SDK sign-out fails', async () => {
    (signOutJsSdk as jest.Mock).mockRejectedValueOnce(new Error('signout failed'));

    await expect(signOut()).rejects.toThrow('signout failed');
  });
});
