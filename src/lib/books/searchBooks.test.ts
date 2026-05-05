import { searchBooks } from './searchBooks';

const APP_ID_ENV = 'EXPO_PUBLIC_RAKUTEN_APPLICATION_ID';
const TEST_APP_ID = 'test-app-id';

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

describe('searchBooks (Rakuten Books)', () => {
  let originalAppId: string | undefined;

  beforeEach(() => {
    originalAppId = process.env[APP_ID_ENV];
    process.env[APP_ID_ENV] = TEST_APP_ID;
  });

  afterEach(() => {
    if (originalAppId === undefined) delete process.env[APP_ID_ENV];
    else process.env[APP_ID_ENV] = originalAppId;
    jest.restoreAllMocks();
  });

  it('returns empty array when API response has no Items', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(makeFetchOk({}));
    const result = await searchBooks('test');
    expect(result).toEqual([]);
  });

  it('maps a full Rakuten item to a Book with isbn-based, rk-prefixed id', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(
      makeFetchOk({
        Items: [
          {
            Item: {
              title: '吾輩は猫である',
              author: '夏目漱石',
              isbn: '9784101010014',
              mediumImageUrl: 'https://thumbnail.image.rakuten.co.jp/foo.jpg',
            },
          },
        ],
      }),
    );
    const result = await searchBooks('猫');
    expect(result).toEqual([
      {
        id: 'rk:9784101010014',
        title: '吾輩は猫である',
        authors: ['夏目漱石'],
        thumbnail: 'https://thumbnail.image.rakuten.co.jp/foo.jpg',
      },
    ]);
  });

  it('falls back to itemCode when isbn is empty', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(
      makeFetchOk({
        Items: [
          {
            Item: {
              title: 'Some Book',
              author: 'Author',
              isbn: '',
              itemCode: 'books:12345678',
              mediumImageUrl: '',
            },
          },
        ],
      }),
    );
    const [book] = await searchBooks('test');
    expect(book.id).toBe('rk:books:12345678');
  });

  it('skips items that have neither isbn nor itemCode', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(
      makeFetchOk({
        Items: [
          { Item: { title: 'No ID', author: 'A', isbn: '' } },
          { Item: { title: 'With ISBN', author: 'B', isbn: '9784000000000' } },
        ],
      }),
    );
    const result = await searchBooks('test');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('rk:9784000000000');
  });

  it('splits author string on Japanese full-width slash', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(
      makeFetchOk({
        Items: [
          {
            Item: {
              title: 'Book',
              author: '著者A／著者B',
              isbn: '9784000000001',
            },
          },
        ],
      }),
    );
    const [book] = await searchBooks('test');
    expect(book.authors).toEqual(['著者A', '著者B']);
  });

  it('splits author string on comma and ideographic comma', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(
      makeFetchOk({
        Items: [
          {
            Item: {
              title: 'Book',
              author: 'Author A, Author B、Author C',
              isbn: '9784000000002',
            },
          },
        ],
      }),
    );
    const [book] = await searchBooks('test');
    expect(book.authors).toEqual(['Author A', 'Author B', 'Author C']);
  });

  it('does not split author on ASCII slash', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(
      makeFetchOk({
        Items: [
          {
            Item: {
              title: 'Book',
              author: 'Smith/Jones',
              isbn: '9784000000010',
            },
          },
        ],
      }),
    );
    const [book] = await searchBooks('test');
    expect(book.authors).toEqual(['Smith/Jones']);
  });

  it('returns empty authors when author field is missing', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(
      makeFetchOk({
        Items: [{ Item: { title: 'Book', isbn: '9784000000003' } }],
      }),
    );
    const [book] = await searchBooks('test');
    expect(book.authors).toEqual([]);
  });

  it('returns empty authors when author field is an empty string', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(
      makeFetchOk({
        Items: [{ Item: { title: 'Book', author: '', isbn: '9784000000007' } }],
      }),
    );
    const [book] = await searchBooks('test');
    expect(book.authors).toEqual([]);
  });

  it('sets thumbnail to null when no image URL is present', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(
      makeFetchOk({
        Items: [{ Item: { title: 'Book', author: 'A', isbn: '9784000000004' } }],
      }),
    );
    const [book] = await searchBooks('test');
    expect(book.thumbnail).toBeNull();
  });

  it('converts http thumbnail URL to https', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(
      makeFetchOk({
        Items: [
          {
            Item: {
              title: 'Book',
              author: 'A',
              isbn: '9784000000005',
              mediumImageUrl: 'http://thumbnail.image.rakuten.co.jp/foo.jpg',
            },
          },
        ],
      }),
    );
    const [book] = await searchBooks('test');
    expect(book.thumbnail).toBe('https://thumbnail.image.rakuten.co.jp/foo.jpg');
  });

  it('sets thumbnail to null when image URL is malformed', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(
      makeFetchOk({
        Items: [
          {
            Item: {
              title: 'Book',
              author: 'A',
              isbn: '9784000000006',
              mediumImageUrl: 'not a url',
            },
          },
        ],
      }),
    );
    const [book] = await searchBooks('test');
    expect(book.thumbnail).toBeNull();
  });

  it('throws "Books API error: <status>" on HTTP error', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(makeFetchError(500));
    await expect(searchBooks('test')).rejects.toThrow('Books API error: 500');
  });

  it('preserves the 429 error format used by the UI rate-limit mapping', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(makeFetchError(429));
    await expect(searchBooks('test')).rejects.toThrow('Books API error: 429');
  });

  it('throws when EXPO_PUBLIC_RAKUTEN_APPLICATION_ID is not set', async () => {
    delete process.env[APP_ID_ENV];
    const spy = jest.spyOn(global, 'fetch').mockResolvedValue(makeFetchOk({}));
    await expect(searchBooks('test')).rejects.toThrow();
    expect(spy).not.toHaveBeenCalled();
  });

  it('calls the Rakuten BooksBook endpoint with applicationId and keyword', async () => {
    const spy = jest.spyOn(global, 'fetch').mockResolvedValue(makeFetchOk({}));
    await searchBooks('夏目漱石');
    const url = spy.mock.calls[0][0] as string;
    expect(url).toContain('app.rakuten.co.jp/services/api/BooksBook/Search/20170404');
    expect(url).toContain(`applicationId=${TEST_APP_ID}`);
    expect(url).toContain('keyword=');
    expect(decodeURIComponent(url)).toContain('夏目漱石');
  });
});
