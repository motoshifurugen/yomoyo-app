jest.mock('./coverFallback', () => ({
  resolveCoverForIsbn: jest.fn(),
}));

import { isIsbn13, lookupByIsbn } from './openBD';
import { resolveCoverForIsbn } from './coverFallback';

const mockResolveCover = resolveCoverForIsbn as jest.Mock;

describe('isIsbn13', () => {
  it('returns true for a valid 978-prefixed ISBN-13', () => {
    expect(isIsbn13('9784101001456')).toBe(true);
  });

  it('returns true for a valid 979-prefixed ISBN-13', () => {
    expect(isIsbn13('9790000000001')).toBe(true);
  });

  it('returns false for the wrong length', () => {
    expect(isIsbn13('978410100145')).toBe(false);
    expect(isIsbn13('97841010014567')).toBe(false);
  });

  it('returns false for non-digit characters', () => {
    expect(isIsbn13('978410100145X')).toBe(false);
    expect(isIsbn13('9784-1010-0145-6')).toBe(false);
  });

  it('returns false for prefixes other than 978 / 979', () => {
    expect(isIsbn13('1234567890128')).toBe(false);
  });

  it('returns false when the checksum is wrong', () => {
    expect(isIsbn13('9784101001457')).toBe(false);
  });

  it('returns false for empty input', () => {
    expect(isIsbn13('')).toBe(false);
  });
});

