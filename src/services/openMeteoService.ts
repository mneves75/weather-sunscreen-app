import { Location } from '../types/weather';

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
  private static forecastCache = new Map<string, { data: OpenMeteoDailyForecast[]; timestamp: number }>();

  /**
   * Get daily weather forecast for a location using Open-Meteo API
   * @param location - Latitude and longitude coordinates
   * @param days - Number of forecast days (default: 7, max: 16)
   * @returns Promise resolving to daily forecast array
   */
  static async getDailyForecast(location: Location, days: number = 7): Promise<OpenMeteoDailyForecast[]> {
    try {
      // Generate cache key
      const cacheKey = `${location.latitude.toFixed(3)},${location.longitude.toFixed(3)},${days}`;
      
      // Check cache first
      const cached = this.forecastCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
        console.log('🗄️ Using cached Open-Meteo forecast data');
        return cached.data;
      }

      console.log('🌐 Fetching fresh forecast data from Open-Meteo API');
      
      // Build API URL with parameters
      const url = this.buildForecastUrl(location, days);
      
      // Make API request
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
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

      console.log(`✅ Successfully fetched ${forecast.length} days of forecast data`);
      return forecast;

    } catch (error) {
      console.error('❌ Failed to fetch Open-Meteo forecast:', error);
      
      // Try to return cached data if available (even if expired)
      const cacheKey = `${location.latitude.toFixed(3)},${location.longitude.toFixed(3)},${days}`;
      const cached = this.forecastCache.get(cacheKey);
      if (cached) {
        console.log('📱 Using expired cached data due to API error');
        return cached.data;
      }
      
      throw new Error(`Unable to fetch weather forecast: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Build the forecast API URL with proper parameters
   */
  private static buildForecastUrl(location: Location, days: number): string {
    const params = new URLSearchParams({
      latitude: location.latitude.toString(),
      longitude: location.longitude.toString(),
      daily: [
        'weather_code',
        'temperature_2m_max',
        'temperature_2m_min', 
        'uv_index_max',
        'precipitation_sum',
        'precipitation_probability_max'
      ].join(','),
      timezone: 'auto', // Automatically detect timezone based on coordinates
      forecast_days: Math.min(days, 16).toString(), // Open-Meteo supports max 16 days
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
      console.error('Failed to fetch current weather from Open-Meteo:', error);
      throw error;
    }
  }

  /**
   * Clear all cached forecast data
   */
  static clearCache(): void {
    this.forecastCache.clear();
    console.log('🗑️ Open-Meteo forecast cache cleared');
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