const mockJsAuth = { type: 'jsAuth' };
const mockInitializeAuth = jest.fn(() => mockJsAuth);
const mockGetReactNativePersistence = jest.fn(() => ({ type: 'rnPersistence' }));
const mockGetAuth = jest.fn(() => mockJsAuth);
const mockSignInWithCredential = jest.fn(() =>
  Promise.resolve({ user: { uid: 'js-uid' } }),
);
const mockSignOut = jest.fn(() => Promise.resolve());
const mockUnsubscribe = jest.fn();
const mockOnAuthStateChanged = jest.fn(() => mockUnsubscribe);

const mockGoogleAuthProvider = {
  credential: jest.fn((idToken, accessToken) => ({
    providerId: 'google.com',
    idToken,
    accessToken,
  })),
};

class MockOAuthProvider {
  constructor(providerId) {
    this.providerId = providerId;
  }
  credential({ idToken, rawNonce }) {
    return { providerId: this.providerId, idToken, rawNonce };
  }
}

module.exports = {
  initializeAuth: mockInitializeAuth,
  getReactNativePersistence: mockGetReactNativePersistence,
  getAuth: mockGetAuth,
  signInWithCredential: mockSignInWithCredential,
  signOut: mockSignOut,
  onAuthStateChanged: mockOnAuthStateChanged,
  GoogleAuthProvider: mockGoogleAuthProvider,
  OAuthProvider: MockOAuthProvider,
};
