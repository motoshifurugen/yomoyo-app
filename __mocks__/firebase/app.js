const mockInitializeApp = jest.fn(() => ({ name: '[DEFAULT]' }));
const mockGetApps = jest.fn(() => []);
const mockGetApp = jest.fn(() => ({ name: '[DEFAULT]' }));

module.exports = {
  initializeApp: mockInitializeApp,
  getApps: mockGetApps,
  getApp: mockGetApp,
};
