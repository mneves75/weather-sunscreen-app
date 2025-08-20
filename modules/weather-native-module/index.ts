import { NativeModules, Platform } from 'react-native';

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
      console.error('Failed to check weather module availability:', error);
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
      console.error('Failed to get current location:', error);
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
      console.error('Failed to get UV index data:', error);
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
        humidity: 65,
        windSpeed: 3.5,
        pressure: 1013,
        visibility: 10,
        feelsLike: 24,
      };
    }
    
    try {
      return await NativeWeatherModule.getWeatherData(latitude, longitude);
    } catch (error) {
      console.error('Failed to get weather data:', error);
      throw error;
    }
  }
}