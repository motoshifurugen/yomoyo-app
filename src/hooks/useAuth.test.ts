import { renderHook, act } from '@testing-library/react-native';
import auth from '@react-native-firebase/auth';
import { useAuth } from '@/hooks/useAuth';

jest.mock('@react-native-firebase/auth');

const mockAuth = auth as jest.MockedFunction<typeof auth>;

describe('useAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('starts with loading=true and user=null before state resolves', () => {
    mockAuth().onAuthStateChanged.mockReturnValue(jest.fn());

    const { result } = renderHook(() => useAuth());

    expect(result.current.loading).toBe(true);
    expect(result.current.user).toBeNull();
  });

  it('sets loading=false and user=null when signed out', async () => {
    mockAuth().onAuthStateChanged.mockImplementation((cb: (user: null) => void) => {
      cb(null);
      return jest.fn();
    });

    const { result } = renderHook(() => useAuth());
    await act(async () => {});

    expect(result.current.loading).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it('sets loading=false and returns user when signed in', async () => {
    const mockUser = { uid: 'abc123', email: 'user@example.com' };
    mockAuth().onAuthStateChanged.mockImplementation((cb: (user: typeof mockUser) => void) => {
      cb(mockUser);
      return jest.fn();
    });

    const { result } = renderHook(() => useAuth());
    await act(async () => {});

    expect(result.current.loading).toBe(false);
    expect(result.current.user).toEqual(mockUser);
  });

  it('unsubscribes from auth state on unmount', () => {
    const unsubscribe = jest.fn();
    mockAuth().onAuthStateChanged.mockReturnValue(unsubscribe);

    const { unmount } = renderHook(() => useAuth());
    unmount();

    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });
});
