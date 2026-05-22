import {
  addBookmark,
  removeBookmark,
  getBookmarkIds,
  getBookmarkedActivities,
} from './bookmarks';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDoc,
  getDocs,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
} from 'firebase/firestore';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('addBookmark', () => {
  it('writes to the per-user bookmarks subcollection', async () => {
    await addBookmark('user1', 'act1');
    expect(jest.mocked(doc)).toHaveBeenCalledWith(
      expect.anything(),
      'users',
      'user1',
      'bookmarks',
      'act1',
    );
  });

  it('stores the activityId field for read-back convenience', async () => {
    await addBookmark('user1', 'act1');
    expect(jest.mocked(setDoc)).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ activityId: 'act1' }),
    );
  });

  it('includes a bookmarkedAt server timestamp', async () => {
    await addBookmark('user1', 'act1');
    expect(jest.mocked(setDoc)).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ bookmarkedAt: expect.anything() }),
    );
    expect(jest.mocked(serverTimestamp)).toHaveBeenCalled();
  });
});

describe('removeBookmark', () => {
  it('deletes the bookmark document at the per-user path', async () => {
    await removeBookmark('user1', 'act1');
    expect(jest.mocked(doc)).toHaveBeenCalledWith(
      expect.anything(),
      'users',
      'user1',
      'bookmarks',
      'act1',
    );
    expect(jest.mocked(deleteDoc)).toHaveBeenCalled();
  });
});

describe('getBookmarkIds', () => {
  it('queries the per-user bookmarks subcollection', async () => {
    await getBookmarkIds('user1');
    expect(jest.mocked(collection)).toHaveBeenCalledWith(
      expect.anything(),
      'users',
      'user1',
      'bookmarks',
    );
  });

  it('returns a Set of activity IDs from the doc ids', async () => {
    jest.mocked(getDocs).mockResolvedValueOnce({
      docs: [
        { id: 'act1', data: () => ({ activityId: 'act1' }) },
        { id: 'act2', data: () => ({ activityId: 'act2' }) },
      ],
    } as any);

    const result = await getBookmarkIds('user1');
    expect(result).toBeInstanceOf(Set);
    expect(result.has('act1')).toBe(true);
    expect(result.has('act2')).toBe(true);
    expect(result.size).toBe(2);
  });

  it('returns an empty Set when the user has no bookmarks', async () => {
    jest.mocked(getDocs).mockResolvedValueOnce({ docs: [] } as any);
    const result = await getBookmarkIds('user1');
    expect(result.size).toBe(0);
  });
});

