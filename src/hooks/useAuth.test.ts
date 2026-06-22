import { renderHook, act } from '@testing-library/react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { useAuth } from '@/hooks/useAuth';

type Cb = (user: unknown) => void;

function captureCb(mockFn: jest.Mock): { fire: Cb } {
  return {
    fire: (user) => {
      const callback = mockFn.mock.calls[mockFn.mock.calls.length - 1][1] as Cb;
      callback(user);
    },
  };
}

describe('useAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('starts with loading=true and user=null before the JS SDK resolves', () => {
    (onAuthStateChanged as jest.Mock).mockReturnValue(jest.fn());

    const { result } = renderHook(() => useAuth());

    expect(result.current.loading).toBe(true);
    expect(result.current.user).toBeNull();
  });

  it('exposes the user and clears loading when the JS SDK reports a user', async () => {
    (onAuthStateChanged as jest.Mock).mockReturnValue(jest.fn());
    const js = captureCb(onAuthStateChanged as jest.Mock);

    const user = { uid: 'abc', email: 'u@example.com' };
    const { result } = renderHook(() => useAuth());
    await act(async () => {
      js.fire(user);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.user).toEqual(user);
  });

  it('clears loading with user=null when the JS SDK reports signed-out', async () => {
    (onAuthStateChanged as jest.Mock).mockReturnValue(jest.fn());
    const js = captureCb(onAuthStateChanged as jest.Mock);

    const { result } = renderHook(() => useAuth());
    await act(async () => {
      js.fire(null);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it('clears the user when the JS SDK later signs out', async () => {
    (onAuthStateChanged as jest.Mock).mockReturnValue(jest.fn());
    const js = captureCb(onAuthStateChanged as jest.Mock);

    const { result } = renderHook(() => useAuth());
    await act(async () => {
      js.fire({ uid: 'abc' });
    });
    expect(result.current.user).toEqual({ uid: 'abc' });

    await act(async () => {
      js.fire(null);
    });
    expect(result.current.user).toBeNull();
  });

  it('unsubscribes the JS SDK listener on unmount', () => {
    const unsub = jest.fn();
    (onAuthStateChanged as jest.Mock).mockReturnValue(unsub);

    const { unmount } = renderHook(() => useAuth());
    unmount();

    expect(unsub).toHaveBeenCalledTimes(1);
  });
});
