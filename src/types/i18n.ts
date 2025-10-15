/**
 * Internationalization (i18n) TypeScript type definitions
 *
 * IMPORTANT: This file contains both:
 * 1. Translation interface (for type-checking translation JSON files)
 * 2. i18n key constants (for compile-time validation of translation keys)
 *
 * All utility functions that return i18n keys should return types from this file
 * to ensure TypeScript catches invalid keys at compile time.
 */

export type Locale = 'en' | 'pt-BR';

/**
 * Type-safe i18n key constants
 *
 * Provides compile-time validation that translation keys exist and prevents typos.
 * All i18n keys used throughout the app should be defined here and referenced via I18N_KEYS.
 * This ensures TypeScript catches invalid keys at compile time rather than failing at runtime.
 *
 * USAGE:
 *   import { I18N_KEYS } from '@/src/types/i18n';
 *   const key = I18N_KEYS.weather.humidityLevels.dry;
 *   t(key); // TypeScript validates key exists
 */
export const I18N_KEYS = {
  weather: {
    // Humidity level classifications (veryDry → veryHumid)
    humidityLevels: {
      veryDry: 'weather.humidityLevels.veryDry',
      dry: 'weather.humidityLevels.dry',
      comfortable: 'weather.humidityLevels.comfortable',
      humid: 'weather.humidityLevels.humid',
      veryHumid: 'weather.humidityLevels.veryHumid',
    },
    // Wind speed classifications (calm → veryStrongWind)
    windLevels: {
      calm: 'weather.windLevels.calm',
      lightBreeze: 'weather.windLevels.lightBreeze',
      moderateBreeze: 'weather.windLevels.moderateBreeze',
      strongWind: 'weather.windLevels.strongWind',
      veryStrongWind: 'weather.windLevels.veryStrongWind',
    },
    // Cardinal directions (N → NNW)
    cardinal: {
      N: 'weather.cardinal.N',
      NNE: 'weather.cardinal.NNE',
      NE: 'weather.cardinal.NE',
      ENE: 'weather.cardinal.ENE',
      E: 'weather.cardinal.E',
      ESE: 'weather.cardinal.ESE',
      SE: 'weather.cardinal.SE',
      SSE: 'weather.cardinal.SSE',
      S: 'weather.cardinal.S',
      SSW: 'weather.cardinal.SSW',
      SW: 'weather.cardinal.SW',
      WSW: 'weather.cardinal.WSW',
      W: 'weather.cardinal.W',
      WNW: 'weather.cardinal.WNW',
      NW: 'weather.cardinal.NW',
      NNW: 'weather.cardinal.NNW',
    },
    // Weather advisories (thunderstorm → extremeCold)
    advisories: {
      thunderstorm: 'weather.advisories.thunderstorm',
      bringUmbrella: 'weather.advisories.bringUmbrella',
      snowConditions: 'weather.advisories.snowConditions',
      extremeHeat: 'weather.advisories.extremeHeat',
      extremeCold: 'weather.advisories.extremeCold',
    },
  },
} as const;

/**
 * Extract typed key unions from I18N_KEYS
 * These types ensure TypeScript catches invalid keys at compile time
 */
export type HumidityLevelKey = typeof I18N_KEYS.weather.humidityLevels[keyof typeof I18N_KEYS.weather.humidityLevels];
export type WindLevelKey = typeof I18N_KEYS.weather.windLevels[keyof typeof I18N_KEYS.weather.windLevels];
export type CardinalKey = typeof I18N_KEYS.weather.cardinal[keyof typeof I18N_KEYS.weather.cardinal];
export type AdvisoryKey = typeof I18N_KEYS.weather.advisories[keyof typeof I18N_KEYS.weather.advisories];

export interface Translation {
  // Common
  common: {
    loading: string;
    error: string;
    retry: string;
    cancel: string;
    save: string;
    close: string;
    settings: string;
    back: string;
  };

  // Weather
  weather: {
    title: string;
    currentConditions: string;
    temperature: string;
    feelsLike: string;
    humidity: string;
    pressure: string;
    windSpeed: string;
    visibility: string;
    cloudCover: string;
    lastUpdated: string;
    refreshing: string;
    pullToRefresh: string;
  };

  // UV Index
  uv: {
    title: string;
    index: string;
    level: string;
    peakTime: string;
    recommendations: string;
    protection: string;
    levels: {
      low: string;
      moderate: string;
      high: string;
      veryHigh: string;
      extreme: string;
    };
  };

  // Forecast
  forecast: {
    title: string;
    sevenDay: string;
    today: string;
    tomorrow: string;
    precipitation: string;
    precipitationChance: string;
    high: string;
    low: string;
    morning: string;
    afternoon: string;
    evening: string;
    night: string;
  };

  // Messages
  messages: {
    title: string;
    comingSoon: string;
    description: string;
    targetDate: string;
  };

  // Settings
  settings: {
    title: string;
    appearance: string;
    theme: string;
    themeLight: string;
    themeDark: string;
    themeSystem: string;
    highContrast: string;
    language: string;
    units: string;
    temperature: string;
    speed: string;
    pressure: string;
    preferences: string;
    skinType: string;
    notifications: string;
    about: string;
    version: string;
    developer: string;
    performanceOverlay: string;
    material3: string;
  };

  // Errors
  errors: {
    network: string;
    location: string;
    locationPermission: string;
    weatherData: string;
    unknown: string;
    tryAgain: string;
    offline: string;
  };

  // Skin types
  skinTypes: {
    veryFair: string;
    fair: string;
    medium: string;
    olive: string;
    brown: string;
    black: string;
  };
}

export type TranslationKey = keyof Translation;
export type NestedTranslationKey = string; // e.g., 'common.loading', 'weather.title'
