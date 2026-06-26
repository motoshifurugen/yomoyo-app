import { httpsCallable } from 'firebase/functions';
import { deleteAccount } from './deleteAccount';
import { signOut } from '@/lib/auth';
import { clearBoundProvider } from '@/lib/auth/deviceAccount';

jest.mock('@/lib/auth', () => ({
  signOut: jest.fn(() => Promise.resolve()),
}));
jest.mock('@/lib/auth/deviceAccount', () => ({
  clearBoundProvider: jest.fn(() => Promise.resolve()),
}));

const mockedHttpsCallable = httpsCallable as jest.Mock;
const mockedSignOut = signOut as jest.Mock;
const mockedClearBoundProvider = clearBoundProvider as jest.Mock;

describe('deleteAccount', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('invokes the deleteAccount callable, then signs out and clears the device binding', async () => {
    const callable = jest.fn(() => Promise.resolve({ data: { ok: true } }));
    mockedHttpsCallable.mockReturnValueOnce(callable);

    await deleteAccount();

    expect(mockedHttpsCallable).toHaveBeenCalledWith(expect.anything(), 'deleteAccount');
    expect(callable).toHaveBeenCalledTimes(1);
    expect(mockedSignOut).toHaveBeenCalledTimes(1);
    expect(mockedClearBoundProvider).toHaveBeenCalledTimes(1);
  });

  it('still resolves when local teardown fails after a successful server deletion', async () => {
    const callable = jest.fn(() => Promise.resolve({ data: { ok: true } }));
    mockedHttpsCallable.mockReturnValueOnce(callable);
    mockedSignOut.mockRejectedValueOnce(new Error('signOut failed'));
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    // The server already deleted the account, so a teardown failure must not
    // surface as a rejected deletion.
    await expect(deleteAccount()).resolves.toBeUndefined();
    expect(mockedClearBoundProvider).toHaveBeenCalledTimes(1);

    errorSpy.mockRestore();
  });

  it('does not sign out or clear the binding when the callable fails', async () => {
    const callable = jest.fn(() => Promise.reject(new Error('server error')));
    mockedHttpsCallable.mockReturnValueOnce(callable);

    await expect(deleteAccount()).rejects.toThrow('server error');

    expect(mockedSignOut).not.toHaveBeenCalled();
    expect(mockedClearBoundProvider).not.toHaveBeenCalled();
  });
});
