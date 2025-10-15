/**
 * Open-Meteo Data Mapper
 * Transforms Open-Meteo API responses to app data structures
 */

import {
    Coordinates,
    DaylightData,
    Forecast,
    ForecastDay,
    Location,
    OpenMeteoDailyData,
    OpenMeteoHourlyData,
    OpenMeteoUVIndex,
    UVIndex,
    UVLevel,
    WeatherCondition,
    WeatherData
} from '@/src/types';
import { logger } from './LoggerService';
import { calculateDaylightDuration, calculateSolarNoon } from '@/src/utils';

/**
 * WMO Weather interpretation codes mapping
 * Based on Open-Meteo documentation
 *
 * Note: description field contains i18n keys (e.g., 'weather.conditions.0')
 * which are translated via the i18n system in consuming components.
 */
const WMO_CODES: Record<number, { main: string; description: string; icon: string }> = {
  0: { main: 'Clear', description: 'weather.conditions.0', icon: '01d' },
  1: { main: 'Clouds', description: 'weather.conditions.1', icon: '02d' },
  2: { main: 'Clouds', description: 'weather.conditions.2', icon: '03d' },
  3: { main: 'Clouds', description: 'weather.conditions.3', icon: '04d' },
  45: { main: 'Fog', description: 'weather.conditions.45', icon: '50d' },
  48: { main: 'Fog', description: 'weather.conditions.48', icon: '50d' },
  51: { main: 'Drizzle', description: 'weather.conditions.51', icon: '09d' },
  53: { main: 'Drizzle', description: 'weather.conditions.53', icon: '09d' },
  55: { main: 'Drizzle', description: 'weather.conditions.55', icon: '09d' },
  56: { main: 'Drizzle', description: 'weather.conditions.56', icon: '09d' },
  57: { main: 'Drizzle', description: 'weather.conditions.57', icon: '09d' },
  61: { main: 'Rain', description: 'weather.conditions.61', icon: '10d' },
  63: { main: 'Rain', description: 'weather.conditions.63', icon: '10d' },
  65: { main: 'Rain', description: 'weather.conditions.65', icon: '10d' },
  66: { main: 'Rain', description: 'weather.conditions.66', icon: '13d' },
  67: { main: 'Rain', description: 'weather.conditions.67', icon: '13d' },
  71: { main: 'Snow', description: 'weather.conditions.71', icon: '13d' },
  73: { main: 'Snow', description: 'weather.conditions.73', icon: '13d' },
  75: { main: 'Snow', description: 'weather.conditions.75', icon: '13d' },
  77: { main: 'Snow', description: 'weather.conditions.77', icon: '13d' },
  80: { main: 'Rain', description: 'weather.conditions.80', icon: '09d' },
  81: { main: 'Rain', description: 'weather.conditions.81', icon: '09d' },
  82: { main: 'Rain', description: 'weather.conditions.82', icon: '09d' },
  85: { main: 'Snow', description: 'weather.conditions.85', icon: '13d' },
  86: { main: 'Snow', description: 'weather.conditions.86', icon: '13d' },
  95: { main: 'Thunderstorm', description: 'weather.conditions.95', icon: '11d' },
  96: { main: 'Thunderstorm', description: 'weather.conditions.96', icon: '11d' },
  99: { main: 'Thunderstorm', description: 'weather.conditions.99', icon: '11d' },
};

export class OpenMeteoMapper {
  /**
   * Map WMO weather code to weather condition
   */
  public static mapWeatherCondition(wmoCode: number, isDay: boolean = true): WeatherCondition {
    const mapping = WMO_CODES[wmoCode] || {
      main: 'Unknown',
      description: 'weather.conditions.unknown',
      icon: '01d',
    };

    // Adjust icon for night time
    let icon = mapping.icon;
    if (!isDay) {
      icon = icon.replace('d', 'n');
    }

    return {
      id: wmoCode,
      main: mapping.main,
      description: mapping.description,
      icon,
      wmoCode,
    };
  }

  /**
   * Calculate UV level from UV index value
   */
  public static calculateUVLevel(uvIndex: number): UVLevel {
    if (uvIndex >= 0 && uvIndex <= 2) return 'low';
    if (uvIndex >= 3 && uvIndex <= 5) return 'moderate';
    if (uvIndex >= 6 && uvIndex <= 7) return 'high';
    if (uvIndex >= 8 && uvIndex <= 10) return 'very-high';
    return 'extreme';
  }

