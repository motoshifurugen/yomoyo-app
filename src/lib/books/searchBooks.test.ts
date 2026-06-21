import {
  searchBooks,
  lookupByIsbnFromGoogleBooks,
  resolveCountryFromLocale,
} from './searchBooks';

function makeFetchOk(body: object): Response {
  return {
    ok: true,
    status: 200,
    json: () => Promise.resolve(body),
  } as unknown as Response;
}

function makeFetchError(status: number): Response {
  return { ok: false, status } as unknown as Response;
}

describe('searchBooks', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns empty array when API response has no items', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(makeFetchOk({}));
    const result = await searchBooks('test');
    expect(result).toEqual([]);
  });

  it('maps a full volume to a Book', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(
      makeFetchOk({
        items: [
          {
            id: 'abc',
            volumeInfo: {
              title: 'The Great Gatsby',
              authors: ['F. Scott Fitzgerald'],
              imageLinks: { thumbnail: 'http://books.google.com/thumbnail.jpg' },
            },
          },
        ],
      }),
    );
    const result = await searchBooks('gatsby');
    expect(result).toEqual([
      {
        id: 'abc',
        title: 'The Great Gatsby',
        authors: ['F. Scott Fitzgerald'],
        thumbnail: 'https://books.google.com/thumbnail.jpg',
      },
    ]);
  });

  it('defaults authors to empty array when missing', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(
      makeFetchOk({
        items: [{ id: 'xyz', volumeInfo: { title: 'Unknown Book' } }],
      }),
    );
    const [book] = await searchBooks('unknown');
    expect(book.authors).toEqual([]);
  });

  it('sets thumbnail to null when imageLinks is missing', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(
      makeFetchOk({
        items: [{ id: 'xyz', volumeInfo: { title: 'No Cover', authors: ['Author'] } }],
      }),
    );
    const [book] = await searchBooks('no cover');
    expect(book.thumbnail).toBeNull();
  });

  it('converts http thumbnail URL to https', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(
      makeFetchOk({
        items: [
          {
            id: 'xyz',
            volumeInfo: {
              title: 'Book',
              authors: ['Author'],
              imageLinks: { thumbnail: 'http://books.google.com/img.jpg' },
            },
          },
        ],
      }),
    );
    const [book] = await searchBooks('book');
    expect(book.thumbnail).toBe('https://books.google.com/img.jpg');
  });

  it('throws when the API responds with an error status', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(makeFetchError(500));
    await expect(searchBooks('test')).rejects.toThrow('Books API error: 500');
  });

  it('sets thumbnail to null when the URL is malformed', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(
      makeFetchOk({
        items: [
          {
            id: 'xyz',
            volumeInfo: {
              title: 'Book',
              authors: ['Author'],
              imageLinks: { thumbnail: 'not a url' },
            },
          },
        ],
      }),
    );
    const [book] = await searchBooks('book');
    expect(book.thumbnail).toBeNull();
  });

  it('includes the query in the fetch URL', async () => {
    const spy = jest.spyOn(global, 'fetch').mockResolvedValue(makeFetchOk({}));
    await searchBooks('hello world');
    const url = spy.mock.calls[0][0] as string;
    expect(url).toContain('q=');
    expect(decodeURIComponent(url.replace(/\+/g, ' '))).toContain('hello world');
  });

  it('appends key param when EXPO_PUBLIC_GOOGLE_BOOKS_API_KEY is set', async () => {
    const original = process.env.EXPO_PUBLIC_GOOGLE_BOOKS_API_KEY;
    process.env.EXPO_PUBLIC_GOOGLE_BOOKS_API_KEY = 'test-api-key-123';
    const spy = jest.spyOn(global, 'fetch').mockResolvedValue(makeFetchOk({}));
    await searchBooks('gatsby');
    const url = spy.mock.calls[0][0] as string;
    expect(url).toContain('key=test-api-key-123');
    process.env.EXPO_PUBLIC_GOOGLE_BOOKS_API_KEY = original;
  });

  it('omits the key param when EXPO_PUBLIC_GOOGLE_BOOKS_API_KEY is not set', async () => {
    const original = process.env.EXPO_PUBLIC_GOOGLE_BOOKS_API_KEY;
    delete process.env.EXPO_PUBLIC_GOOGLE_BOOKS_API_KEY;
    const spy = jest.spyOn(global, 'fetch').mockResolvedValue(makeFetchOk({}));
    await searchBooks('gatsby');
    const url = spy.mock.calls[0][0] as string;
    expect(url).not.toContain('key=');
    process.env.EXPO_PUBLIC_GOOGLE_BOOKS_API_KEY = original;
  });

  it('includes a country param in the fetch URL', async () => {
    const spy = jest.spyOn(global, 'fetch').mockResolvedValue(makeFetchOk({}));
    await searchBooks('gatsby');
    const url = spy.mock.calls[0][0] as string;
    expect(url).toMatch(/[?&]country=[A-Z]{2}\b/);
  });
});

