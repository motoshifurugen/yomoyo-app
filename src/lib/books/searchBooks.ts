const BASE_URL = 'https://www.googleapis.com/books/v1/volumes';

export type Book = {
  id: string;
  title: string;
  authors: string[];
  thumbnail: string | null;
};

type GoogleBooksVolume = {
  id: string;
  volumeInfo: {
    title?: string;
    authors?: string[];
    imageLinks?: { thumbnail?: string };
  };
};

type GoogleBooksResponse = {
  items?: GoogleBooksVolume[];
};

function toSafeHttpsUrl(raw: string): string | null {
  const url = raw.replace('http://', 'https://');
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' ? url : null;
  } catch {
    return null;
  }
}

function extractThumbnail(
  imageLinks: GoogleBooksVolume['volumeInfo']['imageLinks'],
): string | null {
  const raw = imageLinks?.thumbnail ?? null;
  return raw ? toSafeHttpsUrl(raw) : null;
}

function mapVolume(item: GoogleBooksVolume): Book {
  return {
    id: item.id,
    title: item.volumeInfo.title ?? '',
    authors: item.volumeInfo.authors ?? [],
    thumbnail: extractThumbnail(item.volumeInfo.imageLinks),
  };
}

export async function lookupByIsbnFromGoogleBooks(isbn: string): Promise<Book | null> {
  const apiKey = process.env.EXPO_PUBLIC_GOOGLE_BOOKS_API_KEY;
  const keyParam = apiKey ? `&key=${encodeURIComponent(apiKey)}` : '';
  // URLSearchParams encodes ':' as '%3A', which breaks the "isbn:<isbn>" query.
  // Use string concatenation to preserve the literal colon.
  const url = `${BASE_URL}?q=isbn:${isbn}${keyParam}`;

  const response = await fetch(url);
  if (!response.ok) throw new Error(`Books API error: ${response.status}`);

  const data: GoogleBooksResponse = await response.json();
  const first = data.items?.[0];
  if (!first) return null;

  const title = first.volumeInfo.title?.trim() ?? '';
  if (!title) return null;

  return {
    id: `isbn:${isbn}`,
    title,
    authors: first.volumeInfo.authors ?? [],
    thumbnail: extractThumbnail(first.volumeInfo.imageLinks),
  };
}

export async function searchBooks(query: string): Promise<Book[]> {
  const params = new URLSearchParams({ q: query });
  const apiKey = process.env.EXPO_PUBLIC_GOOGLE_BOOKS_API_KEY;
  if (apiKey) params.append('key', apiKey);

  const response = await fetch(`${BASE_URL}?${params}`);
  if (!response.ok) throw new Error(`Books API error: ${response.status}`);

  const data: GoogleBooksResponse = await response.json();
  return (data.items ?? []).map(mapVolume);
}
