/**
 * Internationalization (i18n) TypeScript type definitions
 */

export type Locale = 'en' | 'pt-BR';

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
