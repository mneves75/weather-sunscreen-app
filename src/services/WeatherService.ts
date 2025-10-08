/**
 * Weather service with API integration, error handling, and fallback support
 */

import {
    Coordinates,
    Forecast,
    Location,
    SkinType,
    UVIndex,
    UVLevel,
    WeatherData
} from '@/src/types';
import { WeatherServiceConfig, WeatherServiceError } from '@/src/types/services';
import { logger } from './LoggerService';
import { openMeteoClient } from './OpenMeteoClient';
import { OpenMeteoMapper } from './OpenMeteoMapper';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  coordinates: Coordinates;
}

class WeatherService {
  private config: WeatherServiceConfig;
  private weatherCache: CacheEntry<WeatherData> | null = null;
  private uvCache: CacheEntry<UVIndex> | null = null;
  private forecastCache: CacheEntry<Forecast> | null = null;

  constructor() {
    this.config = {
      timeout: 10000, // 10 seconds
      retryAttempts: 3,
      cacheTimeout: 300000, // 5 minutes
    };
  }

  /**
   * Check if cached data is still valid
   */
  private isCacheValid<T>(
    cache: CacheEntry<T> | null,
    coordinates: Coordinates
  ): cache is CacheEntry<T> {
    if (!cache) return false;

    const now = Date.now();
    const isExpired = now - cache.timestamp > this.config.cacheTimeout;
    const isSameLocation =
      cache.coordinates.latitude === coordinates.latitude &&
      cache.coordinates.longitude === coordinates.longitude;

    return !isExpired && isSameLocation;
  }

  /**
   * Fetch weather data for given coordinates
   */
  public async getWeatherData(
    coordinates: Coordinates,
    locationDetails?: Partial<Location>
  ): Promise<WeatherData> {
    try {
      // Check cache first
      if (this.isCacheValid(this.weatherCache, coordinates)) {
        logger.debug('Returning cached weather data', 'WEATHER', { coordinates });

        if (locationDetails) {
          // Return new object with updated location details (immutable)
          return {
            ...this.weatherCache.data,
            location: {
              coordinates: this.weatherCache.data.location.coordinates ?? coordinates,
              city: locationDetails.city ?? this.weatherCache.data.location.city,
              country: locationDetails.country ?? this.weatherCache.data.location.country,
              timezone: locationDetails.timezone ?? this.weatherCache.data.location.timezone,
            },
          };
        }

        return this.weatherCache.data;
      }

      logger.weather('Fetching weather data from Open-Meteo', { coordinates });

      // Fetch from Open-Meteo API
      const rawData = await openMeteoClient.getCurrentWeather(coordinates);

      // Transform to app data structure
      const weatherData = OpenMeteoMapper.transformCurrentWeather(
        rawData,
        coordinates,
        locationDetails
      );

      // Fetch and add UV index
      try {
        const uvIndex = await this.getUVIndex(coordinates);
        weatherData.uvIndex = uvIndex;
      } catch (error) {
        logger.warn('Failed to fetch UV index, continuing without it', 'WEATHER', { error });
      }

      // Cache the result
      this.weatherCache = {
        data: weatherData,
        timestamp: Date.now(),
        coordinates,
      };

      logger.info('Weather data fetched successfully', 'WEATHER', {
        coordinates,
        locationDetails,
      });
      return weatherData;
    } catch (error) {
      logger.error('Failed to fetch weather data', error as Error, 'WEATHER');

      // Try to return cached data even if expired
      if (this.weatherCache?.coordinates.latitude === coordinates.latitude &&
          this.weatherCache?.coordinates.longitude === coordinates.longitude) {
        logger.warn('Returning stale cached weather data due to API failure');
        return this.weatherCache.data;
      }

      // Fall back to mock data
      logger.warn('Falling back to mock weather data');
      return this.getMockWeatherData(coordinates, locationDetails);
    }
  }

  /**
   * Fetch UV index data
   */
  public async getUVIndex(coordinates: Coordinates): Promise<UVIndex> {
    try {
      // Check cache first
      if (this.isCacheValid(this.uvCache, coordinates)) {
        logger.debug('Returning cached UV index', 'WEATHER', { coordinates });
        return this.uvCache.data;
      }

      logger.weather('Fetching UV index from Open-Meteo', { coordinates });

      // Fetch from Open-Meteo API
      const rawData = await openMeteoClient.getUVIndex(coordinates);

      // Transform to app data structure
      const uvIndex = OpenMeteoMapper.transformUVIndex(rawData);

      // Cache the result
      this.uvCache = {
        data: uvIndex,
        timestamp: Date.now(),
        coordinates,
      };

      logger.info('UV index fetched successfully', 'WEATHER', { coordinates, uvIndex: uvIndex.value });
      return uvIndex;
    } catch (error) {
      logger.error('Failed to fetch UV index', error as Error, 'WEATHER');

      // Try to return cached data even if expired
      if (this.uvCache?.coordinates.latitude === coordinates.latitude &&
          this.uvCache?.coordinates.longitude === coordinates.longitude) {
        logger.warn('Returning stale cached UV index due to API failure');
        return this.uvCache.data;
      }

      // Fall back to mock data
      logger.warn('Falling back to mock UV index');
      return this.getMockUVIndex();
    }
  }

