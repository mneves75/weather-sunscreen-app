// Ensure React Native dev flag exists without ts-ignore
// Keep tests quiet by default; do not augment global types
(globalThis as unknown as { __DEV__: boolean }).__DEV__ = false;

// Extend Jest with React Native Testing Library matchers
import '@testing-library/jest-native/extend-expect';

// Reanimated 4: use official Jest setup helper instead of the old mock
// This configures timers and skips native parts safely for unit tests
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('react-native-reanimated').setUpTests?.();
} catch {
  // no-op if unavailable in environment
}

// Mock Expo Localization to avoid native dependency in tests
jest.mock('expo-localization', () => ({
  locale: 'en-US',
  locales: ['en-US'],
  timezone: 'America/New_York',
  isRTL: false,
  region: 'US',
}));

// Mock Expo Notifications to avoid native EventEmitter requirements in tests
jest.mock('expo-notifications', () => ({
  scheduleNotificationAsync: jest.fn().mockResolvedValue({ identifier: 'test' }),
  cancelAllScheduledNotificationsAsync: jest.fn().mockResolvedValue(undefined),
  getPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  SchedulableTriggerInputTypes: { TIME_INTERVAL: 'TIME_INTERVAL' },
}));

// Mock expo-image to a simple RN Image to avoid expo-modules-core EventEmitter in Jest
jest.mock('expo-image', () => {
  const rn = require('react-native');
  return { Image: rn.Image };
});

// Mock expo-blur and expo-linear-gradient to simple RN views
// eslint-disable-next-line @typescript-eslint/no-explicit-any
jest.mock('expo-blur', () => {
  const React = require('react');
  const { View } = require('react-native');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const BlurView = (props: any) => React.createElement(View, props);
  return { BlurView };
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
jest.mock('expo-linear-gradient', () => {
  const React = require('react');
  const { View } = require('react-native');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const LinearGradient = (props: any) => React.createElement(View, props);
  return { LinearGradient };
});

// Mock Expo Location API
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  hasServicesEnabledAsync: jest.fn().mockResolvedValue(true),
}));

// Default Platform to iOS 26 for tests unless a test overrides via explicit mock
jest.mock('react-native/Libraries/Utilities/Platform', () => {
  const actual = jest.requireActual('react-native/Libraries/Utilities/Platform');
  return { ...actual, OS: 'ios', Version: '26.0' };
});

// Mock AsyncStorage for React Native Testing Library compatibility
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// Silence console noise during tests
beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});