describe('resolveCountryFromLocale', () => {
  it('extracts the region subtag from a full locale', () => {
    expect(resolveCountryFromLocale('en-US')).toBe('US');
    expect(resolveCountryFromLocale('ja-JP')).toBe('JP');
  });

  it('skips script subtags and returns the region', () => {
    expect(resolveCountryFromLocale('zh-Hant-TW')).toBe('TW');
  });

  it('falls back to US when the locale has no region subtag', () => {
    expect(resolveCountryFromLocale('ja')).toBe('US');
  });

  it('falls back to US for empty or nullish input', () => {
    expect(resolveCountryFromLocale('')).toBe('US');
    expect(resolveCountryFromLocale(undefined)).toBe('US');
    expect(resolveCountryFromLocale(null)).toBe('US');
  });
});

describe('lookupByIsbnFromGoogleBooks', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  const CLEAN_CODE_VOLUME = {
    id: 'gBook123',
    volumeInfo: {
      title: 'Clean Code',
      authors: ['Robert C. Martin'],
      imageLinks: { thumbnail: 'http://books.google.com/cover.jpg' },
    },
  };

  it('returns a Book when Google Books has a match', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(
      makeFetchOk({ items: [CLEAN_CODE_VOLUME] }),
    );
    const book = await lookupByIsbnFromGoogleBooks('9780132350884');
    expect(book).toEqual({
      id: 'isbn:9780132350884',
      title: 'Clean Code',
      authors: ['Robert C. Martin'],
      thumbnail: 'https://books.google.com/cover.jpg',
    });
  });

  it('returns null when Google Books has no items', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(makeFetchOk({}));
    const book = await lookupByIsbnFromGoogleBooks('9780000000002');
    expect(book).toBeNull();
  });

  it('returns null when the volume has no title', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(
      makeFetchOk({
        items: [{ id: 'x', volumeInfo: {} }],
      }),
    );
    const book = await lookupByIsbnFromGoogleBooks('9780000000002');
    expect(book).toBeNull();
  });

  it('defaults authors to empty array when missing', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(
      makeFetchOk({
        items: [{ id: 'x', volumeInfo: { title: 'No Authors Book' } }],
      }),
    );
    const book = await lookupByIsbnFromGoogleBooks('9780000000002');
    expect(book?.authors).toEqual([]);
  });

  it('sets thumbnail to null when imageLinks is missing', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(
      makeFetchOk({
        items: [{ id: 'x', volumeInfo: { title: 'No Thumb', authors: ['A'] } }],
      }),
    );
    const book = await lookupByIsbnFromGoogleBooks('9780000000002');
    expect(book?.thumbnail).toBeNull();
  });

  it('converts http thumbnail URL to https', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(
      makeFetchOk({ items: [CLEAN_CODE_VOLUME] }),
    );
    const book = await lookupByIsbnFromGoogleBooks('9780132350884');
    expect(book?.thumbnail).toBe('https://books.google.com/cover.jpg');
  });

  it('uses isbn: prefix for book id instead of Google Books internal id', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(
      makeFetchOk({ items: [CLEAN_CODE_VOLUME] }),
    );
    const book = await lookupByIsbnFromGoogleBooks('9780132350884');
    expect(book?.id).toBe('isbn:9780132350884');
  });

  it('calls the Google Books volumes endpoint with isbn: query param', async () => {
    const spy = jest.spyOn(global, 'fetch').mockResolvedValue(makeFetchOk({}));
    await lookupByIsbnFromGoogleBooks('9780132350884');
    const url = spy.mock.calls[0][0] as string;
    expect(url).toContain('isbn:9780132350884');
    expect(url).toContain('googleapis.com/books');
  });

  it('includes a country param in the fetch URL', async () => {
    const spy = jest.spyOn(global, 'fetch').mockResolvedValue(makeFetchOk({}));
    await lookupByIsbnFromGoogleBooks('9780132350884');
    const url = spy.mock.calls[0][0] as string;
    expect(url).toMatch(/[?&]country=[A-Z]{2}\b/);
  });

  it('throws when Google Books responds with an error status', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(makeFetchError(503));
    await expect(lookupByIsbnFromGoogleBooks('9780132350884')).rejects.toThrow(/503/);
  });

  it('propagates network errors from fetch', async () => {
    jest.spyOn(global, 'fetch').mockRejectedValue(new Error('Network failure'));
    await expect(lookupByIsbnFromGoogleBooks('9780132350884')).rejects.toThrow(
      'Network failure',
    );
  });
});
