import { getTimeline } from './timeline';
import { collection, query, where, orderBy, limit, startAfter, getDocs } from 'firebase/firestore';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('getTimeline', () => {
  it('queries the readingActivities collection', async () => {
    await getTimeline();
    expect(jest.mocked(collection)).toHaveBeenCalledWith(expect.anything(), 'readingActivities');
  });

  it('filters by status finished', async () => {
    await getTimeline();
    expect(jest.mocked(where)).toHaveBeenCalledWith('status', '==', 'finished');
  });

  it('orders results by finishedAt descending', async () => {
    await getTimeline();
    expect(jest.mocked(orderBy)).toHaveBeenCalledWith('finishedAt', 'desc');
  });

  it('applies a default limit of 20', async () => {
    await getTimeline();
    expect(jest.mocked(limit)).toHaveBeenCalledWith(20);
  });

  it('applies a custom page size when provided', async () => {
    await getTimeline(null, 5);
    expect(jest.mocked(limit)).toHaveBeenCalledWith(5);
  });

  it('does not call startAfter when cursor is null', async () => {
    await getTimeline(null);
    expect(jest.mocked(startAfter)).not.toHaveBeenCalled();
  });

  it('calls startAfter with the cursor when provided', async () => {
    const mockCursor = { id: 'cursor-doc' };
    await getTimeline(mockCursor as any);
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
            displayLabel: 'Bold Bear',
            displayAvatar: 'bear',
          }),
        },
      ],
    } as any);

    const result = await getTimeline();
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
        displayLabel: 'Bold Bear',
        displayAvatar: 'bear',
      },
    ]);
  });

  it('returns lastDoc as the last document snapshot', async () => {
    const mockDoc = { id: 'act1', data: () => ({}) };
    jest.mocked(getDocs).mockResolvedValueOnce({ docs: [mockDoc] } as any);

    const result = await getTimeline();
    expect(result.lastDoc).toBe(mockDoc);
  });

  it('returns lastDoc as null when no docs are returned', async () => {
    jest.mocked(getDocs).mockResolvedValueOnce({ docs: [] } as any);

    const result = await getTimeline();
    expect(result.lastDoc).toBeNull();
  });
});
