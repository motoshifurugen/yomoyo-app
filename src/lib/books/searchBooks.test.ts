import { searchBooks } from './searchBooks';

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
});
