import { resolveCoverForIsbn } from './coverFallback';

describe('resolveCoverForIsbn', () => {
  const originalFetch = global.fetch;
  const originalEnv = process.env.EXPO_PUBLIC_GOOGLE_BOOKS_API_KEY;

  afterEach(() => {
    global.fetch = originalFetch;
    if (originalEnv === undefined) {
      delete process.env.EXPO_PUBLIC_GOOGLE_BOOKS_API_KEY;
    } else {
      process.env.EXPO_PUBLIC_GOOGLE_BOOKS_API_KEY = originalEnv;
    }
  });

  const ISBN = '9784101001456';
  const OL_URL = `https://covers.openlibrary.org/b/isbn/${ISBN}-L.jpg`;
  const OL_HEAD_URL = `${OL_URL}?default=false`;
  const GB_THUMB =
    'https://books.google.com/books/content?id=abc&printsec=frontcover&img=1&zoom=1';

  type FetchHandler = (
    url: string,
    init?: RequestInit,
  ) => Response | Promise<Response>;

  function makeFetch(handlers: FetchHandler[]) {
    let i = 0;
    const fetchMock = jest.fn(async (url: string, init?: RequestInit) => {
      const handler = handlers[i++];
      if (!handler) throw new Error(`unexpected fetch call: ${url}`);
      return handler(url, init);
    });
    global.fetch = fetchMock as unknown as typeof fetch;
    return fetchMock;
  }

  function ok(): Response {
    return { ok: true, status: 200, json: async () => ({}) } as unknown as Response;
  }
  function notOk(status = 404): Response {
    return { ok: false, status, json: async () => ({}) } as unknown as Response;
  }
  function jsonOk(body: unknown): Response {
    return { ok: true, status: 200, json: async () => body } as unknown as Response;
  }

  it('returns the Open Library URL when the cover is available', async () => {
    const fetchMock = makeFetch([() => ok()]);
    const url = await resolveCoverForIsbn(ISBN);
    expect(url).toBe(OL_URL);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      OL_HEAD_URL,
      expect.objectContaining({ method: 'HEAD' }),
    );
  });

  it('passes an AbortSignal to fetch so timeouts can fire', async () => {
    const fetchMock = makeFetch([() => ok()]);
    await resolveCoverForIsbn(ISBN);
    const init = fetchMock.mock.calls[0][1] as RequestInit | undefined;
    expect(init?.signal).toBeDefined();
  });

  it('falls back to Google Books when Open Library responds non-ok', async () => {
    makeFetch([
      () => notOk(404),
      () =>
        jsonOk({
          items: [{ volumeInfo: { imageLinks: { thumbnail: GB_THUMB } } }],
        }),
    ]);
    const url = await resolveCoverForIsbn(ISBN);
    expect(url).toBe(GB_THUMB);
  });

  it('falls back to Google Books when Open Library throws', async () => {
    makeFetch([
      () => {
        throw new Error('network');
      },
      () =>
        jsonOk({
          items: [{ volumeInfo: { imageLinks: { thumbnail: GB_THUMB } } }],
        }),
    ]);
    const url = await resolveCoverForIsbn(ISBN);
    expect(url).toBe(GB_THUMB);
  });

  it('normalizes http:// from Google Books to https://', async () => {
    makeFetch([
      () => notOk(404),
      () =>
        jsonOk({
          items: [
            {
              volumeInfo: {
                imageLinks: { thumbnail: 'http://books.google.com/x.jpg' },
              },
            },
          ],
        }),
    ]);
    const url = await resolveCoverForIsbn(ISBN);
    expect(url).toBe('https://books.google.com/x.jpg');
  });

  it('returns null when Google Books returns no image link', async () => {
    makeFetch([
      () => notOk(404),
      () => jsonOk({ items: [{ volumeInfo: {} }] }),
    ]);
    const url = await resolveCoverForIsbn(ISBN);
    expect(url).toBeNull();
  });

  it('returns null when both providers fail', async () => {
    makeFetch([() => notOk(404), () => notOk(500)]);
    const url = await resolveCoverForIsbn(ISBN);
    expect(url).toBeNull();
  });

  it('returns null when Google Books throws', async () => {
    makeFetch([
      () => notOk(404),
      () => {
        throw new Error('network');
      },
    ]);
    const url = await resolveCoverForIsbn(ISBN);
    expect(url).toBeNull();
  });

  it('appends the API key when EXPO_PUBLIC_GOOGLE_BOOKS_API_KEY is set', async () => {
    process.env.EXPO_PUBLIC_GOOGLE_BOOKS_API_KEY = 'test-key';
    const fetchMock = makeFetch([
      () => notOk(404),
      () => jsonOk({ items: [] }),
    ]);
    await resolveCoverForIsbn(ISBN);
    const googleBooksUrl = fetchMock.mock.calls[1][0] as string;
    expect(googleBooksUrl).toContain(`q=isbn%3A${ISBN}`);
    expect(googleBooksUrl).toContain('key=test-key');
  });

  it('omits the API key when EXPO_PUBLIC_GOOGLE_BOOKS_API_KEY is missing', async () => {
    delete process.env.EXPO_PUBLIC_GOOGLE_BOOKS_API_KEY;
    const fetchMock = makeFetch([
      () => notOk(404),
      () => jsonOk({ items: [] }),
    ]);
    await resolveCoverForIsbn(ISBN);
    const googleBooksUrl = fetchMock.mock.calls[1][0] as string;
    expect(googleBooksUrl).not.toContain('key=');
  });
});