describe('getBookmarkedActivities', () => {
  it('returns an empty page when there are no bookmark docs', async () => {
    jest.mocked(getDocs).mockResolvedValueOnce({ docs: [] } as any);
    const result = await getBookmarkedActivities('user1', null);
    expect(result).toEqual({ items: [], lastDoc: null });
  });

  it('queries the per-user bookmarks subcollection', async () => {
    jest.mocked(getDocs).mockResolvedValueOnce({ docs: [] } as any);
    await getBookmarkedActivities('user1', null);
    expect(jest.mocked(collection)).toHaveBeenCalledWith(
      expect.anything(),
      'users',
      'user1',
      'bookmarks',
    );
  });

  it('orders by bookmarkedAt descending', async () => {
    jest.mocked(getDocs).mockResolvedValueOnce({ docs: [] } as any);
    await getBookmarkedActivities('user1', null);
    expect(jest.mocked(orderBy)).toHaveBeenCalledWith('bookmarkedAt', 'desc');
  });

  it('applies a default page size limit', async () => {
    jest.mocked(getDocs).mockResolvedValueOnce({ docs: [] } as any);
    await getBookmarkedActivities('user1', null);
    expect(jest.mocked(limit)).toHaveBeenCalled();
  });

  it('does not call startAfter when cursor is null', async () => {
    jest.mocked(getDocs).mockResolvedValueOnce({ docs: [] } as any);
    await getBookmarkedActivities('user1', null);
    expect(jest.mocked(startAfter)).not.toHaveBeenCalled();
  });

  it('applies startAfter when a cursor is provided', async () => {
    const cursor = { id: 'cursor-doc' } as any;
    jest.mocked(getDocs).mockResolvedValueOnce({ docs: [] } as any);
    await getBookmarkedActivities('user1', cursor);
    expect(jest.mocked(startAfter)).toHaveBeenCalledWith(cursor);
  });

  it('resolves each bookmark to its readingActivities document', async () => {
    jest.mocked(getDocs).mockResolvedValueOnce({
      docs: [
        { id: 'act1', data: () => ({ activityId: 'act1' }) },
      ],
    } as any);
    jest.mocked(getDoc).mockResolvedValueOnce({
      exists: () => true,
      id: 'act1',
      data: () => ({
        userId: 'user2',
        bookId: 'book1',
        title: 'Dune',
        authors: ['Frank Herbert'],
        thumbnail: null,
        status: 'finished',
        finishedAt: null,
        displayName: 'Bold Bear',
        displayAvatar: 'bear',
      }),
    } as any);

    const result = await getBookmarkedActivities('user1', null);
    expect(jest.mocked(doc)).toHaveBeenCalledWith(
      expect.anything(),
      'readingActivities',
      'act1',
    );
    expect(result.items).toHaveLength(1);
    expect(result.items[0]).toMatchObject({
      id: 'act1',
      title: 'Dune',
      userId: 'user2',
    });
  });

  it('silently skips bookmarks whose activity has been deleted', async () => {
    jest.mocked(getDocs).mockResolvedValueOnce({
      docs: [
        { id: 'act1', data: () => ({ activityId: 'act1' }) },
        { id: 'act2', data: () => ({ activityId: 'act2' }) },
      ],
    } as any);
    jest
      .mocked(getDoc)
      .mockResolvedValueOnce({
        exists: () => false,
        id: 'act1',
        data: () => undefined,
      } as any)
      .mockResolvedValueOnce({
        exists: () => true,
        id: 'act2',
        data: () => ({
          userId: 'user2',
          bookId: 'book2',
          title: 'Kindred',
          authors: ['Octavia Butler'],
          thumbnail: null,
          status: 'finished',
          finishedAt: null,
          displayName: 'Quiet Fox',
          displayAvatar: 'fox',
        }),
      } as any);

    const result = await getBookmarkedActivities('user1', null);
    expect(result.items).toHaveLength(1);
    expect(result.items[0].id).toBe('act2');
  });

  it('preserves bookmark order even if one fetch is slower than another', async () => {
    jest.mocked(getDocs).mockResolvedValueOnce({
      docs: [
        { id: 'first', data: () => ({ activityId: 'first' }) },
        { id: 'second', data: () => ({ activityId: 'second' }) },
      ],
    } as any);
    jest
      .mocked(getDoc)
      .mockResolvedValueOnce({
        exists: () => true,
        id: 'first',
        data: () => ({
          userId: 'u',
          bookId: 'b1',
          title: 'A',
          authors: [],
          thumbnail: null,
          status: 'finished',
          finishedAt: null,
        }),
      } as any)
      .mockResolvedValueOnce({
        exists: () => true,
        id: 'second',
        data: () => ({
          userId: 'u',
          bookId: 'b2',
          title: 'B',
          authors: [],
          thumbnail: null,
          status: 'finished',
          finishedAt: null,
        }),
      } as any);

    const result = await getBookmarkedActivities('user1', null);
    expect(result.items.map((i) => i.id)).toEqual(['first', 'second']);
  });

  it('returns lastDoc as the last bookmark doc snapshot for pagination', async () => {
    const lastBookmarkDoc = {
      id: 'act-last',
      data: () => ({ activityId: 'act-last' }),
    };
    jest.mocked(getDocs).mockResolvedValueOnce({ docs: [lastBookmarkDoc] } as any);
    jest.mocked(getDoc).mockResolvedValueOnce({
      exists: () => true,
      id: 'act-last',
      data: () => ({
        userId: 'u',
        bookId: 'b',
        title: 't',
        authors: [],
        thumbnail: null,
        status: 'finished',
        finishedAt: null,
      }),
    } as any);

    const result = await getBookmarkedActivities('user1', null);
    expect(result.lastDoc).toBe(lastBookmarkDoc);
  });

  it('returns lastDoc null when no bookmarks were fetched', async () => {
    jest.mocked(getDocs).mockResolvedValueOnce({ docs: [] } as any);
    const result = await getBookmarkedActivities('user1', null);
    expect(result.lastDoc).toBeNull();
  });
});
