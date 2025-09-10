import { Platform } from 'react-native';
import { logger } from '../../src/services/loggerService';

// Import TurboModule specification
import WeatherNativeModule from '../../src/specs/WeatherNativeModuleSpec';
import type { LocationData, WeatherData, UVData } from '../../src/specs/WeatherNativeModuleSpec';

// Fallback to legacy NativeModules for backwards compatibility
import { NativeModules } from 'react-native';

function getNativeModule() {
  // Try TurboModule first, fallback to legacy NativeModules
  if (WeatherNativeModule) {
    return WeatherNativeModule;
  } else {
    // Fallback to legacy NativeModules
    return (NativeModules as any)?.WeatherNativeModule;
  }
}

export class WeatherNativeService {
  static async isAvailable(): Promise<boolean> {
    if (Platform.OS === 'web') {
      return false;
    }

    const NativeWeatherModule = getNativeModule();
    if (!NativeWeatherModule || typeof NativeWeatherModule.isAvailable !== 'function') {
      return false;
    }

    try {
      const result = await NativeWeatherModule.isAvailable();
      return !!result;
    } catch (error) {
      logger.error(
        'Failed to check weather module availability',
        error instanceof Error ? error : new Error(String(error)),
      );
      return false;
    }
  }

  static async getCurrentLocation(): Promise<LocationData> {
    const available = await this.isAvailable();
    if (!available) {
      throw new Error('Weather native module not available on this platform');
    }

    try {
      const NativeWeatherModule = getNativeModule();
      return await NativeWeatherModule!.getCurrentLocation();
    } catch (error) {
      logger.error(
        'Failed to get current location',
        error instanceof Error ? error : new Error(String(error)),
      );
      throw error;
    }
  }

  static async getUVIndexData(
    latitude: number,
    longitude: number,
  ): Promise<UVData> {
    const available = await this.isAvailable();
    if (!available) {
      // Return mock data for development
      return {
        uvIndex: 7,
        maxUVToday: 9,
        peakTime: '12:00 PM',
      };
    }

    try {
      const NativeWeatherModule = getNativeModule();
      return await NativeWeatherModule!.getUVIndexData(latitude, longitude);
    } catch (error) {
      logger.error(
        'Failed to get UV index data',
        error instanceof Error ? error : new Error(String(error)),
      );
      throw error;
    }
  }

  static async getWeatherData(
    latitude: number,
    longitude: number,
  ): Promise<WeatherData> {
    const available = await this.isAvailable();
    if (!available) {
      // Return mock data for development
      return {
        temperature: 22,
        description: 'Sunny',
        weatherCode: 0, // Clear sky WMO code
        humidity: 65,
        windSpeed: 3.5,
        pressure: 1013,
        visibility: 10,
        feelsLike: 24,
      };
    }

    try {
      const NativeWeatherModule = getNativeModule();
      const nativeData = await NativeWeatherModule!.getWeatherData(latitude, longitude);
      // Add weatherCode if not provided by native module (for backwards compatibility)
      return {
        ...nativeData,
        weatherCode: (nativeData as any).weatherCode ?? 0, // Default to clear sky if not provided
      };
    } catch (error) {
      logger.error(
        'Failed to get weather data',
        error instanceof Error ? error : new Error(String(error)),
      );
      throw error;
    }
  }
}
