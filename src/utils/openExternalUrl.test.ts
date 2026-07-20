import { Linking } from 'react-native';
import { openExternalUrl } from './openExternalUrl';

describe('openExternalUrl', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('opens the given URL via Linking', () => {
    const spy = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
    openExternalUrl('https://example.com/page.html');
    expect(spy).toHaveBeenCalledWith('https://example.com/page.html');
  });

  it('does not throw when Linking.openURL rejects', async () => {
    jest.spyOn(Linking, 'openURL').mockRejectedValue(new Error('no browser'));
    expect(() => openExternalUrl('https://example.com')).not.toThrow();
    // Let the rejected promise settle to surface any unhandled rejection.
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
});
