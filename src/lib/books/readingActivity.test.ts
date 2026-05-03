import { startReading, subscribeToReadingActivities } from './readingActivity';
import type { Book } from './searchBooks';

jest.mock('@react-native-firebase/firestore');

import {
  collection,
  doc,
  setDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from '@react-native-firebase/firestore';

const book: Book = {
  id: 'book123',
  title: 'The Great Gatsby',
  authors: ['F. Scott Fitzgerald'],
  thumbnail: 'https://example.com/cover.jpg',
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('startReading', () => {
  it('writes to the readingActivities path', async () => {
    await startReading('user1', book);
    expect(jest.mocked(doc)).toHaveBeenCalledWith(expect.anything(), 'readingActivities', expect.any(String));
  });

  it('uses a deterministic doc ID derived from userId and bookId', async () => {
    await startReading('user1', book);
    expect(jest.mocked(doc)).toHaveBeenCalledWith(expect.anything(), 'readingActivities', 'user1_book123');
  });

  it('stores userId, bookId, title, authors, thumbnail, and startedAt', async () => {
    await startReading('user1', book);
    expect(jest.mocked(setDoc)).toHaveBeenCalledWith(
      expect.anything(),
      {
        userId: 'user1',
        bookId: 'book123',
        title: 'The Great Gatsby',
        authors: ['F. Scott Fitzgerald'],
        thumbnail: 'https://example.com/cover.jpg',
        startedAt: expect.anything(),
      },
    );
  });

  it('stores null thumbnail when book has no cover', async () => {
    await startReading('user1', { ...book, thumbnail: null });
    expect(jest.mocked(setDoc)).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ thumbnail: null }),
    );
  });

  it('uses serverTimestamp for startedAt', async () => {
    await startReading('user1', book);
    expect(jest.mocked(serverTimestamp)).toHaveBeenCalled();
  });

  it('resolves without error', async () => {
    await expect(startReading('user1', book)).resolves.toBeUndefined();
  });
});

describe('subscribeToReadingActivities', () => {
  it('queries the readingActivities collection filtered by userId', () => {
    subscribeToReadingActivities('user1', jest.fn());
    expect(jest.mocked(collection)).toHaveBeenCalledWith(expect.anything(), 'readingActivities');
    expect(jest.mocked(where)).toHaveBeenCalledWith('userId', '==', 'user1');
  });

  it('orders results by startedAt descending', () => {
    subscribeToReadingActivities('user1', jest.fn());
    expect(jest.mocked(orderBy)).toHaveBeenCalledWith('startedAt', 'desc');
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
              startedAt: null,
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
        startedAt: null,
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
