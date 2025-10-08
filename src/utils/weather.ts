/**
 * Weather condition helpers and utilities
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
 * Get humidity level description
 */
export function getHumidityLevel(humidity: number, locale: string = 'en'): string {
  if (locale === 'pt-BR') {
    if (humidity < 30) return 'Muito Seco';
    if (humidity < 50) return 'Seco';
    if (humidity < 70) return 'Confortável';
    if (humidity < 85) return 'Úmido';
    return 'Muito Úmido';
  }
  
  if (humidity < 30) return 'Very Dry';
  if (humidity < 50) return 'Dry';
  if (humidity < 70) return 'Comfortable';
  if (humidity < 85) return 'Humid';
  return 'Very Humid';
}

/**
 * Get wind speed description
 */
export function getWindDescription(speedKmh: number, locale: string = 'en'): string {
  if (locale === 'pt-BR') {
    if (speedKmh < 5) return 'Calmo';
    if (speedKmh < 20) return 'Brisa Leve';
    if (speedKmh < 40) return 'Brisa Moderada';
    if (speedKmh < 60) return 'Vento Forte';
    return 'Vento Muito Forte';
  }
  
  if (speedKmh < 5) return 'Calm';
  if (speedKmh < 20) return 'Light Breeze';
  if (speedKmh < 40) return 'Moderate Breeze';
  if (speedKmh < 60) return 'Strong Wind';
  return 'Very Strong Wind';
}

