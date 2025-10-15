/**
 * Unit conversion utilities for temperature, speed, and pressure
 */

import { PressureUnit, SpeedUnit, TemperatureUnit } from '@/src/types';
import { I18N_KEYS, CardinalKey } from '@/src/types/i18n';

// Temperature conversions
export function celsiusToFahrenheit(celsius: number): number {
  return (celsius * 9) / 5 + 32;
}

export function fahrenheitToCelsius(fahrenheit: number): number {
  return ((fahrenheit - 32) * 5) / 9;
}

export function convertTemperature(
  value: number,
  from: TemperatureUnit,
  to: TemperatureUnit
): number {
  if (from === to) return value;
  
  if (from === 'celsius' && to === 'fahrenheit') {
    return celsiusToFahrenheit(value);
  }
  
  if (from === 'fahrenheit' && to === 'celsius') {
    return fahrenheitToCelsius(value);
  }
  
  return value;
}

export function formatTemperature(
  value: number,
  unit: TemperatureUnit,
  decimals: number = 0
): string {
  const symbol = unit === 'celsius' ? '°C' : '°F';
  return `${value.toFixed(decimals)}${symbol}`;
}

// Speed conversions
export function kmhToMph(kmh: number): number {
  return kmh * 0.621371;
}

export function kmhToMs(kmh: number): number {
  return kmh / 3.6;
}

export function mphToKmh(mph: number): number {
  return mph / 0.621371;
}

export function msToKmh(ms: number): number {
  return ms * 3.6;
}

export function convertSpeed(
  value: number,
  from: SpeedUnit,
  to: SpeedUnit
): number {
  if (from === to) return value;
  
  // Convert to km/h first as intermediate
  let kmh = value;
  if (from === 'mph') {
    kmh = mphToKmh(value);
  } else if (from === 'ms') {
    kmh = msToKmh(value);
  }
  
  // Convert from km/h to target
  if (to === 'mph') {
    return kmhToMph(kmh);
  } else if (to === 'ms') {
    return kmhToMs(kmh);
  }
  
  return kmh;
}

export function formatSpeed(
  value: number,
  unit: SpeedUnit,
  decimals: number = 1
): string {
  const units = {
    kmh: 'km/h',
    mph: 'mph',
    ms: 'm/s',
  };
  return `${value.toFixed(decimals)} ${units[unit]}`;
}

// Pressure conversions
export function hPaToInHg(hPa: number): number {
  return hPa * 0.02953;
}

export function hPaToMmHg(hPa: number): number {
  return hPa * 0.750062;
}

export function inHgToHPa(inHg: number): number {
  return inHg / 0.02953;
}

export function mmHgToHPa(mmHg: number): number {
  return mmHg / 0.750062;
}

export function convertPressure(
  value: number,
  from: PressureUnit,
  to: PressureUnit
): number {
  if (from === to) return value;
  
  // Convert to hPa first as intermediate
  let hPa = value;
  if (from === 'inHg') {
    hPa = inHgToHPa(value);
  } else if (from === 'mmHg') {
    hPa = mmHgToHPa(value);
  }
  
  // Convert from hPa to target
  if (to === 'inHg') {
    return hPaToInHg(hPa);
  } else if (to === 'mmHg') {
    return hPaToMmHg(hPa);
  }
  
  return hPa;
}

export function formatPressure(
  value: number,
  unit: PressureUnit,
  decimals: number = 0
): string {
  const units = {
    hPa: 'hPa',
    inHg: 'inHg',
    mmHg: 'mmHg',
  };
  return `${value.toFixed(decimals)} ${units[unit]}`;
}

// Visibility conversion (meters to km or miles)
export function formatVisibility(
  meters: number,
  unit: 'metric' | 'imperial' = 'metric'
): string {
  if (unit === 'imperial') {
    const miles = meters / 1609.34;
    return `${miles.toFixed(1)} mi`;
  }
  const km = meters / 1000;
  return `${km.toFixed(1)} km`;
}

/**
 * Converts compass degrees to cardinal direction i18n key
 * Returns type-safe i18n key for cardinal direction
 *
 * @param degrees - Compass heading (0-360), where 0=N, 90=E, 180=S, 270=W
 * @returns Type-safe i18n key for cardinal direction
 *
 * EDGE CASE HANDLING:
 * - Wraps around: 360° = 0° (North)
 * - Negative degrees: wraps to positive (e.g., -90° = 270° = West)
 * - 16-point compass: N, NNE, NE, ENE, E, ESE, SE, SSE, S, SSW, SW, WSW, W, WNW, NW, NNW
 */
export function degreesToCardinal(degrees: number): CardinalKey {
  // Normalize to 0-360 range (handles negative and > 360 values)
  const normalized = ((degrees % 360) + 360) % 360;

  // Map to 16-point compass (each sector is 22.5°)
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'] as const;
  const index = Math.round(normalized / 22.5) % 16;
  const cardinal = directions[index];

  return I18N_KEYS.weather.cardinal[cardinal as keyof typeof I18N_KEYS.weather.cardinal];
}

