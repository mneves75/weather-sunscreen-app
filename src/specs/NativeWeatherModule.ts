import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  uvIndex: number;
  conditions: string;
  sunrise: string;
  sunset: string;
  timestamp: number;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
  timestamp: number;
}

export interface Spec extends TurboModule {
  // Check module availability
  isAvailable(): Promise<boolean>;
  
  // Location services
  getCurrentLocation(): Promise<LocationData>;
  requestLocationPermissions(): Promise<boolean>;
  
  // Weather data
  getWeatherData(
    latitude: number,
    longitude: number
  ): Promise<WeatherData>;
  
  // UV calculations
  calculateUVIndex(
    latitude: number,
    longitude: number,
    timestamp?: number
  ): Promise<number>;
  
  // Cache management
  clearWeatherCache(): Promise<void>;
  
  // Constants
  getConstants(): {
    hasWeatherKit: boolean;
    hasCoreLocation: boolean;
    apiVersion: string;
  };
}

export default TurboModuleRegistry.getEnforcing<Spec>('WeatherNativeModule');