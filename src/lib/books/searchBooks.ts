const BASE_URL = 'https://app.rakuten.co.jp/services/api/BooksBook/Search/20170404';
const ID_PREFIX = 'rk:';
const APP_ID_ENV = 'EXPO_PUBLIC_RAKUTEN_APPLICATION_ID';
const AUTHOR_SEPARATOR = /[,、／]+/;

export type Book = {
  id: string;
  title: string;
  authors: string[];
  thumbnail: string | null;
};

type RakutenBookItem = {
  title?: string;
  author?: string;
  isbn?: string;
  itemCode?: string;
  smallImageUrl?: string;
  mediumImageUrl?: string;
  largeImageUrl?: string;
};

type RakutenBooksResponse = {
  Items?: { Item: RakutenBookItem }[];
};

function toSafeHttpsUrl(raw: string): string | null {
  if (!raw) return null;
  const url = raw.replace('http://', 'https://');
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' ? url : null;
  } catch {
    return null;
  }
}

function pickThumbnail(item: RakutenBookItem): string | null {
  const raw = item.mediumImageUrl || item.largeImageUrl || item.smallImageUrl;
  return raw ? toSafeHttpsUrl(raw) : null;
}

function splitAuthors(author: string | undefined): string[] {
  if (!author) return [];
  return author
    .split(AUTHOR_SEPARATOR)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function pickId(item: RakutenBookItem): string | null {
  const isbn = item.isbn?.trim();
  if (isbn) return `${ID_PREFIX}${isbn}`;
  const itemCode = item.itemCode?.trim();
  if (itemCode) return `${ID_PREFIX}${itemCode}`;
  return null;
}

function mapItem(wrapper: { Item: RakutenBookItem }): Book | null {
  const item = wrapper.Item;
  const id = pickId(item);
  if (!id || !item.title) return null;
  return {
    id,
    title: item.title,
    authors: splitAuthors(item.author),
    thumbnail: pickThumbnail(item),
  };
}

export async function searchBooks(query: string): Promise<Book[]> {
  const applicationId = process.env[APP_ID_ENV];
  if (!applicationId) {
    throw new Error(`Books API config error: ${APP_ID_ENV} is not set`);
  }

  const params = new URLSearchParams({ applicationId, keyword: query });
  const response = await fetch(`${BASE_URL}?${params}`);
  if (!response.ok) throw new Error(`Books API error: ${response.status}`);

  const data: RakutenBooksResponse = await response.json();
  return (data.Items ?? [])
    .map(mapItem)
    .filter((book): book is Book => book !== null);
}
