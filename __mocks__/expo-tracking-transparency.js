const granted = {
  status: 'granted',
  granted: true,
  canAskAgain: true,
  expires: 'never',
};

module.exports = {
  __esModule: true,
  requestTrackingPermissionsAsync: jest.fn(() => Promise.resolve(granted)),
  getTrackingPermissionsAsync: jest.fn(() => Promise.resolve(granted)),
};
