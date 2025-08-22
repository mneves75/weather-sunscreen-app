import * as Location from 'expo-location';
import { WeatherNativeService } from '../../modules/weather-native-module';
import { WeatherData, Location as LocationType, UVIndexData, DailyForecast } from '../types/weather';
import { LocationService } from './locationService';
import { OpenMeteoService } from './openMeteoService';
import { getWeatherDescription, getWeatherIcon } from '../utils/weatherCodeMapping';
import { logger } from './loggerService';

export class WeatherService {
  private static readonly CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
  private static cachedData: { data: WeatherData; timestamp: number } | null = null;

  static async getCurrentWeatherData(): Promise<WeatherData> {
    try {
      // Check cache first
      if (this.cachedData && Date.now() - this.cachedData.timestamp < this.CACHE_DURATION) {
        return this.cachedData.data;
      }

      // Get current location
      const location = await this.getCurrentLocation();
      
      // Get weather and UV data in parallel
      const [weatherData, uvData] = await Promise.all([
        this.getWeatherDataForLocation(location),
        this.getUVIndexDataForLocation(location),
      ]);

      // Get detailed location information using our enhanced location service
      const locationInfo = await LocationService.getDetailedLocationInfo(location);

      const completeWeatherData: WeatherData = {
        location: {
          name: locationInfo.name,
          country: locationInfo.country,
          lat: location.latitude,
          lon: location.longitude,
        },
        current: weatherData,
        forecast: await this.getForecastData(location), // This will be implemented later
        uvIndex: uvData,
      };

      // Cache the data
      this.cachedData = {
        data: completeWeatherData,
        timestamp: Date.now(),
      };

      return completeWeatherData;
    } catch (error) {
      logger.error('Failed to get weather data', error instanceof Error ? error : new Error(String(error)));
      throw new Error('Unable to fetch weather data. Please check your location settings and internet connection.');
    }
  }

  private static async getCurrentLocation(): Promise<LocationType> {
    try {
      // Try native module first for better performance
      const nativeAvailable = await WeatherNativeService.isAvailable();
      if (nativeAvailable) {
        return await WeatherNativeService.getCurrentLocation();
      }
    } catch (error) {
      logger.warn('Native location service failed, falling back to enhanced location service', { error: String(error) });
    }

    // Fallback to our enhanced location service
    return await LocationService.getCurrentLocation();
  }

  private static async getWeatherDataForLocation(location: LocationType) {
    try {
      const nativeAvailable = await WeatherNativeService.isAvailable();
      if (nativeAvailable) {
        const nativeData = await WeatherNativeService.getWeatherData(location.latitude, location.longitude);
        // Use proper weather code mapping for icon
        const weatherCode = (nativeData as any).weatherCode ?? 0; // Default to clear sky if not provided
        return {
          ...nativeData,
          icon: getWeatherIcon(weatherCode),
        };
      }
    } catch (error) {
      logger.warn('Native weather service failed, using mock data', { error: String(error) });
    }

    // Fallback to mock data for development
    const fallbackWeatherCode = 0; // Clear sky
    return {
      temperature: 22,
      description: getWeatherDescription(fallbackWeatherCode),
      icon: getWeatherIcon(fallbackWeatherCode),
      humidity: 65,
      windSpeed: 3.5,
      pressure: 1013,
      visibility: 10,
      feelsLike: 24,
    };
  }

  private static async getUVIndexDataForLocation(location: LocationType): Promise<UVIndexData> {
    try {
      const nativeAvailable = await WeatherNativeService.isAvailable();
      if (nativeAvailable) {
        const uvData = await WeatherNativeService.getUVIndexData(location.latitude, location.longitude);
        
        return {
          value: uvData.uvIndex,
          level: this.getUVLevel(uvData.uvIndex),
          maxToday: uvData.maxUVToday,
          peakTime: uvData.peakTime,
          sunscreenRecommendation: this.getSunscreenRecommendation(uvData.uvIndex),
        };
      }
    } catch (error) {
      logger.warn('Native UV service failed, using mock data', { error: String(error) });
    }

    // Fallback to mock data
    const uvValue = 7;
    return {
      value: uvValue,
      level: this.getUVLevel(uvValue),
      maxToday: 9,
      peakTime: '12:00 PM',
      sunscreenRecommendation: this.getSunscreenRecommendation(uvValue),
    };
  }

