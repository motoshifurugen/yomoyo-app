const mockAuthInstance = {
  onAuthStateChanged: jest.fn(),
  signOut: jest.fn(() => Promise.resolve()),
  signInWithCredential: jest.fn(() => Promise.resolve()),
};

const auth = jest.fn(() => mockAuthInstance);
auth.GoogleAuthProvider = { credential: jest.fn(() => ({ type: 'google' })) };
auth.AppleAuthProvider = { credential: jest.fn(() => ({ type: 'apple' })) };

module.exports = auth;
module.exports.default = auth;
