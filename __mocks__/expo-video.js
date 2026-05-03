const React = require('react');
const { View } = require('react-native');

module.exports = {
  useVideoPlayer: jest.fn(() => ({
    play: jest.fn(),
    pause: jest.fn(),
    replace: jest.fn(),
    loop: false,
    muted: false,
  })),
  VideoView: jest.fn(({ testID, style }) =>
    React.createElement(View, { testID, style })
  ),
};
