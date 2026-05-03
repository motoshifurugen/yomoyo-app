import { signOut as firebaseSignOut } from '@react-native-firebase/auth';
import { signOut } from '@/lib/auth';

jest.mock('@react-native-firebase/auth');

describe('signOut', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls Firebase signOut', async () => {
    jest.mocked(firebaseSignOut).mockResolvedValue(undefined);

    await signOut();

    expect(jest.mocked(firebaseSignOut)).toHaveBeenCalledTimes(1);
  });
});
