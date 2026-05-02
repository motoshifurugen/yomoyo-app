import auth from '@react-native-firebase/auth';
import { signOut } from '@/lib/auth';

jest.mock('@react-native-firebase/auth');

describe('signOut', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls Firebase auth signOut', async () => {
    (auth as jest.Mock)().signOut.mockResolvedValue(undefined);

    await signOut();

    expect((auth as jest.Mock)().signOut).toHaveBeenCalledTimes(1);
  });
});
