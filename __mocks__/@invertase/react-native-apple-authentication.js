const React = require('react');
const { TouchableOpacity } = require('react-native');

const appleAuth = {
  performRequest: jest.fn(() =>
    Promise.resolve({
      identityToken: 'mock-identity-token',
      nonce: 'mock-nonce',
    })
  ),
  Operation: { LOGIN: 0 },
  Scope: { EMAIL: 0, FULL_NAME: 1 },
  Error: {
    UNKNOWN: '1000',
    CANCELED: '1001',
    INVALID_RESPONSE: '1002',
    NOT_HANDLED: '1003',
    FAILED: '1004',
  },
};

const AppleButton = ({ onPress, style, testID }) =>
  React.createElement(TouchableOpacity, {
    onPress,
    style,
    testID: testID ?? 'apple-signin-button',
  });

AppleButton.Type = {
  DEFAULT: 'SignIn',
  SIGN_IN: 'SignIn',
  CONTINUE: 'Continue',
  SIGN_UP: 'SignUp',
};

AppleButton.Style = {
  DEFAULT: 'White',
  WHITE: 'White',
  WHITE_OUTLINE: 'WhiteOutline',
  BLACK: 'Black',
};

module.exports = { appleAuth, AppleButton, default: appleAuth };
