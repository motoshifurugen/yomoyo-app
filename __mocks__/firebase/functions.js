const mockFunctions = { type: 'jsFunctions' };
const mockGetFunctions = jest.fn(() => mockFunctions);
const mockCallable = jest.fn(() =>
  Promise.resolve({ data: { ok: true, ticket: { status: 'ok' } } }),
);
const mockHttpsCallable = jest.fn(() => mockCallable);

module.exports = {
  getFunctions: mockGetFunctions,
  httpsCallable: mockHttpsCallable,
};
