const OPEN_LIBRARY_BASE_URL = 'https://covers.openlibrary.org/b/isbn';
const GOOGLE_BOOKS_BASE_URL = 'https://www.googleapis.com/books/v1/volumes';
const PROVIDER_TIMEOUT_MS = 2500;

type GoogleBooksVolumeResponse = {
  items?: Array<{
    volumeInfo?: {
      imageLinks?: { thumbnail?: string };
    };
  }>;
};

function toSafeHttpsUrl(raw: string): string | null {
  const url = raw.replace(/^http:\/\//, 'https://');
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' ? url : null;
  } catch {
    return null;
  }
}

async function fetchWithTimeout(
  url: string,
  init?: RequestInit,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PROVIDER_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function tryOpenLibrary(isbn: string): Promise<string | null> {
  const baseUrl = `${OPEN_LIBRARY_BASE_URL}/${encodeURIComponent(isbn)}-L.jpg`;
  try {
    const response = await fetchWithTimeout(`${baseUrl}?default=false`, {
      method: 'HEAD',
    });
    return response.ok ? baseUrl : null;
  } catch {
    return null;
  }
}

async function tryGoogleBooks(isbn: string): Promise<string | null> {
  const params = new URLSearchParams({ q: `isbn:${isbn}` });
  const apiKey = process.env.EXPO_PUBLIC_GOOGLE_BOOKS_API_KEY;
  if (apiKey) params.append('key', apiKey);

  try {
    const response = await fetchWithTimeout(
      `${GOOGLE_BOOKS_BASE_URL}?${params}`,
    );
    if (!response.ok) return null;

    const data = (await response.json()) as GoogleBooksVolumeResponse;
    const raw = data.items?.[0]?.volumeInfo?.imageLinks?.thumbnail ?? null;
    return raw ? toSafeHttpsUrl(raw) : null;
  } catch {
    return null;
  }
}

export async function resolveCoverForIsbn(
  isbn: string,
): Promise<string | null> {
  const fromOpenLibrary = await tryOpenLibrary(isbn);
  if (fromOpenLibrary) return fromOpenLibrary;
  return tryGoogleBooks(isbn);
}
