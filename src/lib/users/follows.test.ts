import { getFollowingUids } from './follows';
import { collection, query, where, getDocs } from 'firebase/firestore';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('getFollowingUids', () => {
  it('queries the follows collection', async () => {
    await getFollowingUids('user1');
    expect(jest.mocked(collection)).toHaveBeenCalledWith(expect.anything(), 'follows');
  });

  it('filters by followerId', async () => {
    await getFollowingUids('user1');
    expect(jest.mocked(where)).toHaveBeenCalledWith('followerId', '==', 'user1');
  });

  it('returns an array of followedUid strings', async () => {
    jest.mocked(getDocs).mockResolvedValueOnce({
      docs: [
        { id: 'user1_user2', data: () => ({ followerId: 'user1', followedUid: 'user2' }) },
        { id: 'user1_user3', data: () => ({ followerId: 'user1', followedUid: 'user3' }) },
      ],
    } as any);

    const result = await getFollowingUids('user1');
    expect(result).toEqual(['user2', 'user3']);
  });

  it('returns an empty array when the user follows nobody', async () => {
    jest.mocked(getDocs).mockResolvedValueOnce({ docs: [] } as any);

    const result = await getFollowingUids('user1');
    expect(result).toEqual([]);
  });
});
