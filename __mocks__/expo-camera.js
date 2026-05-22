const React = require('react');

const Camera = {
  requestCameraPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: 'granted', granted: true }),
  ),
  getCameraPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: 'undetermined', granted: false }),
  ),
};

function CameraView(props) {
  return React.createElement('CameraView', props, props.children);
}

module.exports = {
  Camera,
  CameraView,
  useCameraPermissions: jest.fn(() => [
    { status: 'granted', granted: true },
    jest.fn(() => Promise.resolve({ status: 'granted', granted: true })),
  ]),
};
