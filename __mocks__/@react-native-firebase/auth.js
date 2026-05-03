const mockGetAuth = jest.fn(() => ({}));
const mockOnAuthStateChanged = jest.fn(() => jest.fn());
const mockSignInWithCredential = jest.fn(() => Promise.resolve({ user: {} }));
const mockSignOut = jest.fn(() => Promise.resolve());

const GoogleAuthProvider = {
  credential: jest.fn(() => ({ providerId: 'google.com' })),
};

const AppleAuthProvider = {
  credential: jest.fn(() => ({ providerId: 'apple.com' })),
};

module.exports = {
  getAuth: mockGetAuth,
  onAuthStateChanged: mockOnAuthStateChanged,
  signInWithCredential: mockSignInWithCredential,
  signOut: mockSignOut,
  GoogleAuthProvider,
  AppleAuthProvider,
};