  private static getUVLevel(uvIndex: number): 'Low' | 'Moderate' | 'High' | 'Very High' | 'Extreme' {
    if (uvIndex <= 2) return 'Low';
    if (uvIndex <= 5) return 'Moderate';
    if (uvIndex <= 7) return 'High';
    if (uvIndex <= 10) return 'Very High';
    return 'Extreme';
  }

  private static getSunscreenRecommendation(uvIndex: number) {
    if (uvIndex <= 2) {
      return {
        spf: 15,
        applicationFrequency: 'Every 3-4 hours',
        additionalTips: ['Minimal protection needed', 'Safe to be outside'],
        skinTypeRecommendations: {
          fair: 'SPF 15+ recommended',
          medium: 'SPF 15+ recommended',
          dark: 'SPF 15+ recommended',
        },
      };
    } else if (uvIndex <= 5) {
      return {
        spf: 30,
        applicationFrequency: 'Every 2-3 hours',
        additionalTips: ['Wear sunglasses', 'Use shade during peak hours'],
        skinTypeRecommendations: {
          fair: 'SPF 30+ recommended',
          medium: 'SPF 15+ recommended',
          dark: 'SPF 15+ recommended',
        },
      };
    } else if (uvIndex <= 7) {
      return {
        spf: 30,
        applicationFrequency: 'Every 2 hours',
        additionalTips: ['Seek shade during peak hours', 'Wear protective clothing'],
        skinTypeRecommendations: {
          fair: 'SPF 50+ recommended',
          medium: 'SPF 30+ recommended',
          dark: 'SPF 15+ recommended',
        },
      };
    } else if (uvIndex <= 10) {
      return {
        spf: 50,
        applicationFrequency: 'Every 1-2 hours',
        additionalTips: ['Avoid sun exposure 10 AM - 4 PM', 'Wear protective clothing and sunglasses'],
        skinTypeRecommendations: {
          fair: 'SPF 50+ recommended',
          medium: 'SPF 50+ recommended',
          dark: 'SPF 30+ recommended',
        },
      };
    } else {
      return {
        spf: 50,
        applicationFrequency: 'Every hour',
        additionalTips: ['Avoid sun exposure', 'Stay indoors or in deep shade', 'Wear full protective clothing'],
        skinTypeRecommendations: {
          fair: 'SPF 50+ recommended - avoid sun',
          medium: 'SPF 50+ recommended',
          dark: 'SPF 50+ recommended',
        },
      };
    }
  }


  private static async getForecastData(location: LocationType): Promise<DailyForecast[]> {
    try {
      logger.info('Fetching 7-day forecast using Open-Meteo API');
      
      // Get forecast data from Open-Meteo
      const openMeteoForecast = await OpenMeteoService.getDailyForecast(location, 7);
      
      // Transform Open-Meteo data to our DailyForecast format
      const forecast: DailyForecast[] = openMeteoForecast.map(day => ({
        date: day.date,
        maxTemp: Math.round(day.maxTemp),
        minTemp: Math.round(day.minTemp),
        description: getWeatherDescription(day.weatherCode),
        icon: getWeatherIcon(day.weatherCode),
        humidity: 0, // Open-Meteo doesn't provide daily humidity, we could get hourly average later
        uvIndex: Math.round(day.uvIndex),
        precipitationChance: Math.round(day.precipitationProbability),
      }));
      
      logger.info('Successfully mapped forecast days', { count: forecast.length });
      return forecast;
      
    } catch (error) {
      logger.error('Failed to fetch forecast data', error instanceof Error ? error : new Error(String(error)));
      
      // Return empty array to show "coming soon" message rather than breaking the app
      // This ensures the current weather still works even if forecast fails
      logger.info('Falling back to empty forecast due to API error');
      return [];
    }
  }

  static clearCache(): void {
    this.cachedData = null;
  }
}