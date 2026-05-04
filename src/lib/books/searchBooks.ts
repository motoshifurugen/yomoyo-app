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
    title: string;
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

function mapVolume(item: GoogleBooksVolume): Book {
  const raw = item.volumeInfo.imageLinks?.thumbnail ?? null;
  return {
    id: item.id,
    title: item.volumeInfo.title,
    authors: item.volumeInfo.authors ?? [],
    thumbnail: raw ? toSafeHttpsUrl(raw) : null,
  };
}

export async function searchBooks(query: string): Promise<Book[]> {
  const params = new URLSearchParams({ q: query });
  const apiKey = process.env.EXPO_PUBLIC_GOOGLE_BOOKS_API_KEY;
  if (__DEV__) {
    console.log('[Books] API key:', apiKey ? `${apiKey.slice(0, 4)}...` : 'NOT SET');
  }
  if (apiKey) params.append('key', apiKey);

  const response = await fetch(`${BASE_URL}?${params}`);
  if (!response.ok) throw new Error(`Books API error: ${response.status}`);

  const data: GoogleBooksResponse = await response.json();
  return (data.items ?? []).map(mapVolume);
}
