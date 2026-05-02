const GoogleSignin = {
  configure: jest.fn(),
  hasPlayServices: jest.fn(() => Promise.resolve(true)),
  signIn: jest.fn(() =>
    Promise.resolve({ type: 'success', data: { idToken: 'mock-google-id-token' } })
  ),
};

module.exports = { GoogleSignin, statusCodes: {} };
