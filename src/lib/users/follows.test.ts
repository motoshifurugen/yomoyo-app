import {
  getFollowingUids,
  followUser,
  unfollowUser,
  isFollowing,
  getFollowingProfiles,
} from './follows';
import { collection, query, where, getDocs, doc, setDoc, deleteDoc, getDoc, serverTimestamp } from 'firebase/firestore';

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

describe('followUser', () => {
  it('writes to the follows collection with a deterministic doc ID', async () => {
    await followUser('user1', 'user2');
    expect(jest.mocked(doc)).toHaveBeenCalledWith(expect.anything(), 'follows', 'user1_user2');
  });

  it('sets followerId and followedUid fields', async () => {
    await followUser('user1', 'user2');
    expect(jest.mocked(setDoc)).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ followerId: 'user1', followedUid: 'user2' }),
    );
  });

  it('includes a createdAt server timestamp', async () => {
    await followUser('user1', 'user2');
    expect(jest.mocked(setDoc)).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ createdAt: expect.anything() }),
    );
    expect(jest.mocked(serverTimestamp)).toHaveBeenCalled();
  });
});

describe('unfollowUser', () => {
  it('deletes the follow document by deterministic ID', async () => {
    await unfollowUser('user1', 'user2');
    expect(jest.mocked(doc)).toHaveBeenCalledWith(expect.anything(), 'follows', 'user1_user2');
    expect(jest.mocked(deleteDoc)).toHaveBeenCalled();
  });
});

describe('isFollowing', () => {
  it('checks the follow document by deterministic ID', async () => {
    await isFollowing('user1', 'user2');
    expect(jest.mocked(doc)).toHaveBeenCalledWith(expect.anything(), 'follows', 'user1_user2');
    expect(jest.mocked(getDoc)).toHaveBeenCalled();
  });

  it('returns true when the document exists', async () => {
    jest.mocked(getDoc).mockResolvedValueOnce({ exists: () => true, data: () => ({}) } as any);
    const result = await isFollowing('user1', 'user2');
    expect(result).toBe(true);
  });

  it('returns false when the document does not exist', async () => {
    jest.mocked(getDoc).mockResolvedValueOnce({ exists: () => false, data: () => undefined } as any);
    const result = await isFollowing('user1', 'user2');
    expect(result).toBe(false);
  });
});

describe('getFollowingProfiles', () => {
  it('returns an empty array when the user follows nobody', async () => {
    jest.mocked(getDocs).mockResolvedValueOnce({ docs: [] } as any);
    const result = await getFollowingProfiles('user1');
    expect(result).toEqual([]);
  });

  it('fetches user documents and returns displayName for each followed uid', async () => {
    jest.mocked(getDocs).mockResolvedValueOnce({
      docs: [{ id: 'user1_user2', data: () => ({ followerId: 'user1', followedUid: 'user2' }) }],
    } as any);
    jest.mocked(getDoc).mockResolvedValueOnce({
      exists: () => true,
      data: () => ({ displayName: 'New Name', animalKey: 'fox' }),
    } as any);

    const result = await getFollowingProfiles('user1');
    expect(jest.mocked(doc)).toHaveBeenCalledWith(expect.anything(), 'users', 'user2');
    expect(result).toEqual([{ uid: 'user2', displayName: 'New Name', animalKey: 'fox' }]);
  });

  it('falls back to legacy displayLabel when displayName is absent', async () => {
    jest.mocked(getDocs).mockResolvedValueOnce({
      docs: [{ id: 'user1_user2', data: () => ({ followerId: 'user1', followedUid: 'user2' }) }],
    } as any);
    jest.mocked(getDoc).mockResolvedValueOnce({
      exists: () => true,
      data: () => ({ displayLabel: 'Quiet Fox', animalKey: 'fox' }),
    } as any);

    const result = await getFollowingProfiles('user1');
    expect(result).toEqual([{ uid: 'user2', displayName: 'Quiet Fox', animalKey: 'fox' }]);
  });

  it('omits users whose documents do not exist', async () => {
    jest.mocked(getDocs).mockResolvedValueOnce({
      docs: [{ id: 'user1_user2', data: () => ({ followerId: 'user1', followedUid: 'user2' }) }],
    } as any);
    jest.mocked(getDoc).mockResolvedValueOnce({
      exists: () => false,
      data: () => undefined,
    } as any);

    const result = await getFollowingProfiles('user1');
    expect(result).toEqual([]);
  });

  it('omits users with incomplete profile data', async () => {
    jest.mocked(getDocs).mockResolvedValueOnce({
      docs: [{ id: 'user1_user2', data: () => ({ followerId: 'user1', followedUid: 'user2' }) }],
    } as any);
    jest.mocked(getDoc).mockResolvedValueOnce({
      exists: () => true,
      data: () => ({ animalKey: 'fox' }), // missing both displayName and displayLabel
    } as any);

    const result = await getFollowingProfiles('user1');
    expect(result).toEqual([]);
  });

  it('returns remaining profiles when one doc fetch rejects', async () => {
    jest.mocked(getDocs).mockResolvedValueOnce({
      docs: [
        { id: 'user1_user2', data: () => ({ followerId: 'user1', followedUid: 'user2' }) },
        { id: 'user1_user3', data: () => ({ followerId: 'user1', followedUid: 'user3' }) },
      ],
    } as any);
    jest.mocked(getDoc)
      .mockRejectedValueOnce(new Error('network error'))
      .mockResolvedValueOnce({
        exists: () => true,
        data: () => ({ displayName: 'Wise Bear', animalKey: 'bear' }),
      } as any);

    const result = await getFollowingProfiles('user1');
    expect(result).toEqual([{ uid: 'user3', displayName: 'Wise Bear', animalKey: 'bear' }]);
  });
});
