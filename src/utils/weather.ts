/**
 * Weather condition utilities
 *
 * All classification functions return i18n keys for translation by components.
 * Use t() from react-i18next to translate keys to current language.
 *
 * See: src/types/i18n.ts for i18n key constants and type definitions
 */

import { WeatherCondition } from '@/src/types';
import { I18N_KEYS, HumidityLevelKey, WindLevelKey, CardinalKey, AdvisoryKey } from '@/src/types/i18n';

/**
 * Get weather icon emoji for condition code
 */
export function getWeatherEmoji(wmoCode: number): string {
  // WMO Weather interpretation codes
  const emojiMap: Record<number, string> = {
    0: '☀️', // Clear sky
    1: '🌤️', // Mainly clear
    2: '⛅', // Partly cloudy
    3: '☁️', // Overcast
    45: '🌫️', // Foggy
    48: '🌫️', // Depositing rime fog
    51: '🌦️', // Light drizzle
    53: '🌦️', // Moderate drizzle
    55: '🌧️', // Dense drizzle
    56: '🌧️', // Light freezing drizzle
    57: '🌧️', // Dense freezing drizzle
    61: '🌧️', // Slight rain
    63: '🌧️', // Moderate rain
    65: '🌧️', // Heavy rain
    66: '🌧️', // Light freezing rain
    67: '🌧️', // Heavy freezing rain
    71: '🌨️', // Slight snow fall
    73: '🌨️', // Moderate snow fall
    75: '🌨️', // Heavy snow fall
    77: '🌨️', // Snow grains
    80: '🌦️', // Slight rain showers
    81: '🌧️', // Moderate rain showers
    82: '🌧️', // Violent rain showers
    85: '🌨️', // Slight snow showers
    86: '🌨️', // Heavy snow showers
    95: '⛈️', // Thunderstorm
    96: '⛈️', // Thunderstorm with slight hail
    99: '⛈️', // Thunderstorm with heavy hail
  };
  
  return emojiMap[wmoCode] || '🌤️';
}

/**
 * Get weather condition description
 */
export function getWeatherDescription(condition: WeatherCondition, locale: string = 'en'): string {
  // Use the description from the condition object
  if (condition.description) {
    return condition.description;
  }
  
  // Fallback to main if description not available
  return condition.main || 'Unknown';
}

/**
 * Check if weather condition is rainy
 */
