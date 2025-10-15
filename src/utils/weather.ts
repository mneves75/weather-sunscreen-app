/**
 * Weather condition helpers and utilities
 *
 * INTERNATIONALIZATION (i18n) ARCHITECTURE:
 *
 * This module contains functions that return i18n keys (like 'weather.humidityLevels.dry')
 * instead of hardcoded strings. The translation happens at the component level using react-i18next's t() function.
 *
 * KEY STRUCTURE IN TRANSLATION FILES (en.json, pt-BR.json):
 * ============================================================
 *
 * The 'weather' object avoids key collisions by separating labels from descriptions:
 *
 *   "weather": {
 *     // Top-level string labels for metrics (never collide)
 *     "humidity": "Humidity",        // Label for humidity metric
 *     "wind": "Wind",                // Label for wind metric
 *     "pressure": "Pressure",        // Label for pressure metric
 *
 *     // Nested objects for descriptions (renamed to avoid collision with labels)
 *     "humidityLevels": {            // OLD: "humidity" → would overwrite label above
 *       "veryDry": "Very Dry",
 *       "dry": "Dry",
 *       ...
 *     },
 *     "windLevels": {                // OLD: "windSpeed" → would overwrite label above
 *       "calm": "Calm",
 *       "lightBreeze": "Light Breeze",
 *       ...
 *     },
 *     "cardinal": {                  // Cardinal directions (no collision)
 *       "N": "N",
 *       "E": "E",
 *       ...
 *     }
 *   }
 *
 * FLOW EXAMPLE - getHumidityLevel(45) → 'weather.humidityLevels.dry' → t() → "Dry" (English) or "Seco" (Portuguese)
 * ================================================================================================================
 *
 * 1. Utility function receives humidity value (0-100)
 * 2. Utility function returns i18n KEY: 'weather.humidityLevels.dry'
 * 3. Component calls t(key) to translate: t('weather.humidityLevels.dry')
 * 4. react-i18next looks up key in current language file
 * 5. Returns translated string: "Dry" (en.json) or "Seco" (pt-BR.json)
 *
 * WHY THIS PATTERN:
 * - Separates business logic (utility functions) from translations (json files)
 * - Allows easy language switching without code changes
 * - Avoids hardcoding strings in TypeScript
 * - Enables pluralization, interpolation, and context-aware translations
 *
 * CRITICAL: Always return i18n keys from utility functions, never hardcoded strings!
 */

import { WeatherCondition } from '@/src/types';

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
 * Get weather advisory based on conditions
 */
export function getWeatherAdvisory(
  condition: WeatherCondition,
  temperature: number,
  locale: string = 'en'
): string | null {
  const wmoCode = condition.wmoCode || 0;
  
  if (locale === 'pt-BR') {
    if (hasThunderstorm(wmoCode)) {
      return 'Alerta de tempestade - Busque abrigo';
    }
    
    if (isRainy(wmoCode)) {
      return 'Leve um guarda-chuva';
    }
    
    if (isSnowy(wmoCode)) {
      return 'Condições de neve - Dirija com cuidado';
    }
    
    if (temperature >= 35) {
      return 'Alerta de calor extremo - Mantenha-se hidratado';
    }
    
    if (temperature <= 0) {
      return 'Alerta de frio extremo - Vista-se adequadamente';
    }
  } else {
    if (hasThunderstorm(wmoCode)) {
      return 'Thunderstorm warning - Seek shelter';
    }
    
    if (isRainy(wmoCode)) {
      return 'Bring an umbrella';
    }
    
    if (isSnowy(wmoCode)) {
      return 'Snow conditions - Drive carefully';
    }
    
    if (temperature >= 35) {
      return 'Extreme heat warning - Stay hydrated';
    }
    
    if (temperature <= 0) {
      return 'Extreme cold warning - Dress warmly';
    }
  }
  
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
 * Get humidity level description as i18n key
 * Returns i18n key like 'weather.humidityLevels.veryDry'
 * Component should call t() to translate the key
 *
 * Note: Uses 'humidityLevels' to avoid key collision with 'weather.humidity'
 * which is the top-level label key for the humidity metric.
 */
export function getHumidityLevel(humidity: number, locale: string = 'en'): string {
  if (humidity < 30) return 'weather.humidityLevels.veryDry';
  if (humidity < 50) return 'weather.humidityLevels.dry';
  if (humidity < 70) return 'weather.humidityLevels.comfortable';
  if (humidity < 85) return 'weather.humidityLevels.humid';
  return 'weather.humidityLevels.veryHumid';
}

/**
 * Get wind speed description as i18n key
 * Returns i18n key like 'weather.windLevels.calm'
 * Component should call t() to translate the key
 *
 * Note: Uses 'windLevels' to avoid key collision with 'weather.wind'
 * which is the top-level label key for the wind metric.
 */
export function getWindDescription(speedKmh: number, locale: string = 'en'): string {
  if (speedKmh < 5) return 'weather.windLevels.calm';
  if (speedKmh < 20) return 'weather.windLevels.lightBreeze';
  if (speedKmh < 40) return 'weather.windLevels.moderateBreeze';
  if (speedKmh < 60) return 'weather.windLevels.strongWind';
  return 'weather.windLevels.veryStrongWind';
}

