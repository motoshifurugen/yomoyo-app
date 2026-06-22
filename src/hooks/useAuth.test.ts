import { renderHook, act } from '@testing-library/react-native';
import { onAuthStateChanged as nativeOnAuthStateChanged } from '@react-native-firebase/auth';
import { onAuthStateChanged as jsOnAuthStateChanged } from 'firebase/auth';
import { useAuth } from '@/hooks/useAuth';

jest.mock('@react-native-firebase/auth');

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

  it('starts with loading=true and user=null before either client resolves', () => {
    jest.mocked(nativeOnAuthStateChanged).mockReturnValue(jest.fn());
    (jsOnAuthStateChanged as jest.Mock).mockReturnValue(jest.fn());

    const { result } = renderHook(() => useAuth());

    expect(result.current.loading).toBe(true);
    expect(result.current.user).toBeNull();
  });

  it('stays loading until BOTH native and JS SDK auth have settled', async () => {
    jest.mocked(nativeOnAuthStateChanged).mockReturnValue(jest.fn());
    (jsOnAuthStateChanged as jest.Mock).mockReturnValue(jest.fn());

    const native = captureCb(nativeOnAuthStateChanged as unknown as jest.Mock);
    const js = captureCb(jsOnAuthStateChanged as jest.Mock);

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      native.fire({ uid: 'abc' });
    });
    expect(result.current.loading).toBe(true);

    await act(async () => {
      js.fire({ uid: 'abc' });
    });
    expect(result.current.loading).toBe(false);
    expect(result.current.user).toEqual({ uid: 'abc' });
  });

  it('flips loading=false when both clients report signed-out', async () => {
    jest.mocked(nativeOnAuthStateChanged).mockReturnValue(jest.fn());
    (jsOnAuthStateChanged as jest.Mock).mockReturnValue(jest.fn());

    const native = captureCb(nativeOnAuthStateChanged as unknown as jest.Mock);
    const js = captureCb(jsOnAuthStateChanged as jest.Mock);

    const { result } = renderHook(() => useAuth());
    await act(async () => {
      native.fire(null);
      js.fire(null);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it('exposes the native user as the primary user source', async () => {
    jest.mocked(nativeOnAuthStateChanged).mockReturnValue(jest.fn());
    (jsOnAuthStateChanged as jest.Mock).mockReturnValue(jest.fn());

    const native = captureCb(nativeOnAuthStateChanged as unknown as jest.Mock);
    const js = captureCb(jsOnAuthStateChanged as jest.Mock);

    const nativeUser = { uid: 'native-abc', email: 'u@example.com' };
    const { result } = renderHook(() => useAuth());
    await act(async () => {
      native.fire(nativeUser);
      js.fire({ uid: 'native-abc' });
    });

    expect(result.current.user).toEqual(nativeUser);
  });

  it('does not expose a user until the JS SDK is also authenticated', async () => {
    jest.mocked(nativeOnAuthStateChanged).mockReturnValue(jest.fn());
    (jsOnAuthStateChanged as jest.Mock).mockReturnValue(jest.fn());

    const native = captureCb(nativeOnAuthStateChanged as unknown as jest.Mock);
    const js = captureCb(jsOnAuthStateChanged as jest.Mock);

    const { result } = renderHook(() => useAuth());

    // Fresh sign-in: the native client authenticates first while the JS SDK
    // bridge is still pending. Exposing the user now would let Firestore queries
    // fire before request.auth is set (permission-denied race).
    await act(async () => {
      native.fire({ uid: 'abc' });
      js.fire(null);
    });
    expect(result.current.user).toBeNull();

    // Bridge completes: the JS SDK (which Firestore uses) is now authenticated.
    await act(async () => {
      js.fire({ uid: 'abc' });
    });
    expect(result.current.user).toEqual({ uid: 'abc' });
  });

  it('clears the user as soon as the JS SDK signs out', async () => {
    jest.mocked(nativeOnAuthStateChanged).mockReturnValue(jest.fn());
    (jsOnAuthStateChanged as jest.Mock).mockReturnValue(jest.fn());

    const native = captureCb(nativeOnAuthStateChanged as unknown as jest.Mock);
    const js = captureCb(jsOnAuthStateChanged as jest.Mock);

    const { result } = renderHook(() => useAuth());
    await act(async () => {
      native.fire({ uid: 'abc' });
      js.fire({ uid: 'abc' });
    });
    expect(result.current.user).toEqual({ uid: 'abc' });

    await act(async () => {
      js.fire(null);
    });
    expect(result.current.user).toBeNull();
  });

  it('unsubscribes from both auth listeners on unmount', () => {
    const nativeUnsub = jest.fn();
    const jsUnsub = jest.fn();
    jest.mocked(nativeOnAuthStateChanged).mockReturnValue(nativeUnsub);
    (jsOnAuthStateChanged as jest.Mock).mockReturnValue(jsUnsub);

    const { unmount } = renderHook(() => useAuth());
    unmount();

    expect(nativeUnsub).toHaveBeenCalledTimes(1);
    expect(jsUnsub).toHaveBeenCalledTimes(1);
  });
});
