module.exports = {
  requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  getPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'undetermined' })),
  getExpoPushTokenAsync: jest.fn(() =>
    Promise.resolve({ type: 'expo', data: 'ExponentPushToken[test-token]' })
  ),
};
