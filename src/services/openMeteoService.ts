import { Location } from '../types/weather';
import { logger } from './loggerService';

export interface OpenMeteoForecastResponse {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  daily_units: {
    time: string;
    weather_code: string;
    temperature_2m_max: string;
    temperature_2m_min: string;
    uv_index_max: string;
    precipitation_sum: string;
    precipitation_probability_max: string;
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    uv_index_max: number[];
    precipitation_sum: number[];
    precipitation_probability_max: number[];
  };
}

export interface OpenMeteoDailyForecast {
  date: string;
  weatherCode: number;
  maxTemp: number;
  minTemp: number;
  uvIndex: number;
  precipitation: number;
  precipitationProbability: number;
}

export class OpenMeteoService {
  private static readonly BASE_URL = 'https://api.open-meteo.com/v1/forecast';
  private static readonly CACHE_DURATION = 15 * 60 * 1000; // 15 minutes as recommended by Open-Meteo
  private static forecastCache = new Map<
    string,
    { data: OpenMeteoDailyForecast[]; timestamp: number }
  >();

  /**
   * Get daily weather forecast for a location using Open-Meteo API
   * @param location - Latitude and longitude coordinates
   * @param days - Number of forecast days (default: 7, max: 16)
   * @returns Promise resolving to daily forecast array
   */
  static async getDailyForecast(
    location: Location,
    days: number = 7,
  ): Promise<OpenMeteoDailyForecast[]> {
    try {
      // Generate cache key
      const cacheKey = `${location.latitude.toFixed(3)},${location.longitude.toFixed(3)},${days}`;

      // Check cache first
      const cached = this.forecastCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
        logger.info('Using cached Open-Meteo forecast data', { cacheKey });
        return cached.data;
      }

      logger.info('Fetching fresh forecast data from Open-Meteo API', { location, days });

      // Build API URL with parameters
      const url = this.buildForecastUrl(location, days);

      // Make API request
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'User-Agent': 'WeatherSunscreenApp/1.0.0 (Mobile Weather & UV Protection App)', // Be respectful to the API
        },
      });

      if (!response.ok) {
        throw new Error(`Open-Meteo API error: ${response.status} ${response.statusText}`);
      }

      const data: OpenMeteoForecastResponse = await response.json();

      // Validate response structure
      if (!data.daily || !data.daily.time || data.daily.time.length === 0) {
        throw new Error('Invalid response structure from Open-Meteo API');
      }

      // Transform data to our format
      const forecast = this.transformForecastData(data);

      // Cache the result
      this.forecastCache.set(cacheKey, {
        data: forecast,
        timestamp: Date.now(),
      });

      // Clean up old cache entries (keep only last 10 entries)
      if (this.forecastCache.size > 10) {
        const oldestKey = Array.from(this.forecastCache.keys())[0];
        this.forecastCache.delete(oldestKey);
      }

      logger.info('Successfully fetched forecast data', { days: forecast.length });
      return forecast;
    } catch (error) {
      logger.error(
        'Failed to fetch Open-Meteo forecast',
        error instanceof Error ? error : new Error(String(error)),
      );

      // Try to return cached data if available (even if expired)
      const cacheKey = `${location.latitude.toFixed(3)},${location.longitude.toFixed(3)},${days}`;
      const cached = this.forecastCache.get(cacheKey);
      if (cached) {
        logger.warn('Using expired cached data due to API error', { cacheKey });
        return cached.data;
      }

      throw new Error(
        `Unable to fetch weather forecast: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Build the forecast API URL with proper parameters
   */
  private static buildForecastUrl(location: Location, days: number): string {
    const clampedDays = Math.max(1, Math.min(days, 16));
    const params = new URLSearchParams({
      latitude: location.latitude.toString(),
      longitude: location.longitude.toString(),
      daily: [
        'weather_code',
        'temperature_2m_max',
        'temperature_2m_min',
        'uv_index_max',
        'precipitation_sum',
        'precipitation_probability_max',
      ].join(','),
      timezone: 'auto', // Automatically detect timezone based on coordinates
      forecast_days: clampedDays.toString(), // Open-Meteo supports 1..16 days
    });

    return `${this.BASE_URL}?${params.toString()}`;
  }

  /**
   * Transform Open-Meteo API response to our internal format
   */
  private static transformForecastData(data: OpenMeteoForecastResponse): OpenMeteoDailyForecast[] {
    const { daily } = data;
    const forecast: OpenMeteoDailyForecast[] = [];

    for (let i = 0; i < daily.time.length; i++) {
      forecast.push({
        date: daily.time[i],
        weatherCode: daily.weather_code[i] || 0,
        maxTemp: daily.temperature_2m_max[i] || 0,
        minTemp: daily.temperature_2m_min[i] || 0,
        uvIndex: daily.uv_index_max[i] || 0,
        precipitation: daily.precipitation_sum[i] || 0,
        precipitationProbability: daily.precipitation_probability_max[i] || 0,
      });
    }

    return forecast;
  }

  /**
   * Get current weather from Open-Meteo (if needed as fallback)
   */
  static async getCurrentWeather(location: Location): Promise<{
    temperature: number;
    weatherCode: number;
    humidity: number;
    windSpeed: number;
    pressure: number;
  }> {
    try {
      const url = `${this.BASE_URL}?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,surface_pressure,weather_code`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      return {
        temperature: data.current.temperature_2m || 0,
        weatherCode: data.current.weather_code || 0,
        humidity: data.current.relative_humidity_2m || 0,
        windSpeed: data.current.wind_speed_10m || 0,
        pressure: data.current.surface_pressure || 1013,
      };
    } catch (error) {
      logger.error(
        'Failed to fetch current weather from Open-Meteo',
        error instanceof Error ? error : new Error(String(error)),
      );
      throw error;
    }
  }

  /**
   * Clear all cached forecast data
   */
  static clearCache(): void {
    this.forecastCache.clear();
    logger.info('Open-Meteo forecast cache cleared');
  }

  /**
   * Get cache statistics for debugging
   */
  static getCacheStats(): { size: number; entries: string[] } {
    return {
      size: this.forecastCache.size,
      entries: Array.from(this.forecastCache.keys()),
    };
  }
}

// Compatibility wrapper used by integration tests
export const openMeteoService = {
  async fetchWeatherData({ latitude, longitude }: { latitude: number; longitude: number }) {
    const loc: Location = { latitude, longitude } as Location;
    try {
      const [current, daily] = await Promise.all([
        OpenMeteoService.getCurrentWeather(loc),
        OpenMeteoService.getDailyForecast(loc, 7),
      ]);

      const condition = mapWeatherCodeToCondition(daily[0]?.weatherCode ?? 0);
      const hourlyForecast: Array<{ time: string; temp: number; condition: string }> = [];
      // Basic synthetic hourly forecast from current/daily trend
      for (let i = 0; i < 24; i++) {
        const base = current.temperature;
        hourlyForecast.push({
          time: new Date(Date.now() + i * 3600000).toISOString(),
          temp: Math.round(base + Math.sin(i / 4) * 2),
          condition,
        });
      }

      return {
        location: 'Current Location',
        currentTemp: Math.round(current.temperature),
        feelsLike: Math.round(current.temperature),
        humidity: Math.round(current.humidity ?? 50),
        windSpeed: Math.round(current.windSpeed ?? 0),
        condition,
        uvIndex: Math.round(daily[0]?.uvIndex ?? 0),
        hourlyForecast,
        dailyForecast: daily.map((d) => ({
          date: d.date,
          maxTemp: Math.round(d.maxTemp),
          minTemp: Math.round(d.minTemp),
          condition: mapWeatherCodeToCondition(d.weatherCode),
          precipitation: Math.round(d.precipitation),
        })),
        timestamp: Date.now(),
      };
    } catch (error) {
      logger.error(
        'fetchWeatherData failed',
        error instanceof Error ? error : new Error(String(error)),
      );
      throw error;
    }
  },

  async fetchUVIndexData(latitude: number, longitude: number) {
    const loc: Location = { latitude, longitude } as Location;
    try {
      const daily = await OpenMeteoService.getDailyForecast(loc, 1);
      const current = Math.round(daily[0]?.uvIndex ?? 0);
      return {
        current,
        max: current,
        safe_exposure_time: {
          st1: 30,
          st2: 40,
          st3: 50,
          st4: 60,
          st5: 70,
          st6: 80,
        },
      };
    } catch (error) {
      logger.error(
        'fetchUVIndexData failed',
        error instanceof Error ? error : new Error(String(error)),
      );
      throw error;
    }
  },
};

function mapWeatherCodeToCondition(code: number): string {
  switch (code) {
    case 0:
      return 'Clear';
    case 1:
    case 2:
      return 'Partly Cloudy';
    case 3:
      return 'Cloudy';
    case 45:
    case 48:
      return 'Fog';
    case 51:
    case 53:
    case 55:
      return 'Drizzle';
    case 61:
    case 63:
    case 65:
      return 'Rain';
    case 71:
    case 73:
    case 75:
      return 'Snow';
    case 95:
      return 'Thunderstorm';
    default:
      return 'Clear';
  }
}
