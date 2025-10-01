/**
 * Weather service with API integration, error handling, and fallback support
 */

import {
    Coordinates,
    Forecast,
    SkinType,
    UVIndex,
    UVLevel,
    WeatherData
} from '@/src/types';
import { WeatherServiceConfig, WeatherServiceError } from '@/src/types/services';
import { logger } from './LoggerService';

class WeatherService {
  private static instance: WeatherService;
  private config: WeatherServiceConfig;

  private constructor() {
    this.config = {
      timeout: 10000, // 10 seconds
      retryAttempts: 3,
      cacheTimeout: 300000, // 5 minutes
    };
  }

  public static getInstance(): WeatherService {
    if (!WeatherService.instance) {
      WeatherService.instance = new WeatherService();
    }
    return WeatherService.instance;
  }

  /**
   * Fetch weather data for given coordinates
   */
  public async getWeatherData(coordinates: Coordinates): Promise<WeatherData> {
    try {
      logger.weather('Fetching weather data', { coordinates });

      // TODO: Implement actual API call to weather service
      // For now, return mock data as fallback
      return this.getMockWeatherData(coordinates);
    } catch (error) {
      logger.error('Failed to fetch weather data', error as Error, 'WEATHER');
      throw this.createError('FETCH_FAILED', 'Failed to fetch weather data', error as Error);
    }
  }

  /**
   * Fetch UV index data
   */
  public async getUVIndex(coordinates: Coordinates): Promise<UVIndex> {
    try {
      logger.weather('Fetching UV index', { coordinates });

      // TODO: Implement actual API call
      return this.getMockUVIndex();
    } catch (error) {
      logger.error('Failed to fetch UV index', error as Error, 'WEATHER');
      throw this.createError('UV_FETCH_FAILED', 'Failed to fetch UV index', error as Error);
    }
  }

  /**
   * Fetch forecast data
   */
  public async getForecast(coordinates: Coordinates): Promise<Forecast> {
    try {
      logger.weather('Fetching forecast', { coordinates });

      // TODO: Implement actual API call
      return this.getMockForecast(coordinates);
    } catch (error) {
      logger.error('Failed to fetch forecast', error as Error, 'WEATHER');
      throw this.createError('FORECAST_FAILED', 'Failed to fetch forecast', error as Error);
    }
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
  private getMockWeatherData(coordinates: Coordinates): WeatherData {
    // Use coordinates to determine mock location (simplified logic)
    const mockLocation = this.getMockLocationFromCoordinates(coordinates);

    // Base weather data with some variation based on coordinates
    const baseTemp = 20 + (coordinates.latitude * 0.5) + (coordinates.longitude * 0.1);
    const variation = Math.sin(coordinates.latitude) * 5;

    return {
      location: {
        coordinates,
        city: mockLocation.city,
        country: mockLocation.country,
        timezone: mockLocation.timezone,
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
  private getMockForecast(coordinates: Coordinates): Forecast {
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
        city: 'San Francisco',
        country: 'US',
      },
      days,
      updatedAt: Date.now(),
    };
  }
}

// Export singleton instance
export const weatherService = WeatherService.getInstance();
