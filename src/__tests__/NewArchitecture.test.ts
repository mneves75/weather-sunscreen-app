import { Platform } from 'react-native';

// Mock the TurboModuleRegistry for testing
const mockTurboModuleRegistry = {
  getEnforcing: jest.fn(),
};

jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    Platform: {
      ...RN.Platform,
      OS: 'ios',
      select: (config: any) => config.ios || config.default,
    },
    TurboModuleRegistry: mockTurboModuleRegistry,
    NativeModules: {},
  };
});

// Mock the logger service
jest.mock('../services/loggerService', () => ({
  logger: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
  },
}));

describe('New Architecture Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  describe('TurboModule Registration', () => {
    it('should register WeatherNativeModule TurboModule', () => {
      // Mock successful TurboModule registration
      const mockTurboModule = {
        isAvailable: jest.fn().mockResolvedValue(true),
        getCurrentLocation: jest.fn().mockResolvedValue({
          latitude: 37.7749,
          longitude: -122.4194,
          accuracy: 5,
        }),
        getWeatherData: jest.fn().mockResolvedValue({
          temperature: 22,
          description: 'Sunny',
          weatherCode: 0,
          humidity: 65,
          windSpeed: 3.5,
          pressure: 1013,
          visibility: 10,
          feelsLike: 24,
        }),
        getUVIndexData: jest.fn().mockResolvedValue({
          uvIndex: 7,
          maxUVToday: 9,
          peakTime: '12:00 PM',
        }),
      };

      mockTurboModuleRegistry.getEnforcing.mockReturnValue(mockTurboModule);

      // Import after mocking
      const WeatherNativeModule = require('../specs/WeatherNativeModuleSpec').default;

      expect(WeatherNativeModule).toBeDefined();
      expect(mockTurboModuleRegistry.getEnforcing).toHaveBeenCalledWith('WeatherNativeModule');
    });

    it('should handle TurboModule registration failure gracefully', () => {
      // Mock TurboModule registration failure
      mockTurboModuleRegistry.getEnforcing.mockImplementation(() => {
        throw new Error('TurboModule not available');
      });

      expect(() => {
        require('../specs/WeatherNativeModuleSpec').default;
      }).toThrow('TurboModule not available');
    });
  });

  describe('TurboModule Interface Compliance', () => {
    let mockTurboModule: any;
    let WeatherNativeModule: any;

    beforeEach(() => {
      mockTurboModule = {
        isAvailable: jest.fn(),
        getCurrentLocation: jest.fn(),
        getWeatherData: jest.fn(),
        getUVIndexData: jest.fn(),
      };

      mockTurboModuleRegistry.getEnforcing.mockReturnValue(mockTurboModule);
      WeatherNativeModule = require('../specs/WeatherNativeModuleSpec').default;
    });

    it('should implement all required TurboModule methods', () => {
      expect(typeof WeatherNativeModule.isAvailable).toBe('function');
      expect(typeof WeatherNativeModule.getCurrentLocation).toBe('function');
      expect(typeof WeatherNativeModule.getWeatherData).toBe('function');
      expect(typeof WeatherNativeModule.getUVIndexData).toBe('function');
    });

    it('should return proper types from TurboModule methods', async () => {
      mockTurboModule.isAvailable.mockResolvedValue(true);
      mockTurboModule.getCurrentLocation.mockResolvedValue({
        latitude: 37.7749,
        longitude: -122.4194,
        accuracy: 5,
      });
      mockTurboModule.getWeatherData.mockResolvedValue({
        temperature: 22,
        description: 'Sunny',
        weatherCode: 0,
        humidity: 65,
        windSpeed: 3.5,
        pressure: 1013,
        visibility: 10,
        feelsLike: 24,
        isFallback: false,
      });
      mockTurboModule.getUVIndexData.mockResolvedValue({
        uvIndex: 7,
        maxUVToday: 9,
        peakTime: '12:00 PM',
        isFallback: false,
      });

      const isAvailable = await WeatherNativeModule.isAvailable();
      expect(typeof isAvailable).toBe('boolean');

      const location = await WeatherNativeModule.getCurrentLocation();
      expect(typeof location.latitude).toBe('number');
      expect(typeof location.longitude).toBe('number');
      expect(typeof location.accuracy).toBe('number');

      const weather = await WeatherNativeModule.getWeatherData(37.7749, -122.4194);
      expect(typeof weather.temperature).toBe('number');
      expect(typeof weather.description).toBe('string');
      expect(typeof weather.weatherCode).toBe('number');

      const uv = await WeatherNativeModule.getUVIndexData(37.7749, -122.4194);
      expect(typeof uv.uvIndex).toBe('number');
      expect(typeof uv.maxUVToday).toBe('number');
      expect(typeof uv.peakTime).toBe('string');
    });
  });

  describe('Backward Compatibility', () => {
    it('should maintain backward compatibility with WeatherNativeService', async () => {
      // Mock Platform
      const originalOS = Platform.OS;
      (Platform as any).OS = 'ios';

      // Mock successful TurboModule
      const mockTurboModule = {
        isAvailable: jest.fn().mockResolvedValue(true),
        getCurrentLocation: jest.fn().mockResolvedValue({
          latitude: 37.7749,
          longitude: -122.4194,
          accuracy: 5,
        }),
        getWeatherData: jest.fn().mockResolvedValue({
          temperature: 22,
          description: 'Sunny',
          weatherCode: 0,
          humidity: 65,
          windSpeed: 3.5,
          pressure: 1013,
          visibility: 10,
          feelsLike: 24,
        }),
        getUVIndexData: jest.fn().mockResolvedValue({
          uvIndex: 7,
          maxUVToday: 9,
          peakTime: '12:00 PM',
        }),
      };

      mockTurboModuleRegistry.getEnforcing.mockReturnValue(mockTurboModule);

      // Test WeatherNativeService with TurboModule
      const { WeatherNativeService } = require('../../modules/weather-native-module');

      const isAvailable = await WeatherNativeService.isAvailable();
      expect(isAvailable).toBe(true);

      const location = await WeatherNativeService.getCurrentLocation();
      expect(location).toMatchObject({
        latitude: 37.7749,
        longitude: -122.4194,
        accuracy: 5,
      });

      // Restore Platform.OS
      (Platform as any).OS = originalOS;
    });
  });

  describe('Performance Benchmarks', () => {
    it('should complete TurboModule calls within performance targets', async () => {
      const mockTurboModule = {
        isAvailable: jest.fn().mockResolvedValue(true),
        getCurrentLocation: jest.fn().mockImplementation(async () => {
          // Simulate realistic async delay
          await new Promise(resolve => setTimeout(resolve, 10));
          return {
            latitude: 37.7749,
            longitude: -122.4194,
            accuracy: 5,
          };
        }),
      };

      mockTurboModuleRegistry.getEnforcing.mockReturnValue(mockTurboModule);
      const WeatherNativeModule = require('../specs/WeatherNativeModuleSpec').default;

      const startTime = performance.now();
      await WeatherNativeModule.getCurrentLocation();
      const endTime = performance.now();

      // TurboModule calls should be faster than 50ms (target from roadmap)
      expect(endTime - startTime).toBeLessThan(50);
    });
  });
});