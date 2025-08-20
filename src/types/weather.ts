export interface WeatherData {
  location: {
    name: string;
    country: string;
    lat: number;
    lon: number;
  };
  current: {
    temperature: number;
    description: string;
    icon: string;
    humidity: number;
    windSpeed: number;
    pressure: number;
    visibility: number;
    feelsLike: number;
  };
  forecast: DailyForecast[];
  uvIndex: UVIndexData;
}

export interface DailyForecast {
  date: string;
  maxTemp: number;
  minTemp: number;
  description: string;
  icon: string;
  humidity: number;
  uvIndex: number;
  precipitationChance: number;
}

export interface UVIndexData {
  value: number;
  level: 'Low' | 'Moderate' | 'High' | 'Very High' | 'Extreme';
  maxToday: number;
  peakTime: string;
  sunscreenRecommendation: SunscreenRecommendation;
}

export interface SunscreenRecommendation {
  spf: number;
  applicationFrequency: string;
  additionalTips: string[];
  skinTypeRecommendations: {
    fair: string;
    medium: string;
    dark: string;
  };
}

export interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
}