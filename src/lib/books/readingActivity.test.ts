import { startReading, subscribeToReadingActivities } from './readingActivity';
import type { Book } from './searchBooks';

jest.mock('@react-native-firebase/firestore');

import firestore from '@react-native-firebase/firestore';

const { mockSet, mockDoc, mockOnSnapshot } = (firestore as any).__mocks;

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
  it('writes to the readingActivities collection', async () => {
    await startReading('user1', book);
    const db = (firestore as jest.Mock)();
    expect(db.collection).toHaveBeenCalledWith('readingActivities');
  });

  it('uses a deterministic doc ID derived from userId and bookId', async () => {
    await startReading('user1', book);
    expect(mockDoc).toHaveBeenCalledWith('user1_book123');
  });

  it('stores userId, bookId, title, authors, thumbnail, and startedAt', async () => {
    await startReading('user1', book);
    expect(mockSet).toHaveBeenCalledWith({
      userId: 'user1',
      bookId: 'book123',
      title: 'The Great Gatsby',
      authors: ['F. Scott Fitzgerald'],
      thumbnail: 'https://example.com/cover.jpg',
      startedAt: expect.anything(),
    });
  });

  it('stores null thumbnail when book has no cover', async () => {
    await startReading('user1', { ...book, thumbnail: null });
    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({ thumbnail: null }),
    );
  });

  it('resolves without error', async () => {
    await expect(startReading('user1', book)).resolves.toBeUndefined();
  });
});

describe('subscribeToReadingActivities', () => {
  it('queries the readingActivities collection filtered by userId', () => {
    subscribeToReadingActivities('user1', jest.fn());
    const db = (firestore as jest.Mock)();
    expect(db.collection).toHaveBeenCalledWith('readingActivities');
    const collRef = db.collection('readingActivities');
    expect(collRef.where).toHaveBeenCalledWith('userId', '==', 'user1');
  });

  it('orders results by startedAt descending', () => {
    subscribeToReadingActivities('user1', jest.fn());
    const db = (firestore as jest.Mock)();
    const collRef = db.collection('readingActivities');
    const query = collRef.where('userId', '==', 'user1');
    expect(query.orderBy).toHaveBeenCalledWith('startedAt', 'desc');
  });

  it('calls onUpdate with mapped activities when snapshot arrives', () => {
    mockOnSnapshot.mockImplementationOnce((onNext: Function) => {
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
    mockOnSnapshot.mockImplementationOnce((onNext: Function) => {
      onNext({ docs: [] });
      return jest.fn();
    });

    const onUpdate = jest.fn();
    subscribeToReadingActivities('user1', onUpdate);

    expect(onUpdate).toHaveBeenCalledWith([]);
  });

  it('calls onError when the snapshot listener errors', () => {
    const testError = new Error('permission denied');
    mockOnSnapshot.mockImplementationOnce((_onNext: Function, onError: Function) => {
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
    mockOnSnapshot.mockImplementationOnce((_onNext: Function, onError: Function) => {
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