  /**
   * Fetch forecast data
   */
  public async getForecast(
    coordinates: Coordinates,
    locationDetails?: Partial<Location>
  ): Promise<Forecast> {
    try {
      // Check cache first
      if (this.isCacheValid(this.forecastCache, coordinates)) {
        logger.debug('Returning cached forecast', 'WEATHER', { coordinates });

        if (locationDetails) {
          // Return new object with updated location details (immutable)
          return {
            ...this.forecastCache.data,
            location: {
              coordinates: this.forecastCache.data.location.coordinates ?? coordinates,
              city: locationDetails.city ?? this.forecastCache.data.location.city,
              country: locationDetails.country ?? this.forecastCache.data.location.country,
            },
          };
        }

        return this.forecastCache.data;
      }

      logger.weather('Fetching forecast from Open-Meteo', { coordinates });

      // Fetch from Open-Meteo API
      const rawData = await openMeteoClient.getForecast(coordinates);

      // Transform to app data structure
      const forecast = OpenMeteoMapper.transformForecast(
        rawData.hourly,
        rawData.daily,
        coordinates,
        locationDetails
      );

      // Cache the result
      this.forecastCache = {
        data: forecast,
        timestamp: Date.now(),
        coordinates,
      };

      logger.info('Forecast fetched successfully', 'WEATHER', {
        coordinates,
        days: forecast.days.length,
        locationDetails,
      });
      return forecast;
    } catch (error) {
      logger.error('Failed to fetch forecast', error as Error, 'WEATHER');

      // Try to return cached data even if expired
      if (this.forecastCache?.coordinates.latitude === coordinates.latitude &&
          this.forecastCache?.coordinates.longitude === coordinates.longitude) {
        logger.warn('Returning stale cached forecast due to API failure');
        return this.forecastCache.data;
      }

      // Fall back to mock data
      logger.warn('Falling back to mock forecast');
      return this.getMockForecast(coordinates, locationDetails);
    }
  }

  /**
   * Clear all cached data
   */
  public clearCache(): void {
    this.weatherCache = null;
    this.uvCache = null;
    this.forecastCache = null;
    logger.info('Weather cache cleared');
  }

  /**
   * Force refresh data (bypass cache)
   */
  public async refreshWeatherData(
    coordinates: Coordinates,
    locationDetails?: Partial<Location>
  ): Promise<WeatherData> {
    this.clearCache();
    return this.getWeatherData(coordinates, locationDetails);
  }

  public async refreshUVIndex(coordinates: Coordinates): Promise<UVIndex> {
    this.uvCache = null;
    return this.getUVIndex(coordinates);
  }

  public async refreshForecast(
    coordinates: Coordinates,
    locationDetails?: Partial<Location>
  ): Promise<Forecast> {
    this.forecastCache = null;
    return this.getForecast(coordinates, locationDetails);
  }

  /**
   * Calculate UV level from UV index value
   */
  public calculateUVLevel(uvIndex: number): UVLevel {
    if (uvIndex >= 0 && uvIndex <= 2) return 'low';
    if (uvIndex >= 3 && uvIndex <= 5) return 'moderate';
    if (uvIndex >= 6 && uvIndex <= 7) return 'high';
    if (uvIndex >= 8 && uvIndex <= 10) return 'very-high';
    return 'extreme';
  }

  /**
   * Get SPF recommendation based on UV index and skin type
   */
  public getSPFRecommendation(uvIndex: number, skinType: SkinType): number {
    const baseSpf: Record<SkinType, number> = {
      'very-fair': 50,
      'fair': 30,
      'medium': 20,
      'olive': 15,
      'brown': 15,
      'black': 15,
    };

    const spf = baseSpf[skinType];

    // Increase SPF for higher UV levels
    if (uvIndex >= 8) {
      return Math.min(spf + 20, 50);
    }
    if (uvIndex >= 6) {
      return Math.min(spf + 10, 50);
    }

    return spf;
  }

  /**
   * Create a service error
   */
  private createError(code: string, message: string, originalError?: Error): WeatherServiceError {
    return {
      code,
      message,
      originalError,
      timestamp: Date.now(),
    };
  }

