import { markAsFinished, subscribeToReadingActivities } from './readingActivity';
import type { Book } from './searchBooks';

import {
  collection,
  doc,
  setDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';

const book: Book = {
  id: 'book123',
  title: 'The Great Gatsby',
  authors: ['F. Scott Fitzgerald'],
  thumbnail: 'https://example.com/cover.jpg',
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('markAsFinished', () => {
  it('writes to the readingActivities path', async () => {
    await markAsFinished('user1', book);
    expect(jest.mocked(doc)).toHaveBeenCalledWith(expect.anything(), 'readingActivities', expect.any(String));
  });

  it('uses a deterministic doc ID derived from userId and bookId', async () => {
    await markAsFinished('user1', book);
    expect(jest.mocked(doc)).toHaveBeenCalledWith(expect.anything(), 'readingActivities', 'user1_book123');
  });

  it('calls setDoc (not updateDoc)', async () => {
    await markAsFinished('user1', book);
    expect(jest.mocked(setDoc)).toHaveBeenCalled();
  });

  it('stores userId, bookId, title, authors, thumbnail, finishedAt, and status finished', async () => {
    await markAsFinished('user1', book);
    expect(jest.mocked(setDoc)).toHaveBeenCalledWith(
      expect.anything(),
      {
        userId: 'user1',
        bookId: 'book123',
        title: 'The Great Gatsby',
        authors: ['F. Scott Fitzgerald'],
        thumbnail: 'https://example.com/cover.jpg',
        finishedAt: expect.anything(),
        status: 'finished',
      },
    );
  });

  it('stores null thumbnail when book has no cover', async () => {
    await markAsFinished('user1', { ...book, thumbnail: null });
    expect(jest.mocked(setDoc)).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ thumbnail: null }),
    );
  });

  it('uses serverTimestamp for finishedAt', async () => {
    await markAsFinished('user1', book);
    expect(jest.mocked(serverTimestamp)).toHaveBeenCalled();
  });

  it('resolves without error', async () => {
    await expect(markAsFinished('user1', book)).resolves.toBeUndefined();
  });
});

describe('subscribeToReadingActivities', () => {
  it('queries the readingActivities collection filtered by userId', () => {
    subscribeToReadingActivities('user1', jest.fn());
    expect(jest.mocked(collection)).toHaveBeenCalledWith(expect.anything(), 'readingActivities');
    expect(jest.mocked(where)).toHaveBeenCalledWith('userId', '==', 'user1');
  });

  it('filters to only finished activities', () => {
    subscribeToReadingActivities('user1', jest.fn());
    expect(jest.mocked(where)).toHaveBeenCalledWith('status', '==', 'finished');
  });

  it('orders results by finishedAt descending', () => {
    subscribeToReadingActivities('user1', jest.fn());
    expect(jest.mocked(orderBy)).toHaveBeenCalledWith('finishedAt', 'desc');
  });

  it('calls onUpdate with mapped activities when snapshot arrives', () => {
    jest.mocked(onSnapshot).mockImplementationOnce((_q, onNext: any) => {
      onNext({
        docs: [
          {
            id: 'act1',
            data: () => ({
              userId: 'user1',
              bookId: 'book123',
              title: 'The Great Gatsby',
              authors: ['F. Scott Fitzgerald'],
              thumbnail: 'https://example.com/cover.jpg',
              status: 'finished',
              finishedAt: null,
            }),
          },
        ],
      });
      return jest.fn();
    });

    const onUpdate = jest.fn();
    subscribeToReadingActivities('user1', onUpdate);

    expect(onUpdate).toHaveBeenCalledWith([
      {
        id: 'act1',
        userId: 'user1',
        bookId: 'book123',
        title: 'The Great Gatsby',
        authors: ['F. Scott Fitzgerald'],
        thumbnail: 'https://example.com/cover.jpg',
        status: 'finished',
        finishedAt: null,
      },
    ]);
  });

  it('calls onUpdate with empty array when no docs', () => {
    jest.mocked(onSnapshot).mockImplementationOnce((_q, onNext: any) => {
      onNext({ docs: [] });
      return jest.fn();
    });

    const onUpdate = jest.fn();
    subscribeToReadingActivities('user1', onUpdate);

    expect(onUpdate).toHaveBeenCalledWith([]);
  });

  it('calls onError when the snapshot listener errors', () => {
    const testError = new Error('permission denied');
    jest.mocked(onSnapshot).mockImplementationOnce((_q, _onNext: any, onError: any) => {
      onError(testError);
      return jest.fn();
    });

    const onUpdate = jest.fn();
    const onError = jest.fn();
    subscribeToReadingActivities('user1', onUpdate, onError);

    expect(onError).toHaveBeenCalledWith(testError);
    expect(onUpdate).not.toHaveBeenCalled();
  });

  it('does not throw when onError is not provided and listener errors', () => {
    const testError = new Error('permission denied');
    jest.mocked(onSnapshot).mockImplementationOnce((_q, _onNext: any, onError: any) => {
      onError(testError);
      return jest.fn();
    });

    expect(() => subscribeToReadingActivities('user1', jest.fn())).not.toThrow();
  });

  it('returns the unsubscribe function', () => {
    const unsubscribe = subscribeToReadingActivities('user1', jest.fn());
    expect(typeof unsubscribe).toBe('function');
  });
});
