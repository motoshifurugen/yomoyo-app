import {
  LEGAL_SITE_BASE_URL,
  PRIVACY_POLICY_URL,
  TERMS_OF_SERVICE_URL,
  ACCOUNT_DELETION_URL,
} from './legalLinks';

describe('legalLinks', () => {
  it('uses an https base URL', () => {
    expect(LEGAL_SITE_BASE_URL).toMatch(/^https:\/\//);
  });

  it('does not end the base URL with a slash', () => {
    expect(LEGAL_SITE_BASE_URL.endsWith('/')).toBe(false);
  });

  it('derives the privacy policy URL from the base URL', () => {
    expect(PRIVACY_POLICY_URL).toBe(`${LEGAL_SITE_BASE_URL}/privacy-policy.html`);
  });

  it('derives the terms of service URL from the base URL', () => {
    expect(TERMS_OF_SERVICE_URL).toBe(`${LEGAL_SITE_BASE_URL}/terms-of-service.html`);
  });

  it('derives the account deletion URL from the base URL', () => {
    expect(ACCOUNT_DELETION_URL).toBe(`${LEGAL_SITE_BASE_URL}/account-deletion.html`);
  });
});
