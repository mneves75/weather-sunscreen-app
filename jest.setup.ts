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

// Preserve RN Platform.select by not reassigning the object; if needed, mutate fields directly.
try {
  const RN = require('react-native');
  if (RN && RN.Platform && RN.Platform.Version == null) {
    RN.Platform.Version = 26;
  }
} catch (e) {
  // ignore setup tweaks if RN is unavailable in certain CI contexts
}

// Mock optional Expo Glass Effect to avoid native view registration during tests
jest.mock('expo-glass-effect', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    GlassContainer: ({ children, style }: any) => React.createElement(View, { style }, children),
  };
});

// Silence console output during tests
beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

// Prevent cross-test mock contamination for our native bridges
beforeEach(() => {
  try {
    const { NativeModules } = require('react-native');
    const maybeResetGroup = (group: any) => {
      if (!group) return;
      Object.keys(group).forEach((k) => {
        const fn = group[k];
        if (fn && typeof fn.mockReset === 'function') {
          fn.mockReset();
        }
      });
    };
    maybeResetGroup(NativeModules?.WeatherNativeModule);
    maybeResetGroup(NativeModules?.LiquidGlassNativeModule);

    // Provide sensible defaults so tests not explicitly mocking still pass
    if (NativeModules?.WeatherNativeModule) {
      if (NativeModules.WeatherNativeModule.getCurrentLocation?.mock) {
        NativeModules.WeatherNativeModule.getCurrentLocation.mockImplementation(() =>
          new Promise((resolve) =>
            setTimeout(
              () => resolve({ latitude: 0, longitude: 0, accuracy: 0 }),
              1,
            ),
          ),
        );
      }
      if (NativeModules.WeatherNativeModule.getWeatherData?.mock) {
        NativeModules.WeatherNativeModule.getWeatherData.mockResolvedValue({
          temperature: 22,
          humidity: 60,
          windSpeed: 3,
          uvIndex: 5,
          conditions: 'Clear',
          sunrise: '06:00:00',
          sunset: '20:00:00',
          timestamp: Date.now(),
        });
      }
    }
  } catch {
    // noop
  }

  // Reset caches/state in our modules between tests
  try {
    const { WeatherNativeService } = require('./modules/weather-native-module');
    if (WeatherNativeService?.__resetForTests) {
      WeatherNativeService.__resetForTests();
    }
  } catch {
    // ignore if not loadable in this context
  }
});

afterAll(() => {
  jest.restoreAllMocks();
});
