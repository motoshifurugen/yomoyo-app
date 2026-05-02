const appleAuth = {
  performRequest: jest.fn(() =>
    Promise.resolve({
      identityToken: 'mock-identity-token',
      nonce: 'mock-nonce',
    })
  ),
  Operation: { LOGIN: 0 },
  Scope: { EMAIL: 0, FULL_NAME: 1 },
};

module.exports = { appleAuth };
