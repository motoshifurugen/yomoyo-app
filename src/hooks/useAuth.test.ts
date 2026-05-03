import { renderHook, act } from '@testing-library/react-native';
import { onAuthStateChanged } from '@react-native-firebase/auth';
import { useAuth } from '@/hooks/useAuth';

jest.mock('@react-native-firebase/auth');

describe('useAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('starts with loading=true and user=null before state resolves', () => {
    jest.mocked(onAuthStateChanged).mockReturnValue(jest.fn());

    const { result } = renderHook(() => useAuth());

    expect(result.current.loading).toBe(true);
    expect(result.current.user).toBeNull();
  });

  it('sets loading=false and user=null when signed out', async () => {
    jest.mocked(onAuthStateChanged).mockImplementation((_auth, cb) => {
      (cb as Function)(null);
      return jest.fn();
    });

    const { result } = renderHook(() => useAuth());
    await act(async () => {});

    expect(result.current.loading).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it('sets loading=false and returns user when signed in', async () => {
    const mockUser = { uid: 'abc123', email: 'user@example.com' };
    jest.mocked(onAuthStateChanged).mockImplementation((_auth, cb) => {
      (cb as Function)(mockUser);
      return jest.fn();
    });

    const { result } = renderHook(() => useAuth());
    await act(async () => {});

    expect(result.current.loading).toBe(false);
    expect(result.current.user).toEqual(mockUser);
  });

  it('unsubscribes from auth state on unmount', () => {
    const unsubscribe = jest.fn();
    jest.mocked(onAuthStateChanged).mockReturnValue(unsubscribe);

    const { unmount } = renderHook(() => useAuth());
    unmount();

    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });
});
