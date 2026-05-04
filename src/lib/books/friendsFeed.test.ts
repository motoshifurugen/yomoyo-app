import { getFriendsFeed } from './friendsFeed';
import { collection, query, where, orderBy, limit, startAfter, getDocs } from 'firebase/firestore';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('getFriendsFeed', () => {
  it('returns an empty page immediately when followedUids is empty', async () => {
    const result = await getFriendsFeed([]);
    expect(result).toEqual({ items: [], lastDoc: null });
    expect(jest.mocked(getDocs)).not.toHaveBeenCalled();
  });

  it('queries the readingActivities collection', async () => {
    await getFriendsFeed(['uid1']);
    expect(jest.mocked(collection)).toHaveBeenCalledWith(expect.anything(), 'readingActivities');
  });

  it('filters by userId in the given uids', async () => {
    await getFriendsFeed(['uid1', 'uid2']);
    expect(jest.mocked(where)).toHaveBeenCalledWith('userId', 'in', ['uid1', 'uid2']);
  });

  it('orders results by finishedAt descending', async () => {
    await getFriendsFeed(['uid1']);
    expect(jest.mocked(orderBy)).toHaveBeenCalledWith('finishedAt', 'desc');
  });

  it('applies a default limit of 20', async () => {
    await getFriendsFeed(['uid1']);
    expect(jest.mocked(limit)).toHaveBeenCalledWith(20);
  });

  it('applies a custom page size when provided', async () => {
    await getFriendsFeed(['uid1'], null, 5);
    expect(jest.mocked(limit)).toHaveBeenCalledWith(5);
  });

  it('does not call startAfter when cursor is null', async () => {
    await getFriendsFeed(['uid1'], null);
    expect(jest.mocked(startAfter)).not.toHaveBeenCalled();
  });

  it('calls startAfter with the cursor when provided', async () => {
    const mockCursor = { id: 'cursor-doc' };
    await getFriendsFeed(['uid1'], mockCursor as any);
    expect(jest.mocked(startAfter)).toHaveBeenCalledWith(mockCursor);
  });

  it('maps docs to items with id', async () => {
    jest.mocked(getDocs).mockResolvedValueOnce({
      docs: [
        {
          id: 'act1',
          data: () => ({
            userId: 'user2',
            bookId: 'book1',
            title: 'Dune',
            authors: ['Frank Herbert'],
            thumbnail: null,
            status: 'finished',
            finishedAt: null,
            displayLabel: 'Alice',
            displayAvatar: null,
          }),
        },
      ],
    } as any);

    const result = await getFriendsFeed(['user2']);
    expect(result.items).toEqual([
      {
        id: 'act1',
        userId: 'user2',
        bookId: 'book1',
        title: 'Dune',
        authors: ['Frank Herbert'],
        thumbnail: null,
        status: 'finished',
        finishedAt: null,
        displayLabel: 'Alice',
        displayAvatar: null,
      },
    ]);
  });

  it('returns lastDoc as the last document snapshot', async () => {
    const mockDoc = { id: 'act1', data: () => ({}) };
    jest.mocked(getDocs).mockResolvedValueOnce({ docs: [mockDoc] } as any);

    const result = await getFriendsFeed(['user2']);
    expect(result.lastDoc).toBe(mockDoc);
  });

  it('returns lastDoc as null when no docs are returned', async () => {
    jest.mocked(getDocs).mockResolvedValueOnce({ docs: [] } as any);

    const result = await getFriendsFeed(['user2']);
    expect(result.lastDoc).toBeNull();
  });
});
