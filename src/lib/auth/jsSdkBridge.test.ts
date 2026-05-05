import {
  signInWithCredential,
  signOut,
  GoogleAuthProvider,
  OAuthProvider,
} from 'firebase/auth';
import {
  bridgeGoogleCredential,
  bridgeAppleCredential,
  signOutJsSdk,
} from './jsSdkBridge';

const mockedSignInWithCredential = signInWithCredential as jest.Mock;
const mockedSignOut = signOut as jest.Mock;
const mockedGoogleCredential = GoogleAuthProvider.credential as jest.Mock;

describe('bridgeGoogleCredential', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedSignInWithCredential.mockResolvedValue({ user: { uid: 'js-uid' } });
  });

  it('builds a Google credential from the idToken and signs in on the JS SDK', async () => {
    await bridgeGoogleCredential('mock-id-token');

    expect(mockedGoogleCredential).toHaveBeenCalledWith('mock-id-token');
    expect(mockedSignInWithCredential).toHaveBeenCalledTimes(1);
  });

  it('rethrows when JS SDK sign-in fails', async () => {
    mockedSignInWithCredential.mockRejectedValueOnce(new Error('jsdk down'));
    await expect(bridgeGoogleCredential('t')).rejects.toThrow('jsdk down');
  });
});

describe('bridgeAppleCredential', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedSignInWithCredential.mockResolvedValue({ user: { uid: 'js-uid' } });
  });

  it('builds an Apple OAuth credential and signs in on the JS SDK', async () => {
    await bridgeAppleCredential('apple-id-token', 'raw-nonce');

    expect(mockedSignInWithCredential).toHaveBeenCalledTimes(1);
    const credentialArg = mockedSignInWithCredential.mock.calls[0][1];
    expect(credentialArg.providerId).toBe('apple.com');
    expect(credentialArg.idToken).toBe('apple-id-token');
    expect(credentialArg.rawNonce).toBe('raw-nonce');
  });

  it('uses OAuthProvider for apple.com', () => {
    const provider = new OAuthProvider('apple.com');
    expect(provider).toBeInstanceOf(OAuthProvider);
  });

  it('rethrows when JS SDK sign-in fails', async () => {
    mockedSignInWithCredential.mockRejectedValueOnce(new Error('jsdk down'));
    await expect(bridgeAppleCredential('t', 'n')).rejects.toThrow('jsdk down');
  });
});

describe('signOutJsSdk', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls JS SDK signOut', async () => {
    mockedSignOut.mockResolvedValueOnce(undefined);
    await signOutJsSdk();
    expect(mockedSignOut).toHaveBeenCalledTimes(1);
  });

  it('rethrows when JS SDK signOut fails', async () => {
    mockedSignOut.mockRejectedValueOnce(new Error('signout failed'));
    await expect(signOutJsSdk()).rejects.toThrow('signout failed');
  });
});
