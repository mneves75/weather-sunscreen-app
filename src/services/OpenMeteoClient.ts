/**
 * Open-Meteo API Client
 * Handles all communication with the Open-Meteo weather API
 */

import {
    Coordinates,
    OpenMeteoCurrentWeather,
    OpenMeteoDailyData,
    OpenMeteoHourlyData,
    OpenMeteoUVIndex,
} from '@/src/types';
import { logger } from './LoggerService';

export interface OpenMeteoConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
}

export class OpenMeteoClient {
  private static instance: OpenMeteoClient;
  private config: OpenMeteoConfig;

  private constructor() {
    this.config = {
      baseUrl: 'https://api.open-meteo.com/v1',
      timeout: 10000,
      retryAttempts: 3,
    };
  }

  public static getInstance(): OpenMeteoClient {
    if (!OpenMeteoClient.instance) {
      OpenMeteoClient.instance = new OpenMeteoClient();
    }
    return OpenMeteoClient.instance;
  }

  /**
   * Build API URL with parameters
   */
  private buildUrl(endpoint: string, params: Record<string, string | number | boolean>): string {
    const url = new URL(`${this.config.baseUrl}${endpoint}`);

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });

    return url.toString();
  }

  /**
   * Make HTTP request with retry logic
   */
  private async makeRequest<T>(url: string): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt <= this.config.retryAttempts; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

        logger.debug('Making Open-Meteo API request', 'OPEN_METEO', { url, attempt: attempt + 1 });

        const response = await fetch(url, {
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'WeatherSunscreenApp/1.0',
          },
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        logger.debug('Open-Meteo API request successful', 'OPEN_METEO', { url, status: response.status });
        return data as T;

      } catch (error) {
        lastError = error as Error;

        if (attempt === this.config.retryAttempts) {
          logger.error('Open-Meteo API request failed after retries', lastError, 'OPEN_METEO', { url });
          throw lastError;
        }

        // Wait before retry (exponential backoff)
        const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
        await new Promise(resolve => setTimeout(resolve, delay));

        logger.warn('Retrying Open-Meteo API request', 'OPEN_METEO', {
          url,
          attempt: attempt + 1,
          error: lastError.message
        });
      }
    }

    throw lastError!;
  }

  /**
   * Get current weather data
   */
  public async getCurrentWeather(coordinates: Coordinates): Promise<OpenMeteoCurrentWeather> {
    const params = {
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      current: [
        'temperature_2m',
        'relative_humidity_2m',
        'apparent_temperature',
        'pressure_msl',
        'wind_speed_10m',
        'wind_direction_10m',
        'visibility',
        'cloud_cover',
        'weather_code',
        'is_day',
      ].join(','),
      timezone: 'auto',
    };

    const url = this.buildUrl('/forecast', params);
    return this.makeRequest<OpenMeteoCurrentWeather>(url);
  }

  /**
   * Get UV index data
   */
  public async getUVIndex(coordinates: Coordinates): Promise<OpenMeteoUVIndex> {
    const params = {
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      hourly: 'uv_index',
      forecast_days: 1,
      timezone: 'auto',
    };

    const url = this.buildUrl('/forecast', params);
    return this.makeRequest<OpenMeteoUVIndex>(url);
  }

  /**
   * Get forecast data (hourly and daily)
   */
  public async getForecast(coordinates: Coordinates): Promise<{
    hourly: OpenMeteoHourlyData;
    daily: OpenMeteoDailyData;
  }> {
    const params = {
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      hourly: [
        'temperature_2m',
        'relative_humidity_2m',
        'uv_index',
        'wind_speed_10m',
        'wind_direction_10m',
        'precipitation_probability',
        'cloud_cover',
        'weather_code',
      ].join(','),
      daily: [
        'weather_code',
        'temperature_2m_max',
        'temperature_2m_min',
        'uv_index_max',
        'precipitation_probability_max',
        'wind_speed_10m_max',
        'wind_direction_10m_dominant',
      ].join(','),
      forecast_days: 7,
      timezone: 'auto',
    };

    const url = this.buildUrl('/forecast', params);
    const response = await this.makeRequest<{
      hourly: OpenMeteoHourlyData;
      daily: OpenMeteoDailyData;
    }>(url);

    return response;
  }

  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<OpenMeteoConfig>): void {
    this.config = { ...this.config, ...newConfig };
    logger.info('Open-Meteo client configuration updated', 'OPEN_METEO', { config: this.config });
  }
}

// Export singleton instance
export const openMeteoClient = OpenMeteoClient.getInstance();
