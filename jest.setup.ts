// Jest setup for React Native with Expo
import '@testing-library/jest-native/extend-expect';

// Global variables that React Native expects
(global as any).__DEV__ = true;

// Mock Expo modules to avoid native dependencies
jest.mock('expo-localization', () => ({
  locale: 'en-US',
  locales: ['en-US'],
  timezone: 'America/New_York',
  isRTL: false,
  region: 'US',
}));

jest.mock('expo-notifications', () => ({
  scheduleNotificationAsync: jest.fn().mockResolvedValue({ identifier: 'test' }),
  cancelAllScheduledNotificationsAsync: jest.fn().mockResolvedValue(undefined),
  getPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  SchedulableTriggerInputTypes: { TIME_INTERVAL: 'TIME_INTERVAL' },
}));

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  hasServicesEnabledAsync: jest.fn().mockResolvedValue(true),
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// Mock React Native modules that cause issues in test environment
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');

  // Override Platform for tests
  RN.Platform = {
    ...RN.Platform,
    OS: 'ios',
    Version: '26.0',
  };

  // Ensure NativeModules exists
  RN.NativeModules = RN.NativeModules || {};

  return RN;
});

// Minimal, stable mock for RNGH to avoid install() errors in test env
jest.mock('react-native-gesture-handler', () => {
  const React = require('react');
  const Fragment = React.Fragment;
  const Noop = ({ children }: any) => React.createElement(Fragment, null, children ?? null);
  return {
    __esModule: true,
    default: { install: jest.fn() },
    GestureHandlerRootView: Noop,
    PanGestureHandler: Noop,
    TapGestureHandler: Noop,
    LongPressGestureHandler: Noop,
    State: {},
  };
});

// Mock expo-image with a lightweight component to avoid deep RN internals
jest.mock('expo-image', () => {
  const React = require('react');
  const Img = (props: any) => React.createElement('img', props);
  return {
    __esModule: true,
    default: Img,
    Image: Img,
  };
});

// Silence console output during tests
beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  jest.restoreAllMocks();
});