export function isRainy(wmoCode: number): boolean {
  return [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(wmoCode);
}

/**
 * Check if weather condition is snowy
 */
export function isSnowy(wmoCode: number): boolean {
  return [71, 73, 75, 77, 85, 86].includes(wmoCode);
}

/**
 * Check if weather condition has thunderstorm
 */
export function hasThunderstorm(wmoCode: number): boolean {
  return [95, 96, 99].includes(wmoCode);
}

/**
 * Check if weather condition is clear/sunny
 */
export function isClearSky(wmoCode: number): boolean {
  return [0, 1].includes(wmoCode);
}

/**
 * Check if weather condition is cloudy
 */
export function isCloudy(wmoCode: number): boolean {
  return [2, 3].includes(wmoCode);
}

/**
 * Returns i18n key for weather advisory based on conditions
 * Follows consistent pattern: utility returns key, component translates
 *
 * @param condition - Weather condition object with WMO code
 * @param temperature - Current temperature in Celsius
 * @returns Type-safe i18n key for advisory message, or null if no advisory needed
 *
 * PRIORITY ORDER (highest to lowest):
 * 1. Thunderstorm (life-threatening)
 * 2. Extreme temperatures (health-threatening)
 * 3. Precipitation (daily life)
 *
 * REMOVED: locale parameter (now handled by i18n system, not here)
 */
export function getWeatherAdvisory(
  condition: WeatherCondition,
  temperature: number
): AdvisoryKey | null {
  const wmoCode = condition.wmoCode || 0;

  // Highest priority: thunderstorm warning
  if (hasThunderstorm(wmoCode)) {
    return I18N_KEYS.weather.advisories.thunderstorm;
  }

  // High priority: extreme temperatures
  if (temperature >= 35) {
    return I18N_KEYS.weather.advisories.extremeHeat;
  }

  if (temperature <= 0) {
    return I18N_KEYS.weather.advisories.extremeCold;
  }

  // Medium priority: precipitation
  if (isSnowy(wmoCode)) {
    return I18N_KEYS.weather.advisories.snowConditions;
  }

  if (isRainy(wmoCode)) {
    return I18N_KEYS.weather.advisories.bringUmbrella;
  }

  // No advisory needed
  return null;
}

/**
 * Format humidity percentage
 */
export function formatHumidity(humidity: number): string {
  return `${Math.round(humidity)}%`;
}

/**
 * Format cloud cover percentage
 */
export function formatCloudCover(cloudCover: number): string {
  return `${Math.round(cloudCover)}%`;
}

/**
 * Returns i18n key for humidity level classification
 * Clamps input to valid range [0-100] and handles invalid inputs gracefully
 *
 * @param humidity - Relative humidity percentage (0-100)
 * @returns Type-safe i18n key for humidity level description
 *
 * EDGE CASE HANDLING:
 * - NaN, Infinity: defaults to comfortable (50%)
 * - Negative values: clamped to 0 (veryDry)
 * - Values > 100: clamped to 100 (veryHumid)
 */
export function getHumidityLevel(humidity: number): HumidityLevelKey {
  // Handle invalid inputs gracefully
  if (!Number.isFinite(humidity)) {
    console.warn(`getHumidityLevel: Invalid humidity value ${humidity}, using comfortable default`);
    return I18N_KEYS.weather.humidityLevels.comfortable;
  }

  // Clamp to valid range [0, 100]
  const clamped = Math.max(0, Math.min(100, humidity));

  if (clamped < 30) return I18N_KEYS.weather.humidityLevels.veryDry;
  if (clamped < 50) return I18N_KEYS.weather.humidityLevels.dry;
  if (clamped < 70) return I18N_KEYS.weather.humidityLevels.comfortable;
  if (clamped < 85) return I18N_KEYS.weather.humidityLevels.humid;
  return I18N_KEYS.weather.humidityLevels.veryHumid;
}

/**
 * Returns i18n key for wind speed classification
 * Clamps input to reasonable range [0-200] km/h and handles invalid inputs gracefully
 *
 * @param speedKmh - Wind speed in kilometers per hour
 * @returns Type-safe i18n key for wind level description
 *
 * EDGE CASE HANDLING:
 * - NaN, Infinity, negative: defaults to calm
 * - Values > 200 km/h: clamped to 200 (veryStrongWind)
 *
 * RATIONALE FOR UPPER BOUND:
 * 200 km/h is approximately 124 mph, which is hurricane/cyclone force winds.
 * This is the practical upper bound for weather data.
 */
export function getWindDescription(speedKmh: number): WindLevelKey {
  // Handle invalid inputs gracefully
  if (!Number.isFinite(speedKmh) || speedKmh < 0) {
    console.warn(`getWindDescription: Invalid wind speed ${speedKmh}, using calm default`);
    return I18N_KEYS.weather.windLevels.calm;
  }

  // Clamp to reasonable range [0, 200] km/h
  const clamped = Math.min(200, speedKmh);

  if (clamped < 5) return I18N_KEYS.weather.windLevels.calm;
  if (clamped < 20) return I18N_KEYS.weather.windLevels.lightBreeze;
  if (clamped < 40) return I18N_KEYS.weather.windLevels.moderateBreeze;
  if (clamped < 60) return I18N_KEYS.weather.windLevels.strongWind;
  return I18N_KEYS.weather.windLevels.veryStrongWind;
}

