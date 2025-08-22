import { NativeModules, Platform } from 'react-native';
import { logger } from '../../src/services/loggerService';

interface WeatherNativeModule {
  isAvailable(): Promise<boolean>;
  getCurrentLocation(): Promise<{
    latitude: number;
    longitude: number;
    accuracy?: number;
  }>;
  getUVIndexData(latitude: number, longitude: number): Promise<{
    uvIndex: number;
    maxUVToday: number;
    peakTime: string;
  }>;
  getWeatherData(latitude: number, longitude: number): Promise<{
    temperature: number;
    description: string;
    weatherCode?: number;
    humidity: number;
    windSpeed: number;
    pressure: number;
    visibility: number;
    feelsLike: number;
  }>;
}

const { WeatherNativeModule: NativeWeatherModule } = NativeModules;

export class WeatherNativeService {
  static async isAvailable(): Promise<boolean> {
    if (Platform.OS === 'web') {
      return false;
    }
    
    if (!NativeWeatherModule) {
      return false;
    }
    
    try {
      return await NativeWeatherModule.isAvailable();
    } catch (error) {
      logger.error('Failed to check weather module availability', error instanceof Error ? error : new Error(String(error)));
      return false;
    }
  }
  
  static async getCurrentLocation(): Promise<{
    latitude: number;
    longitude: number;
    accuracy?: number;
  }> {
    const available = await this.isAvailable();
    if (!available) {
      throw new Error('Weather native module not available on this platform');
    }
    
    try {
      return await NativeWeatherModule.getCurrentLocation();
    } catch (error) {
      logger.error('Failed to get current location', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }
  
  static async getUVIndexData(latitude: number, longitude: number): Promise<{
    uvIndex: number;
    maxUVToday: number;
    peakTime: string;
  }> {
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
      return await NativeWeatherModule.getUVIndexData(latitude, longitude);
    } catch (error) {
      logger.error('Failed to get UV index data', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }
  
  static async getWeatherData(latitude: number, longitude: number): Promise<{
    temperature: number;
    description: string;
    humidity: number;
    windSpeed: number;
    pressure: number;
    visibility: number;
    feelsLike: number;
  }> {
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
      } as any;
    }
    
    try {
      const nativeData = await NativeWeatherModule.getWeatherData(latitude, longitude);
      // Add weatherCode if not provided by native module (for backwards compatibility)
      return {
        ...nativeData,
        weatherCode: (nativeData as any).weatherCode ?? 0, // Default to clear sky if not provided
      };
    } catch (error) {
      logger.error('Failed to get weather data', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }
}