describe('lookupByIsbn', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    mockResolveCover.mockReset();
    mockResolveCover.mockResolvedValue(null);
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  function mockFetch(body: unknown, init: { ok?: boolean; status?: number } = {}) {
    const fetchMock = jest.fn(async () => ({
      ok: init.ok ?? true,
      status: init.status ?? 200,
      json: async () => body,
    } as unknown as Response));
    global.fetch = fetchMock as unknown as typeof fetch;
    return fetchMock;
  }

  it('calls the openBD endpoint with the ISBN', async () => {
    const fetchMock = mockFetch([null]);
    await lookupByIsbn('9784101001456');
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.openbd.jp/v1/get?isbn=9784101001456',
    );
  });

  it('maps a complete openBD record to a Book', async () => {
    mockFetch([
      {
        summary: {
          isbn: '9784101001456',
          title: 'ノルウェイの森',
          author: '村上 春樹／著',
          cover: 'https://cover.openbd.jp/9784101001456.jpg',
        },
      },
    ]);

    const book = await lookupByIsbn('9784101001456');

    expect(book).toEqual({
      id: 'isbn:9784101001456',
      title: 'ノルウェイの森',
      authors: ['村上 春樹／著'],
      thumbnail: 'https://cover.openbd.jp/9784101001456.jpg',
    });
  });

  it('splits multiple authors on semicolons and trims them', async () => {
    mockFetch([
      {
        summary: {
          title: 'Coauthored Book',
          author: 'Alice／著 ; Bob／著 ;  ',
          cover: '',
        },
      },
    ]);

    const book = await lookupByIsbn('9784101001456');

    expect(book?.authors).toEqual(['Alice／著', 'Bob／著']);
  });

  it('returns a Book with empty authors and null thumbnail when those are missing', async () => {
    mockFetch([
      {
        summary: {
          title: 'Title Only',
        },
      },
    ]);

    const book = await lookupByIsbn('9784101001456');

    expect(book).toEqual({
      id: 'isbn:9784101001456',
      title: 'Title Only',
      authors: [],
      thumbnail: null,
    });
  });

  it('returns null when openBD responds with [null] (no match)', async () => {
    mockFetch([null]);
    const book = await lookupByIsbn('9780000000002');
    expect(book).toBeNull();
  });

  it('returns null when openBD responds with []', async () => {
    mockFetch([]);
    const book = await lookupByIsbn('9780000000002');
    expect(book).toBeNull();
  });

  it('returns null when the record has no usable title', async () => {
    mockFetch([{ summary: { title: '' } }]);
    const book = await lookupByIsbn('9784101001456');
    expect(book).toBeNull();
  });

  it('drops non-https cover URLs', async () => {
    mockFetch([
      {
        summary: {
          title: 'Insecure Cover',
          author: '',
          cover: 'http://example.com/cover.jpg',
        },
      },
    ]);

    const book = await lookupByIsbn('9784101001456');

    expect(book?.thumbnail).toBeNull();
  });

  it('throws when the HTTP response is not ok', async () => {
    mockFetch([], { ok: false, status: 500 });
    await expect(lookupByIsbn('9784101001456')).rejects.toThrow(/500/);
  });

  it('does not invoke the cover fallback when openBD provides a valid https cover', async () => {
    mockFetch([
      {
        summary: {
          title: 'Title',
          cover: 'https://cover.openbd.jp/x.jpg',
        },
      },
    ]);
    await lookupByIsbn('9784101001456');
    expect(mockResolveCover).not.toHaveBeenCalled();
  });

  it('uses the cover fallback when openBD has no cover', async () => {
    mockFetch([{ summary: { title: 'Title' } }]);
    mockResolveCover.mockResolvedValueOnce(
      'https://covers.example/9784101001456.jpg',
    );

    const book = await lookupByIsbn('9784101001456');

    expect(mockResolveCover).toHaveBeenCalledWith('9784101001456');
    expect(book?.thumbnail).toBe('https://covers.example/9784101001456.jpg');
  });

  it('uses the cover fallback when the openBD cover is dropped as non-https', async () => {
    mockFetch([
      {
        summary: {
          title: 'Title',
          cover: 'http://insecure/x.jpg',
        },
      },
    ]);
    mockResolveCover.mockResolvedValueOnce('https://covers.example/x.jpg');

    const book = await lookupByIsbn('9784101001456');

    expect(book?.thumbnail).toBe('https://covers.example/x.jpg');
  });

  it('returns null thumbnail when the cover fallback throws', async () => {
    mockFetch([{ summary: { title: 'Title' } }]);
    mockResolveCover.mockRejectedValueOnce(new Error('boom'));

    const book = await lookupByIsbn('9784101001456');

    expect(book?.thumbnail).toBeNull();
  });

  // --- Google Books fallback tests ---

  function makeResponse(body: unknown, ok = true, status = 200): Response {
    return {
      ok,
      status,
      json: async () => body,
    } as unknown as Response;
  }

  it('falls back to Google Books when openBD returns [null] (no match)', async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce(makeResponse([null]))
      .mockResolvedValueOnce(
        makeResponse({
          items: [
            {
              id: 'gb123',
              volumeInfo: {
                title: 'Clean Code',
                authors: ['Robert C. Martin'],
                imageLinks: { thumbnail: 'http://books.google.com/cover.jpg' },
              },
            },
          ],
        }),
      ) as unknown as typeof fetch;

    const book = await lookupByIsbn('9780132350884');

    expect(book).toEqual({
      id: 'isbn:9780132350884',
      title: 'Clean Code',
      authors: ['Robert C. Martin'],
      thumbnail: 'https://books.google.com/cover.jpg',
    });
  });

  it('falls back to Google Books when openBD returns [] (empty array)', async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce(makeResponse([]))
      .mockResolvedValueOnce(
        makeResponse({
          items: [
            {
              id: 'gb456',
              volumeInfo: {
                title: 'The Pragmatic Programmer',
                authors: ['David Thomas', 'Andrew Hunt'],
              },
            },
          ],
        }),
      ) as unknown as typeof fetch;

    const book = await lookupByIsbn('9780135957059');

    expect(book?.title).toBe('The Pragmatic Programmer');
  });

  it('does not call Google Books when openBD returns a valid book', async () => {
    const fetchMock = jest.fn().mockResolvedValueOnce(
      makeResponse([
        {
          summary: {
            title: 'ノルウェイの森',
            author: '村上 春樹',
            cover: 'https://cover.openbd.jp/x.jpg',
          },
        },
      ]),
    );
    global.fetch = fetchMock as unknown as typeof fetch;

    await lookupByIsbn('9784101001456');

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('returns null when both openBD and Google Books miss', async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce(makeResponse([null]))
      .mockResolvedValueOnce(makeResponse({})) as unknown as typeof fetch;

    const book = await lookupByIsbn('9780000000002');
    expect(book).toBeNull();
  });

  it('returns null when openBD title is empty and Google Books also misses', async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce(makeResponse([{ summary: { title: '' } }]))
      .mockResolvedValueOnce(makeResponse({})) as unknown as typeof fetch;

    const book = await lookupByIsbn('9780000000002');
    expect(book).toBeNull();
  });

  it('throws when the Google Books fallback HTTP response is not ok', async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce(makeResponse([null]))
      .mockResolvedValueOnce(makeResponse(null, false, 503)) as unknown as typeof fetch;

    await expect(lookupByIsbn('9780000000002')).rejects.toThrow(/503/);
  });

  it('propagates network errors from the Google Books fallback fetch', async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce(makeResponse([null]))
      .mockRejectedValueOnce(new Error('Network failure')) as unknown as typeof fetch;

    await expect(lookupByIsbn('9780000000002')).rejects.toThrow('Network failure');
  });
});
