import { Linking } from 'react-native';

/**
 * Opens a URL in the system browser.
 *
 * Failures (e.g. no browser available) are intentionally swallowed:
 * there is no actionable recovery to surface to the user.
 */
export function openExternalUrl(url: string): void {
  Linking.openURL(url).catch(() => {});
}