  /**
   * Transform Open-Meteo current weather to WeatherData
   */
  public static transformCurrentWeather(
    data: any,
    coordinates: Coordinates,
    location?: Partial<Location>
  ): WeatherData {
    try {
      const current = data.current || {};
      const isDay = current.is_day === 1;

      return {
        location: {
          coordinates,
          city: location?.city,
          country: location?.country,
          timezone: data.timezone || location?.timezone,
        },
        current: {
          temperature: Math.round(current.temperature_2m || 0),
          feelsLike: Math.round(current.apparent_temperature || current.temperature_2m || 0),
          humidity: Math.round(current.relative_humidity_2m || 0),
          pressure: Math.round(current.pressure_msl || 1013),
          windSpeed: Math.round(current.wind_speed_10m || 0),
          windDirection: Math.round(current.wind_direction_10m || 0),
          visibility: Math.round(current.visibility || 10000),
          cloudCover: Math.round(current.cloud_cover || 0),
          condition: this.mapWeatherCondition(current.weather_code || 0, isDay),
          timestamp: current.time ? new Date(current.time).getTime() : Date.now(),
        },
      };
    } catch (error) {
      logger.error('Failed to transform current weather data', error as Error, 'MAPPER');
      throw new Error('Failed to transform weather data');
    }
  }

  /**
   * Transform Open-Meteo UV index data to UVIndex
   */
  public static transformUVIndex(data: OpenMeteoUVIndex): UVIndex {
    try {
      const now = new Date();
      const currentHour = now.getHours();

      // Find current UV index from hourly data
      let currentUVIndex = 0;
      let peakTime = '12:00 PM';
      let maxUV = 0;
      const hourly: UVIndex['hourly'] = [];

      if (data.hourly && data.hourly.time && data.hourly.uv_index) {
        for (let i = 0; i < data.hourly.time.length; i++) {
          const time = new Date(data.hourly.time[i]);
          const uvValue = data.hourly.uv_index[i];
          const roundedValue = Number.isFinite(uvValue) ? Math.max(0, uvValue) : 0;
          const levelForHour = this.calculateUVLevel(Math.round(roundedValue));

          // Find current hour UV
          if (time.getHours() === currentHour && time.getDate() === now.getDate()) {
            currentUVIndex = roundedValue;
          }

          // Track peak UV
          if (roundedValue > maxUV) {
            maxUV = roundedValue;
            peakTime = time.toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
            });
          }

          // Only collect data for the current day (matching date) to avoid mixing following days
          if (time.getDate() === now.getDate()) {
            hourly.push({
              timestamp: time.getTime(),
              value: parseFloat(roundedValue.toFixed(2)),
              level: levelForHour,
            });
          }
        }
      }

      const value = Math.round(currentUVIndex);
      const level = this.calculateUVLevel(value);

