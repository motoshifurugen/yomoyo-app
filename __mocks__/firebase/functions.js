const mockFunctions = { type: 'jsFunctions' };
const mockGetFunctions = jest.fn(() => mockFunctions);

// Default callable resolves successfully; individual tests can override the
// return value of `httpsCallable` to simulate failures.
const mockHttpsCallable = jest.fn(() =>
  jest.fn(() => Promise.resolve({ data: { ok: true } })),
);

module.exports = {
  getFunctions: mockGetFunctions,
  httpsCallable: mockHttpsCallable,
};
