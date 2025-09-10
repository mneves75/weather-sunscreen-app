import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export interface WeatherData {
  temperature: number;
  description: string;
  weatherCode: number;
  humidity: number;
  windSpeed: number;
  pressure: number;
  visibility: number;
  feelsLike: number;
  isFallback?: boolean;
}

export interface UVData {
  uvIndex: number;
  maxUVToday: number;
  peakTime: string;
  isFallback?: boolean;
}

export interface Spec extends TurboModule {
  /**
   * Check if the native weather module is available on this platform
   * @returns Promise<boolean> - true if available, false otherwise
   */
  isAvailable(): Promise<boolean>;

  /**
   * Get the current location of the device
   * @returns Promise<LocationData> - Current location coordinates and accuracy
   * @throws Error if location access is denied or unavailable
   */
  getCurrentLocation(): Promise<LocationData>;

  /**
   * Get weather data for the specified coordinates
   * @param latitude - Latitude coordinate (-90 to 90)
   * @param longitude - Longitude coordinate (-180 to 180)
   * @returns Promise<WeatherData> - Current weather conditions
   * @throws Error if coordinates are invalid or service is unavailable
   */
  getWeatherData(latitude: number, longitude: number): Promise<WeatherData>;

  /**
   * Get UV index data for the specified coordinates
   * @param latitude - Latitude coordinate (-90 to 90)
   * @param longitude - Longitude coordinate (-180 to 180)
   * @returns Promise<UVData> - Current UV index and forecast
   * @throws Error if coordinates are invalid or service is unavailable
   */
  getUVIndexData(latitude: number, longitude: number): Promise<UVData>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('WeatherNativeModule');