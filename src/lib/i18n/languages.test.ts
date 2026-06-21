import {
  SUPPORTED_LANGUAGES,
  FALLBACK_LANGUAGE,
  LANGUAGE_RESOURCES,
  LANGUAGE_LABELS,
  isSupportedLanguage,
  normalizeLanguage,
} from './languages';

describe('supported languages registry', () => {
  it('includes en and ja', () => {
    expect(SUPPORTED_LANGUAGES).toContain('en');
    expect(SUPPORTED_LANGUAGES).toContain('ja');
  });

  it('uses a fallback that is itself a supported language', () => {
    expect(FALLBACK_LANGUAGE).toBe('en');
    expect(SUPPORTED_LANGUAGES).toContain(FALLBACK_LANGUAGE);
  });

  it('exposes translation resources for every supported language', () => {
    SUPPORTED_LANGUAGES.forEach((lng) => {
      expect(LANGUAGE_RESOURCES[lng]?.translation).toBeDefined();
    });
  });

  it('exposes a non-empty display label for every supported language', () => {
    SUPPORTED_LANGUAGES.forEach((lng) => {
      expect(typeof LANGUAGE_LABELS[lng]).toBe('string');
      expect(LANGUAGE_LABELS[lng].length).toBeGreaterThan(0);
    });
  });
});

describe('isSupportedLanguage', () => {
  it('returns true for supported codes', () => {
    expect(isSupportedLanguage('ja')).toBe(true);
    expect(isSupportedLanguage('en')).toBe(true);
  });

  it('returns false for unsupported or non-string values', () => {
    expect(isSupportedLanguage('fr')).toBe(false);
    expect(isSupportedLanguage(null)).toBe(false);
    expect(isSupportedLanguage(undefined)).toBe(false);
    expect(isSupportedLanguage(42)).toBe(false);
  });
});

describe('normalizeLanguage', () => {
  it('returns the language when it is supported', () => {
    expect(normalizeLanguage('ja')).toBe('ja');
    expect(normalizeLanguage('en')).toBe('en');
  });

  it('falls back for unsupported or nullish input', () => {
    expect(normalizeLanguage('fr')).toBe(FALLBACK_LANGUAGE);
    expect(normalizeLanguage(null)).toBe(FALLBACK_LANGUAGE);
    expect(normalizeLanguage(undefined)).toBe(FALLBACK_LANGUAGE);
  });
});