      return {
        value,
        level,
        peakTime,
        recommendations: this.generateUVRecommendations(value, level),
        hourly,
        timestamp: Date.now(),
      };
    } catch (error) {
      logger.error('Failed to transform UV index data', error as Error, 'MAPPER');
      throw new Error('Failed to transform UV index data');
    }
  }

  /**
   * Generate UV recommendations based on UV index and level
   */
  private static generateUVRecommendations(
    uvIndex: number,
    level: UVLevel
  ): UVIndex['recommendations'] {
    const recommendations: UVIndex['recommendations'] = [];

    if (level === 'low') {
      recommendations.push({
        type: 'spf',
        message: 'Minimal sun protection required',
        priority: 'low',
      });
    } else if (level === 'moderate') {
      recommendations.push(
        {
          type: 'spf',
          message: 'Use SPF 15+ sunscreen',
          priority: 'medium',
        },
        {
          type: 'shade',
          message: 'Seek shade during midday',
          priority: 'low',
        }
      );
    } else if (level === 'high') {
      recommendations.push(
        {
          type: 'spf',
          message: 'Use SPF 30+ sunscreen',
          priority: 'high',
        },
        {
          type: 'shade',
          message: 'Seek shade during midday hours',
          priority: 'medium',
        },
        {
          type: 'clothing',
          message: 'Wear protective clothing',
          priority: 'medium',
        }
      );
    } else if (level === 'very-high') {
      recommendations.push(
        {
          type: 'spf',
          message: 'Use SPF 50+ sunscreen',
          priority: 'high',
        },
        {
          type: 'shade',
          message: 'Avoid sun between 10 AM - 4 PM',
          priority: 'high',
        },
        {
          type: 'clothing',
          message: 'Wear protective clothing and hat',
          priority: 'high',
        },
        {
          type: 'sunglasses',
          message: 'Wear UV-blocking sunglasses',
          priority: 'medium',
        }
      );
    } else {
      // extreme
      recommendations.push(
        {
          type: 'spf',
          message: 'Use SPF 50+ sunscreen, reapply every 2 hours',
          priority: 'high',
        },
        {
          type: 'timing',
          message: 'Minimize sun exposure between 10 AM - 4 PM',
          priority: 'high',
        },
        {
          type: 'shade',
          message: 'Stay in shade whenever possible',
          priority: 'high',
        },
        {
          type: 'clothing',
          message: 'Wear long sleeves, hat, and protective clothing',
          priority: 'high',
        },
        {
          type: 'sunglasses',
          message: 'Wear UV-blocking sunglasses',
          priority: 'high',
        }
      );
    }

    return recommendations;
  }

  /**
   * Transform Open-Meteo forecast data to Forecast
   */
  public static transformForecast(
    hourly: OpenMeteoHourlyData,
    daily: OpenMeteoDailyData,
    coordinates: Coordinates,
    location?: Partial<Location>
  ): Forecast {
    try {
      const days: ForecastDay[] = [];

      for (let i = 0; i < daily.time.length; i++) {
        const date = daily.time[i];

        // Get hourly data for this day
        const dayStart = new Date(date);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(date);
        dayEnd.setHours(23, 59, 59, 999);

        // Calculate average temperatures for different times of day
        const temps = this.calculateDayTemperatures(
          hourly,
          daily.temperature_2m_min[i],
          daily.temperature_2m_max[i],
          date
        );

        // Calculate precipitation amount from hourly data
        const precipAmount = this.calculatePrecipitationAmount(hourly, date);

        const sunrise = daily.sunrise?.[i] ?? '';
        const sunset = daily.sunset?.[i] ?? '';
        const daylightDurationFromApi = daily.daylight_duration?.[i];

        const daylightDurationMinutes = typeof daylightDurationFromApi === 'number'
          ? Math.round(daylightDurationFromApi / 60)
          : sunrise && sunset
            ? calculateDaylightDuration(sunrise, sunset)
            : 0;

        const daylight: DaylightData = {
          sunrise,
          sunset,
          daylightDuration: daylightDurationMinutes,
          solarNoon: sunrise && sunset ? calculateSolarNoon(sunrise, sunset) : '',
        };

        days.push({
          date,
          sunrise: daylight.sunrise,
          sunset: daylight.sunset,
          daylight,
          temperature: temps,
          condition: this.mapWeatherCondition(daily.weather_code[i]),
          precipitation: {
            probability: Math.round(daily.precipitation_probability_max?.[i] || 0),
            amount: precipAmount,
          },
          uvIndex: {
            max: Math.round(daily.uv_index_max?.[i] || 0),
            level: this.calculateUVLevel(daily.uv_index_max?.[i] || 0),
          },
          wind: {
            speed: Math.round(daily.wind_speed_10m_max?.[i] || 0),
            direction: Math.round(daily.wind_direction_10m_dominant?.[i] || 0),
          },
          humidity: this.calculateAverageHumidity(hourly, date),
        });
      }

      return {
        location: {
          coordinates,
          city: location?.city,
          country: location?.country,
        },
        days,
        updatedAt: Date.now(),
      };
    } catch (error) {
      logger.error('Failed to transform forecast data', error as Error, 'MAPPER');
      throw new Error('Failed to transform forecast data');
    }
  }

  /**
   * Calculate temperatures for different times of day
   */
  private static calculateDayTemperatures(
    hourly: OpenMeteoHourlyData,
    minTemp: number,
    maxTemp: number,
    date: string
  ): ForecastDay['temperature'] {
    const targetDate = new Date(date);
    let morningTemp = minTemp;
    let afternoonTemp = maxTemp;
    let eveningTemp = (minTemp + maxTemp) / 2;
    let nightTemp = minTemp;

    // Find hourly temperatures for specific times
    for (let i = 0; i < hourly.time.length; i++) {
      const time = new Date(hourly.time[i]);
      if (time.toDateString() === targetDate.toDateString()) {
        const hour = time.getHours();
        if (hour >= 6 && hour < 9) {
          morningTemp = hourly.temperature_2m[i];
        } else if (hour >= 12 && hour < 15) {
          afternoonTemp = hourly.temperature_2m[i];
        } else if (hour >= 18 && hour < 21) {
          eveningTemp = hourly.temperature_2m[i];
        } else if (hour >= 0 && hour < 6) {
          nightTemp = hourly.temperature_2m[i];
        }
      }
    }

    return {
      min: Math.round(minTemp),
      max: Math.round(maxTemp),
      morning: Math.round(morningTemp),
      afternoon: Math.round(afternoonTemp),
      evening: Math.round(eveningTemp),
      night: Math.round(nightTemp),
    };
  }

  /**
   * Calculate precipitation amount from hourly data
   */
  private static calculatePrecipitationAmount(
    hourly: OpenMeteoHourlyData,
    date: string
  ): number {
    // Open-Meteo doesn't provide precipitation amount in the basic forecast
    // We'll estimate based on probability
    return 0;
  }

  /**
   * Calculate average humidity for a day
   */
  private static calculateAverageHumidity(hourly: OpenMeteoHourlyData, date: string): number {
    const targetDate = new Date(date);
    let totalHumidity = 0;
    let count = 0;

    for (let i = 0; i < hourly.time.length; i++) {
      const time = new Date(hourly.time[i]);
      if (time.toDateString() === targetDate.toDateString()) {
        totalHumidity += hourly.relative_humidity_2m[i];
        count++;
      }
    }

    return count > 0 ? Math.round(totalHumidity / count) : 60;
  }
}
