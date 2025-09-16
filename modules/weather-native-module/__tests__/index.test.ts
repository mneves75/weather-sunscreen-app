import { NativeModules, Platform } from 'react-native';
import { WeatherNativeService } from '../index';
import { logger } from '../../../src/services/loggerService';

// Mock the logger
jest.mock('../../../src/services/loggerService', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  },
}));

describe('WeatherNativeService', () => {
  const mockGetCurrentLocation = jest.fn();
  const mockGetUVIndexData = jest.fn();
  const mockGetWeatherData = jest.fn();
  const mockIsAvailable = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset module cache to ensure fresh state for each test
    WeatherNativeService._resetModuleCache();

    // Reset NativeModules mock
    NativeModules.WeatherNativeModule = {
      getCurrentLocation: mockGetCurrentLocation,
      getUVIndexData: mockGetUVIndexData,
      getWeatherData: mockGetWeatherData,
      isAvailable: mockIsAvailable,
    };

    // Default platform to iOS
    Platform.OS = 'ios';
  });

  describe('isAvailable', () => {
    it('should return false on web platform', async () => {
      Platform.OS = 'web';
      const result = await WeatherNativeService.isAvailable();
      expect(result).toBe(false);
      expect(mockIsAvailable).not.toHaveBeenCalled();
    });

    it('should return false when native module is not present', async () => {
      NativeModules.WeatherNativeModule = undefined;
      const result = await WeatherNativeService.isAvailable();
      expect(result).toBe(false);
    });

    it('should call native isAvailable method on iOS', async () => {
      mockIsAvailable.mockResolvedValue(true);
      const result = await WeatherNativeService.isAvailable();
      expect(result).toBe(true);
      expect(mockIsAvailable).toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      const error = new Error('Native module error');
      mockIsAvailable.mockRejectedValue(error);

      const result = await WeatherNativeService.isAvailable();
      expect(result).toBe(false);
      expect(logger.info).toHaveBeenCalledWith('Module availability check failed', {
        module: 'WeatherNativeModule',
        platform: 'ios',
        error: 'Native module error',
      });
    });

    it('should handle non-Error objects in catch block', async () => {
      mockIsAvailable.mockRejectedValue('String error');

      const result = await WeatherNativeService.isAvailable();
      expect(result).toBe(false);
      expect(logger.error).toHaveBeenCalledWith(
        'Failed to check weather module availability',
        expect.any(Error),
      );
    });
  });

  describe('getCurrentLocation', () => {
    it('should throw error when module is not available', async () => {
      mockIsAvailable.mockResolvedValue(false);

      await expect(WeatherNativeService.getCurrentLocation()).rejects.toThrow(
        'Weather native module not available on this platform',
      );
    });

    it('should return location data when successful', async () => {
      const mockLocation = {
        latitude: 37.7749,
        longitude: -122.4194,
        accuracy: 10,
      };

      mockIsAvailable.mockResolvedValue(true);
      mockGetCurrentLocation.mockResolvedValue(mockLocation);

      const result = await WeatherNativeService.getCurrentLocation();
      expect(result).toEqual(mockLocation);
      expect(mockGetCurrentLocation).toHaveBeenCalled();
    });

    it('should log and rethrow errors', async () => {
      const error = new Error('Location error');
      mockIsAvailable.mockResolvedValue(true);
      mockGetCurrentLocation.mockRejectedValue(error);

      await expect(WeatherNativeService.getCurrentLocation()).rejects.toThrow(error);
      expect(logger.error).toHaveBeenCalledWith('Failed to get current location', error);
    });

    it('should validate returned location and throw ModuleError for invalid coords', async () => {
      mockIsAvailable.mockResolvedValue(true);
      mockGetCurrentLocation.mockResolvedValue({ latitude: 999, longitude: 0, accuracy: 10 });

      await expect(WeatherNativeService.getCurrentLocation()).rejects.toThrow();
      // It should have logged an input validation failure via ErrorHandler
      expect(logger.error).toHaveBeenCalledWith(
        'Input validation failed',
        expect.objectContaining({ name: 'ModuleError', code: 'LATITUDE_OUT_OF_BOUNDS' }),
        expect.objectContaining({ code: 'LATITUDE_OUT_OF_BOUNDS' }),
      );
    });
  });

  describe('getUVIndexData', () => {
    const latitude = 37.7749;
    const longitude = -122.4194;

    it('should return mock data when module is not available', async () => {
      mockIsAvailable.mockResolvedValue(false);

      const result = await WeatherNativeService.getUVIndexData(latitude, longitude);
      expect(result).toEqual({
        uvIndex: 7,
        maxUVToday: 9,
        peakTime: '12:00 PM',
      });
    });

    it('should return native data when available', async () => {
      const mockUVData = {
        uvIndex: 8,
        maxUVToday: 10,
        peakTime: '1:00 PM',
      };

      mockIsAvailable.mockResolvedValue(true);
      mockGetUVIndexData.mockResolvedValue(mockUVData);

      const result = await WeatherNativeService.getUVIndexData(latitude, longitude);
      expect(result).toEqual(mockUVData);
      expect(mockGetUVIndexData).toHaveBeenCalledWith(latitude, longitude);
    });

    it('should log and rethrow errors from native module', async () => {
      const error = new Error('UV data error');
      mockIsAvailable.mockResolvedValue(true);
      mockGetUVIndexData.mockRejectedValue(error);

      await expect(WeatherNativeService.getUVIndexData(latitude, longitude)).rejects.toThrow(error);
      expect(logger.error).toHaveBeenCalledWith('Failed to get UV index data', error);
    });
  });

  describe('getWeatherData', () => {
    const latitude = 37.7749;
    const longitude = -122.4194;

    it('should return mock data when module is not available', async () => {
      mockIsAvailable.mockResolvedValue(false);

      const result = await WeatherNativeService.getWeatherData(latitude, longitude);
      expect(result).toEqual({
        temperature: 22,
        description: 'Sunny',
        weatherCode: 0,
        humidity: 65,
        windSpeed: 3.5,
        pressure: 1013,
        visibility: 10,
        feelsLike: 24,
        isFallback: true,
      });
    });

    it('should return native data with weatherCode', async () => {
      const mockWeatherData = {
        temperature: 25,
        description: 'Partly Cloudy',
        weatherCode: 2,
        humidity: 70,
        windSpeed: 5,
        pressure: 1015,
        visibility: 15,
        feelsLike: 26,
      };

      mockIsAvailable.mockResolvedValue(true);
      mockGetWeatherData.mockResolvedValue(mockWeatherData);

      const result = await WeatherNativeService.getWeatherData(latitude, longitude);
      expect(result).toEqual({
        ...mockWeatherData,
        isFallback: false,
      });
      expect(mockGetWeatherData).toHaveBeenCalledWith(latitude, longitude);
    });

    it('should add default weatherCode if not provided', async () => {
      const mockWeatherData = {
        temperature: 25,
        description: 'Partly Cloudy',
        // weatherCode missing
        humidity: 70,
        windSpeed: 5,
        pressure: 1015,
        visibility: 15,
        feelsLike: 26,
      };

      mockIsAvailable.mockResolvedValue(true);
      mockGetWeatherData.mockResolvedValue(mockWeatherData);

      const result = await WeatherNativeService.getWeatherData(latitude, longitude);
      expect(result.weatherCode).toBe(0); // Default value
    });

    it('should log and rethrow errors from native module', async () => {
      const error = new Error('Weather data error');
      mockIsAvailable.mockResolvedValue(true);
      mockGetWeatherData.mockRejectedValue(error);

      await expect(WeatherNativeService.getWeatherData(latitude, longitude)).rejects.toThrow();
      expect(logger.warn).toHaveBeenCalledWith(
        'Important operation failed',
        expect.objectContaining({
          error: 'Operation failed: getWeatherData',
          code: 'OPERATION_FAILED',
          context: expect.objectContaining({
            module: 'WeatherNativeModule',
            operation: 'getWeatherData',
          }),
          originalError: 'Weather data error',
        }),
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle null native module gracefully', async () => {
      NativeModules.WeatherNativeModule = null;

      const result = await WeatherNativeService.isAvailable();
      expect(result).toBe(false);
    });

    it('should handle undefined methods in native module', async () => {
      NativeModules.WeatherNativeModule = {};

      const result = await WeatherNativeService.isAvailable();
      expect(result).toBe(false);
    });

    it('should handle Android platform', async () => {
      Platform.OS = 'android';
      mockIsAvailable.mockResolvedValue(false);

      const result = await WeatherNativeService.isAvailable();
      expect(result).toBe(false);
    });
  });

  describe('Concurrent Requests', () => {
    it('should handle concurrent location requests', async () => {
      const mockLocation = {
        latitude: 37.7749,
        longitude: -122.4194,
        accuracy: 10,
      };

      mockIsAvailable.mockResolvedValue(true);
      mockGetCurrentLocation.mockResolvedValue(mockLocation);

      const requests = Array(5)
        .fill(null)
        .map(() => WeatherNativeService.getCurrentLocation());

      const results = await Promise.all(requests);

      results.forEach((result) => {
        expect(result).toEqual(mockLocation);
      });

      // isAvailable might be called multiple times due to race conditions
      expect(mockIsAvailable.mock.calls.length).toBeGreaterThanOrEqual(5);
      expect(mockGetCurrentLocation).toHaveBeenCalledTimes(5);
    });
  });

  describe('__resetForTests', () => {
    it('clears transient state and module cache', async () => {
      mockIsAvailable.mockResolvedValue(true);
      await WeatherNativeService.isAvailable();

      NativeModules.WeatherNativeModule = undefined;

      await expect(WeatherNativeService.isAvailable()).resolves.toBe(true);

      (WeatherNativeService as any)._burstCount = 3;
      (WeatherNativeService as any)._burstScheduled = true;
      (WeatherNativeService as any)._locationConcurrency = 2;
      (WeatherNativeService as any)._weatherInflight.set('cache', Promise.resolve({} as any));

      WeatherNativeService.__resetForTests();

      expect((WeatherNativeService as any)._burstCount).toBe(0);
      expect((WeatherNativeService as any)._burstScheduled).toBe(false);
      expect((WeatherNativeService as any)._locationConcurrency).toBe(0);
      expect((WeatherNativeService as any)._weatherInflight.size).toBe(0);

      await expect(WeatherNativeService.isAvailable()).resolves.toBe(false);

      NativeModules.WeatherNativeModule = {
        getCurrentLocation: mockGetCurrentLocation,
        getUVIndexData: mockGetUVIndexData,
        getWeatherData: mockGetWeatherData,
        isAvailable: mockIsAvailable,
      };
    });
  });
});
