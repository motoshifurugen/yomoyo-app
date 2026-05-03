jest.mock('react-i18next', () => ({
  initReactI18next: { type: '3rdParty', init: jest.fn() },
}));

jest.mock('i18next', () => ({
  use: jest.fn().mockReturnThis(),
  init: jest.fn().mockResolvedValue(undefined),
}));

import { detectLanguage } from '@/lib/i18n';

describe('detectLanguage', () => {
  it('returns ja for a Japanese device', () => {
    expect(detectLanguage([{ languageCode: 'ja' }])).toBe('ja');
  });

  it('returns en for an English device', () => {
    expect(detectLanguage([{ languageCode: 'en' }])).toBe('en');
  });

  it('returns en for an unsupported language', () => {
    expect(detectLanguage([{ languageCode: 'fr' }])).toBe('en');
  });

  it('returns en when the locales array is empty', () => {
    expect(detectLanguage([])).toBe('en');
  });

  it('returns en when languageCode is null', () => {
    expect(detectLanguage([{ languageCode: null }])).toBe('en');
  });
});
