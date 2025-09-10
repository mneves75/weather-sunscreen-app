import { Platform } from 'react-native';
import { logger } from '../../src/services/loggerService';
import { ErrorHandler, ErrorSeverity, InputValidator } from '../../src/utils/errorHandling';

// Import TurboModule specification
import WeatherNativeModule from '../../src/specs/WeatherNativeModuleSpec';
import type { LocationData, WeatherData, UVData } from '../../src/specs/WeatherNativeModuleSpec';

// Fallback to legacy NativeModules for backwards compatibility
import { NativeModules } from 'react-native';

// Cached module resolution for performance
let cachedModule: any = null;
let moduleResolutionAttempted = false;

function getNativeModule() {
  // Use cached result if available
  if (moduleResolutionAttempted) {
    return cachedModule;
  }

  // Try TurboModule first, fallback to legacy NativeModules
  try {
    if (WeatherNativeModule) {
      cachedModule = WeatherNativeModule;
    } else {
      // Fallback to legacy NativeModules
      cachedModule = (NativeModules as any)?.WeatherNativeModule ?? null;
    }
  } catch (error) {
    logger.warn('Failed to resolve native module', { error: error instanceof Error ? error.message : String(error) });
    cachedModule = null;
  }

  moduleResolutionAttempted = true;
  return cachedModule;
}

export class WeatherNativeService {
  private static readonly MODULE_NAME = 'WeatherNativeModule';

  /**
   * Check if weather native module is available
   * This is a non-critical check that returns false on failure
   */
  static async isAvailable(): Promise<boolean> {
    if (Platform.OS === 'web') {
      return false;
    }

    const context = {
      module: this.MODULE_NAME,
      operation: 'isAvailable',
      platform: Platform.OS,
    };

    try {
      const nativeModule = getNativeModule();
      if (!nativeModule || typeof nativeModule.isAvailable !== 'function') {
        return false;
      }

      const result = await nativeModule.isAvailable();
      return !!result;
    } catch (error) {
      logger.info('Module availability check failed', {
        module: this.MODULE_NAME,
        platform: Platform.OS,
        error: error instanceof Error ? error.message : String(error),
      });
      return false;
    }
  }

  /**
   * Get current device location
   * CRITICAL operation - will throw if module unavailable or operation fails
   */
  static async getCurrentLocation(): Promise<LocationData> {
    const context = {
      module: this.MODULE_NAME,
      operation: 'getCurrentLocation',
      platform: Platform.OS,
    };

    // Check module availability first
    const available = await this.isAvailable();
    if (!available) {
      ErrorHandler.handleModuleUnavailable(context, ErrorSeverity.CRITICAL);
    }

    // Execute critical operation with proper error handling
    return ErrorHandler.handleCriticalOperation(async () => {
      const nativeModule = getNativeModule();
      if (!nativeModule) {
        throw new Error('Native module resolved as null after availability check');
      }
      
      const location = await nativeModule.getCurrentLocation();
      
      // Validate returned location data
      InputValidator.coordinates(location.latitude, location.longitude, {
        ...context,
        operation: 'validateLocationResult'
      });

      return location;
    }, context);
  }

  /**
   * Get UV index data for coordinates
   * IMPORTANT operation - will return fallback data if module unavailable, throw on other errors
   */
  static async getUVIndexData(latitude: number, longitude: number): Promise<UVData> {
    const context = {
      module: this.MODULE_NAME,
      operation: 'getUVIndexData',
      platform: Platform.OS,
      parameters: { latitude, longitude },
    };

    // Validate input coordinates
    InputValidator.coordinates(latitude, longitude, context);

    // Check module availability
    const available = await this.isAvailable();
    if (!available) {
      logger.info('UV data unavailable, returning fallback data', {
        module: this.MODULE_NAME,
        latitude,
        longitude,
        fallback: true,
      });

      return {
        uvIndex: 7,
        maxUVToday: 9,
        peakTime: '12:00 PM',
        isFallback: true,
      };
    }

    // Execute important operation with error handling
    return ErrorHandler.handleImportantOperation(async () => {
      const nativeModule = getNativeModule();
      if (!nativeModule) {
        throw new Error('Native module resolved as null after availability check');
      }

      const uvData = await nativeModule.getUVIndexData(latitude, longitude);
      
      // Validate UV index range
      if (typeof uvData.uvIndex === 'number') {
        if (uvData.uvIndex < 0 || uvData.uvIndex > 12) {
          logger.warn('UV index out of expected range', {
            uvIndex: uvData.uvIndex,
            latitude,
            longitude,
          });
        }
      }

      return {
        ...uvData,
        isFallback: false,
      };
    }, context);
  }

  /**
   * Get weather data for coordinates
   * IMPORTANT operation - will return fallback data if module unavailable, throw on other errors
   */
  static async getWeatherData(latitude: number, longitude: number): Promise<WeatherData> {
    const context = {
      module: this.MODULE_NAME,
      operation: 'getWeatherData',
      platform: Platform.OS,
      parameters: { latitude, longitude },
    };

    // Validate input coordinates
    InputValidator.coordinates(latitude, longitude, context);

    // Check module availability
    const available = await this.isAvailable();
    if (!available) {
      logger.info('Weather data unavailable, returning fallback data', {
        module: this.MODULE_NAME,
        latitude,
        longitude,
        fallback: true,
      });

      return {
        temperature: 22,
        description: 'Sunny',
        weatherCode: 0, // Clear sky WMO code
        humidity: 65,
        windSpeed: 3.5,
        pressure: 1013,
        visibility: 10,
        feelsLike: 24,
        isFallback: true,
      };
    }

    // Execute important operation with error handling
    return ErrorHandler.handleImportantOperation(async () => {
      const nativeModule = getNativeModule();
      if (!nativeModule) {
        throw new Error('Native module resolved as null after availability check');
      }

      const nativeData = await nativeModule.getWeatherData(latitude, longitude);
      
      // Validate weather data ranges
      if (typeof nativeData.temperature === 'number') {
        if (nativeData.temperature < -100 || nativeData.temperature > 100) {
          logger.warn('Temperature out of expected range', {
            temperature: nativeData.temperature,
            latitude,
            longitude,
          });
        }
      }

      if (typeof nativeData.humidity === 'number') {
        if (nativeData.humidity < 0 || nativeData.humidity > 100) {
          logger.warn('Humidity out of expected range', {
            humidity: nativeData.humidity,
            latitude,
            longitude,
          });
        }
      }

      // Add weatherCode if not provided by native module (for backwards compatibility)
      return {
        ...nativeData,
        weatherCode: (nativeData as any).weatherCode ?? 0, // Default to clear sky if not provided
        isFallback: false,
      };
    }, context);
  }

  /**
   * Reset cached module for testing or troubleshooting
   * @internal
   */
  static _resetModuleCache(): void {
    cachedModule = null;
    moduleResolutionAttempted = false;
  }
}