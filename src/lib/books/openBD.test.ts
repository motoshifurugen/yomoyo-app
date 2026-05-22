import { isIsbn13, lookupByIsbn } from './openBD';

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
});
