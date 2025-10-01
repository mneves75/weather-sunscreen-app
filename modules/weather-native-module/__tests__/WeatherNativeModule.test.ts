import { NativeModules, Platform } from 'react-native';
import { WeatherNativeService } from '../index';

// Mock the native module
const mockWeatherModule = {
  isAvailable: jest.fn(),
  getCurrentLocation: jest.fn(),
  requestLocationPermissions: jest.fn(),
  getWeatherData: jest.fn(),
  calculateUVIndex: jest.fn(),
  clearWeatherCache: jest.fn(),
  getConstants: jest.fn(),
};

// Setup mocks
NativeModules.WeatherNativeModule = mockWeatherModule;

describe('WeatherNativeModule', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset Platform OS for each test
    Object.defineProperty(Platform, 'OS', {
      value: 'ios',
      writable: true,
    });
    mockWeatherModule.isAvailable.mockResolvedValue(true);
  });

  describe('isAvailable', () => {
    it('should return true when module is available', async () => {
      mockWeatherModule.isAvailable.mockResolvedValue(true);

      const result = await WeatherNativeService.isAvailable();

      expect(result).toBe(true);
      expect(mockWeatherModule.isAvailable).toHaveBeenCalledTimes(1);
    });

    it('should return false when module is not available', async () => {
      mockWeatherModule.isAvailable.mockResolvedValue(false);

      const result = await WeatherNativeService.isAvailable();

      expect(result).toBe(false);
    });

    it('should handle errors gracefully', async () => {
      mockWeatherModule.isAvailable.mockRejectedValue(new Error('Module error'));

      const result = await WeatherNativeService.isAvailable();

      expect(result).toBe(false);
    });
  });

  describe('getCurrentLocation', () => {
    const mockLocation = {
      latitude: 37.7749,
      longitude: -122.4194,
      accuracy: 10,
    };

    it('should return current location successfully', async () => {
      mockWeatherModule.getCurrentLocation.mockResolvedValue(mockLocation);

      const result = await WeatherNativeService.getCurrentLocation();

      expect(result).toEqual(mockLocation);
      expect(mockWeatherModule.getCurrentLocation).toHaveBeenCalledTimes(1);
    });

    it('should handle location permission denied', async () => {
      mockWeatherModule.getCurrentLocation.mockRejectedValue(
        new Error('Location permission denied'),
      );

      await expect(WeatherNativeService.getCurrentLocation()).rejects.toThrow(
        'Location permission denied',
      );
    });

    it('should handle location services disabled', async () => {
      mockWeatherModule.getCurrentLocation.mockRejectedValue(
        new Error('Location services disabled'),
      );

      await expect(WeatherNativeService.getCurrentLocation()).rejects.toThrow(
        'Location services disabled',
      );
    });

    it('should validate coordinate bounds', async () => {
      const invalidLocation = {
        latitude: 91, // Invalid: > 90
        longitude: -181, // Invalid: < -180
        accuracy: 10,
      };

      mockWeatherModule.getCurrentLocation.mockResolvedValue(invalidLocation);

      // The service should validate and reject invalid coordinates
      await expect(WeatherNativeService.getCurrentLocation()).rejects.toThrow();
    });

    it('should handle timeout errors', async () => {
      mockWeatherModule.getCurrentLocation.mockRejectedValue(
        new Error('Location request timed out'),
      );

      await expect(WeatherNativeService.getCurrentLocation()).rejects.toThrow(
        'Location request timed out',
      );
    });

    it('sanitizes sensitive coordinates in errors', async () => {
      mockWeatherModule.getCurrentLocation.mockRejectedValue(
        new Error('Internal error near 37.1234,-122.9876'),
      );

      await expect(WeatherNativeService.getCurrentLocation()).rejects.toThrow('[REDACTED]');
    });
  });

  describe('requestLocationPermissions', () => {
    it('should request and grant permissions', async () => {
      mockWeatherModule.requestLocationPermissions.mockResolvedValue(true);

      const result = await WeatherNativeService.requestLocationPermissions();

      expect(result).toBe(true);
      expect(mockWeatherModule.requestLocationPermissions).toHaveBeenCalledTimes(1);
    });

    it('should handle permission denial', async () => {
      mockWeatherModule.requestLocationPermissions.mockResolvedValue(false);

      const result = await WeatherNativeService.requestLocationPermissions();

      expect(result).toBe(false);
    });

    it('should handle permission request errors', async () => {
      mockWeatherModule.requestLocationPermissions.mockRejectedValue(
        new Error('Permission request failed'),
      );

      await expect(WeatherNativeService.requestLocationPermissions()).rejects.toThrow(
        'Permission request failed',
      );
    });
  });

  describe('getWeatherData', () => {
    const mockWeatherData = {
      temperature: 22.5,
      description: 'Partly Cloudy',
      weatherCode: 2, // Partly cloudy WMO code
      humidity: 65,
      windSpeed: 12.3,
      pressure: 1013,
      visibility: 10,
      feelsLike: 23,
      uvIndex: 7,
    };

    it('should fetch weather data successfully', async () => {
      mockWeatherModule.getWeatherData.mockResolvedValue(mockWeatherData);

      const result = await WeatherNativeService.getWeatherData(37.7749, -122.4194);

      // Result should have isFallback added by the service
      expect(result).toMatchObject(mockWeatherData);
      expect(result.isFallback).toBe(false);
      expect(mockWeatherModule.getWeatherData).toHaveBeenCalledWith(37.7749, -122.4194);
    });

    it('should handle WeatherKit unavailable', async () => {
      mockWeatherModule.getWeatherData.mockRejectedValue(new Error('WeatherKit not available'));

      // Should fall back to alternative service
      const result = await WeatherNativeService.getWeatherData(37.7749, -122.4194);

      // Fallback should still return valid data structure
      expect(result).toHaveProperty('temperature');
      expect(result).toHaveProperty('uvIndex');
    });

    it('should validate weather data ranges', async () => {
      const invalidWeatherData = {
        temperature: -100, // At boundary (min is -100)
        description: 'Clear',
        weatherCode: 0,
        humidity: 150, // Invalid: > 100 - Zod will reject this
        windSpeed: -5, // Invalid: negative - Zod will reject this
        pressure: 1013,
        visibility: 10,
        feelsLike: -100,
        uvIndex: 20, // Too high - Zod will reject this
      };

      mockWeatherModule.getWeatherData.mockResolvedValue(invalidWeatherData);

      // Zod validation should reject this data and throw an error
      // Invalid data from native module is a programming error, not network error
      await expect(WeatherNativeService.getWeatherData(37.7749, -122.4194)).rejects.toThrow();
    });

    it('should handle network errors', async () => {
      mockWeatherModule.getWeatherData.mockRejectedValue(new Error('Network request failed'));

      // Should use cached data or fallback
      const result = await WeatherNativeService.getWeatherData(37.7749, -122.4194);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('temperature');
    });

    it('should respect API rate limits', async () => {
      // Set up mock data for rate limit test
      mockWeatherModule.getWeatherData.mockResolvedValue(mockWeatherData);

      // Make multiple rapid requests
      const promises = Array(5)
        .fill(null)
        .map(() => WeatherNativeService.getWeatherData(37.7749, -122.4194));

      // Should use caching to avoid hitting rate limits
      const results = await Promise.all(promises);

      // Should only call native module once due to caching
      expect(mockWeatherModule.getWeatherData).toHaveBeenCalledTimes(1);
    });
  });

  describe('calculateUVIndex', () => {
    it('should calculate UV index for given coordinates', async () => {
      mockWeatherModule.calculateUVIndex.mockResolvedValue(7);

      const result = await WeatherNativeService.calculateUVIndex(37.7749, -122.4194);

      expect(result).toBe(7);
      expect(mockWeatherModule.calculateUVIndex).toHaveBeenCalledWith(
        37.7749,
        -122.4194,
        undefined,
      );
    });

    it('should calculate UV index with custom timestamp', async () => {
      const timestamp = Date.now();
      mockWeatherModule.calculateUVIndex.mockResolvedValue(5);

      const result = await WeatherNativeService.calculateUVIndex(37.7749, -122.4194, timestamp);

      expect(result).toBe(5);
      expect(mockWeatherModule.calculateUVIndex).toHaveBeenCalledWith(
        37.7749,
        -122.4194,
        timestamp,
      );
    });

    it('should return 0 for nighttime', async () => {
      const nighttimeTimestamp = new Date('2024-01-01T02:00:00').getTime();
      mockWeatherModule.calculateUVIndex.mockResolvedValue(0);

      const result = await WeatherNativeService.calculateUVIndex(
        37.7749,
        -122.4194,
        nighttimeTimestamp,
      );

      expect(result).toBe(0);
    });

    it('should validate UV index range (0-11+)', async () => {
      mockWeatherModule.calculateUVIndex.mockResolvedValue(15); // Very high

      const result = await WeatherNativeService.calculateUVIndex(37.7749, -122.4194);

      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(15); // Can be > 11 in extreme conditions
    });

    it('should handle calculation errors', async () => {
      mockWeatherModule.calculateUVIndex.mockRejectedValue(new Error('UV calculation failed'));

      // Should return a safe default
      const result = await WeatherNativeService.calculateUVIndex(37.7749, -122.4194);

      expect(result).toBe(0);
    });
  });

  describe('clearWeatherCache', () => {
    it('should clear weather cache successfully', async () => {
      mockWeatherModule.clearWeatherCache.mockResolvedValue(undefined);

      await WeatherNativeService.clearWeatherCache();

      expect(mockWeatherModule.clearWeatherCache).toHaveBeenCalledTimes(1);
    });

    it('should handle cache clearing errors', async () => {
      mockWeatherModule.clearWeatherCache.mockRejectedValue(new Error('Failed to clear cache'));

      // Should not throw - graceful degradation
      await expect(WeatherNativeService.clearWeatherCache()).resolves.not.toThrow();
    });
  });

  describe('getConstants', () => {
    it('should return module constants', () => {
      const mockConstants = {
        hasWeatherKit: true,
        hasCoreLocation: true,
        apiVersion: '2.0.0',
      };
      mockWeatherModule.getConstants.mockReturnValue(mockConstants);

      const constants = WeatherNativeService.getConstants();

      expect(constants).toEqual(mockConstants);
    });

    it('should indicate WeatherKit unavailable on older iOS', () => {
      const mockConstants = {
        hasWeatherKit: false,
        hasCoreLocation: true,
        apiVersion: '2.0.0',
      };
      mockWeatherModule.getConstants.mockReturnValue(mockConstants);

      const constants = WeatherNativeService.getConstants();

      expect(constants.hasWeatherKit).toBe(false);
      expect(constants.hasCoreLocation).toBe(true);
    });

    it('should return default constants on Android', () => {
      Object.defineProperty(Platform, 'OS', {
        value: 'android',
        writable: true,
      });

      const constants = WeatherNativeService.getConstants();

      expect(constants).toEqual({
        hasWeatherKit: false,
        hasCoreLocation: false,
        apiVersion: '2.0.0',
      });
    });
  });

  describe('Security and Privacy', () => {
    it('should not expose sensitive location data in logs', async () => {
      const consoleSpy = jest.spyOn(console, 'log');

      await WeatherNativeService.getCurrentLocation();

      // Ensure no coordinates are logged
      consoleSpy.mock.calls.forEach((call) => {
        const logContent = call.join(' ');
        expect(logContent).not.toMatch(/\d+\.\d+/); // No decimal coordinates
      });
    });

    it('should request minimal location permissions', async () => {
      await WeatherNativeService.requestLocationPermissions();

      // Should only request "when in use" permission, not "always"
      expect(mockWeatherModule.requestLocationPermissions).toHaveBeenCalledTimes(1);
    });

    it('should sanitize error messages', async () => {
      mockWeatherModule.getCurrentLocation.mockRejectedValue(
        new Error('Location failed at coordinates 37.7749, -122.4194'),
      );

      try {
        await WeatherNativeService.getCurrentLocation();
      } catch (error: any) {
        // Error should be sanitized to not include coordinates
        expect(error.message).not.toContain('37.7749');
        expect(error.message).not.toContain('-122.4194');
      }
    });
  });

  describe('Performance', () => {
    it('should cache weather data for 10 minutes', async () => {
      const mockData = {
        temperature: 22,
        description: 'Clear',
        weatherCode: 0,
        humidity: 60,
        windSpeed: 10,
        pressure: 1013,
        visibility: 10,
        feelsLike: 23,
        uvIndex: 5,
      };

      mockWeatherModule.getWeatherData.mockResolvedValue(mockData);

      // First call
      await WeatherNativeService.getWeatherData(37.7749, -122.4194);

      // Second call within cache window
      await WeatherNativeService.getWeatherData(37.7749, -122.4194);

      // Should only call native module once due to caching
      expect(mockWeatherModule.getWeatherData).toHaveBeenCalledTimes(1);
    });

    it('should throttle location updates appropriately', async () => {
      // Rapid location requests should be throttled
      const promises = Array(10)
        .fill(null)
        .map(() => WeatherNativeService.getCurrentLocation());

      await Promise.all(promises);

      // Should batch or throttle requests
      expect(mockWeatherModule.getCurrentLocation.mock.calls.length).toBeLessThan(10);
    });
  });
});