  /**
   * Get mock location based on coordinates for more realistic testing
   */
  private getMockLocationFromCoordinates(coordinates: Coordinates): {
    city: string;
    country: string;
    timezone: string;
  } {
    // Simple logic to determine mock location based on coordinates
    // This provides more realistic testing scenarios

    if (coordinates.latitude > 40) {
      // Northern regions
      return {
        city: 'New York',
        country: 'US',
        timezone: 'America/New_York',
      };
    } else if (coordinates.latitude > 30) {
      // Central regions
      return {
        city: 'San Francisco',
        country: 'US',
        timezone: 'America/Los_Angeles',
      };
    } else if (coordinates.latitude > 20) {
      // Southern regions
      return {
        city: 'São Paulo',
        country: 'BR',
        timezone: 'America/Sao_Paulo',
      };
    } else {
      // Tropical regions
      return {
        city: 'Rio de Janeiro',
        country: 'BR',
        timezone: 'America/Sao_Paulo',
      };
    }
  }

  /**
   * Mock weather data for development/fallback
   * Uses coordinates to determine mock location for more realistic testing
   */
  private getMockWeatherData(
    coordinates: Coordinates,
    locationDetails?: Partial<Location>
  ): WeatherData {
    // Use coordinates to determine mock location (simplified logic)
    const mockLocation = this.getMockLocationFromCoordinates(coordinates);

    // Base weather data with some variation based on coordinates
    const baseTemp = 20 + (coordinates.latitude * 0.5) + (coordinates.longitude * 0.1);
    const variation = Math.sin(coordinates.latitude) * 5;

    return {
      location: {
        coordinates,
        city: locationDetails?.city ?? mockLocation.city,
        country: locationDetails?.country ?? mockLocation.country,
        timezone: locationDetails?.timezone ?? mockLocation.timezone,
      },
      current: {
        temperature: Math.round(baseTemp + variation),
        feelsLike: Math.round(baseTemp + variation - 1),
        humidity: 60 + Math.floor(Math.random() * 20),
        pressure: 1010 + Math.floor(Math.random() * 10),
        windSpeed: 10 + Math.floor(Math.random() * 15),
        windDirection: Math.floor(Math.random() * 360),
        visibility: 8000 + Math.floor(Math.random() * 4000),
        cloudCover: Math.floor(Math.random() * 80),
        condition: {
          id: 800,
          main: 'Clear',
          description: 'clear sky',
          icon: '01d',
          wmoCode: 0,
        },
        timestamp: Date.now(),
      },
    };
  }

  /**
   * Mock UV index for development/fallback
   */
  private getMockUVIndex(): UVIndex {
    const value = 6; // High UV level
    const level = this.calculateUVLevel(value);
    const spfRecommendation = this.getSPFRecommendation(value, 'medium'); // Use actual calculation

    return {
      value,
      level,
      peakTime: '12:00 PM',
      recommendations: [
        {
          type: 'spf',
          message: `Use SPF ${spfRecommendation}+ sunscreen`,
          priority: 'high',
        },
        {
          type: 'shade',
          message: 'Seek shade during midday hours',
          priority: 'medium',
        },
      ],
      timestamp: Date.now(),
    };
  }

  /**
   * Mock forecast for development/fallback
   * Uses deterministic calculations based on day index for consistent testing
   */
  private getMockForecast(
    coordinates: Coordinates,
    locationDetails?: Partial<Location>
  ): Forecast {
    const days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() + i);

      // Use deterministic calculations based on day index and coordinates
      const baseTemp = 20 + (coordinates.latitude * 0.5) + (coordinates.longitude * 0.1);
      const tempVariation = Math.sin(i) * 3; // Sine wave pattern for realistic variation
      const maxTemp = Math.round(baseTemp + tempVariation + 5);
      const minTemp = Math.round(baseTemp + tempVariation - 5);

      // Use deterministic pseudo-random based on coordinates and day index
      const seed = coordinates.latitude + coordinates.longitude + i;
      const pseudoRandom = (seed * 9301 + 49297) % 233280 / 233280; // Simple LCG

      return {
        date: date.toISOString().split('T')[0],
        temperature: {
          min: minTemp,
          max: maxTemp,
          morning: Math.round((minTemp + maxTemp) / 2 - 2),
          afternoon: maxTemp,
          evening: Math.round((minTemp + maxTemp) / 2 + 1),
          night: minTemp,
        },
        condition: {
          id: 800,
          main: 'Clear',
          description: 'clear sky',
          icon: '01d',
          wmoCode: 0,
        },
        precipitation: {
          probability: Math.round(pseudoRandom * 40), // 0-40% chance
          amount: 0,
        },
        uvIndex: {
          max: Math.max(2, Math.min(8, Math.round(4 + pseudoRandom * 4))), // 2-8 range
          level: this.calculateUVLevel(Math.round(4 + pseudoRandom * 4)),
        },
        wind: {
          speed: Math.round(8 + pseudoRandom * 12), // 8-20 km/h
          direction: Math.round(pseudoRandom * 360),
        },
        humidity: Math.round(55 + pseudoRandom * 25), // 55-80%
      };
    });

    return {
      location: {
        coordinates,
        city: locationDetails?.city ?? 'San Francisco',
        country: locationDetails?.country ?? 'US',
      },
      days,
      updatedAt: Date.now(),
    };
  }
}

// Export single instance (simple module pattern)
export const weatherService = new WeatherService();
