import type { Book } from './searchBooks';
import { resolveCoverForIsbn } from './coverFallback';

const OPENBD_BASE_URL = 'https://api.openbd.jp/v1/get';

type OpenBdSummary = {
  isbn?: string;
  title?: string;
  author?: string;
  cover?: string;
};

type OpenBdRecord = {
  summary?: OpenBdSummary;
} | null;

export function isIsbn13(value: string): boolean {
  if (!/^\d{13}$/.test(value)) return false;
  if (!value.startsWith('978') && !value.startsWith('979')) return false;

  const digits = value.split('').map((d) => Number(d));
  const sum = digits
    .slice(0, 12)
    .reduce((acc, d, i) => acc + d * (i % 2 === 0 ? 1 : 3), 0);
  const checksum = (10 - (sum % 10)) % 10;
  return checksum === digits[12];
}

function parseAuthors(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function safeHttpsCover(raw: string | undefined): string | null {
  if (!raw) return null;
  try {
    const parsed = new URL(raw);
    return parsed.protocol === 'https:' ? raw : null;
  } catch {
    return null;
  }
}

export async function lookupByIsbn(isbn: string): Promise<Book | null> {
  const response = await fetch(`${OPENBD_BASE_URL}?isbn=${encodeURIComponent(isbn)}`);
  if (!response.ok) {
    throw new Error(`openBD error: ${response.status}`);
  }

  const data = (await response.json()) as OpenBdRecord[];
  if (!Array.isArray(data) || data.length === 0) return null;

  const record = data[0];
  const title = record?.summary?.title?.trim();
  if (!title) return null;

  let thumbnail = safeHttpsCover(record?.summary?.cover);
  if (!thumbnail) {
    try {
      thumbnail = await resolveCoverForIsbn(isbn);
    } catch {
      thumbnail = null;
    }
  }

  return {
    id: `isbn:${isbn}`,
    title,
    authors: parseAuthors(record?.summary?.author),
    thumbnail,
  };
}
