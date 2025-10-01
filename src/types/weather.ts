/**
 * Weather-related TypeScript type definitions
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Location {
  coordinates: Coordinates;
  city?: string;
  country?: string;
  timezone?: string;
}

export interface WeatherCondition {
  id: number;
  main: string;
  description: string;
  icon: string;
  wmoCode?: number; // WMO weather code for standardized icons
}

export interface WeatherData {
  location: Location;
  current: {
    temperature: number;
    feelsLike: number;
    humidity: number;
    pressure: number;
    windSpeed: number;
    windDirection: number;
    visibility: number;
    cloudCover: number;
    condition: WeatherCondition;
    timestamp: number;
  };
  uvIndex?: UVIndex;
}

export interface UVIndex {
  value: number;
  level: UVLevel;
  peakTime?: string;
  recommendations: UVRecommendation[];
  timestamp: number;
}

export type UVLevel = 'low' | 'moderate' | 'high' | 'very-high' | 'extreme';

export interface UVRecommendation {
  type: 'spf' | 'clothing' | 'timing' | 'shade' | 'sunglasses';
  message: string;
  priority: 'low' | 'medium' | 'high';
}

export interface ForecastDay {
  date: string;
  temperature: {
    min: number;
    max: number;
    morning: number;
    afternoon: number;
    evening: number;
    night: number;
  };
  condition: WeatherCondition;
  precipitation: {
    probability: number;
    amount?: number;
  };
  uvIndex: {
    max: number;
    level: UVLevel;
  };
  wind: {
    speed: number;
    direction: number;
    gusts?: number;
  };
  humidity: number;
}

export interface Forecast {
  location: Location;
  days: ForecastDay[];
  updatedAt: number;
}

export type TemperatureUnit = 'celsius' | 'fahrenheit';
export type SpeedUnit = 'kmh' | 'mph' | 'ms';
export type PressureUnit = 'hPa' | 'inHg' | 'mmHg';

export interface WeatherUnits {
  temperature: TemperatureUnit;
  speed: SpeedUnit;
  pressure: PressureUnit;
}

// Re-export SkinType from services for convenience
export type { SkinType } from './services';
