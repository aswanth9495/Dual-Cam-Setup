export const ERROR_MESSAGES = {
  notStreaming: 'Please ensure that your camera is working',
  selectCamera: 'Please select a camera',
  cameraAccess: 'Failed to access camera',
  imageTooDark: 'Image too dark. Please ensure that the lighting is good',
  default: 'Something went wrong. Please try again',
};

export const SNAPSHOT_PREFIX = 'mobile_snapshots/interviewbit_test_sessions';

export const DEFAULT_RESIZE_OPTION = { width: 640, height: 480 };


export const eventTypeMapping = {
  setupSuccess: 'setup_success',
  setupFail: 'setup_fail',
  snapshotSuccess: 'snapshot_success',
  snapshotFailed: 'snapshot_failed',
  batteryLow: 'battery_low',
  batteryOk: 'battery_ok',
  screenOn: 'screen_on',
  screenOff: 'screen_off',
  imageIncompatible: 'image_compatibility_fail',
};
