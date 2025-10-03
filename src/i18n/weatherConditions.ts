/**
 * Weather condition translations
 * Maps OpenMeteo WMO weather codes to translatable keys
 */

export const weatherConditions = {
  // Clear
  0: {
    key: 'clear_sky',
    en: 'Clear sky',
    'pt-BR': 'Céu limpo',
  },

  // Mainly clear
  1: {
    key: 'mainly_clear',
    en: 'Mainly clear',
    'pt-BR': 'Principalmente limpo',
  },

  // Partly cloudy
  2: {
    key: 'partly_cloudy',
    en: 'Partly cloudy',
    'pt-BR': 'Parcialmente nublado',
  },

  // Overcast
  3: {
    key: 'overcast',
    en: 'Overcast',
    'pt-BR': 'Nublado',
  },

  // Fog
  45: {
    key: 'fog',
    en: 'Fog',
    'pt-BR': 'Névoa',
  },

  // Depositing rime fog
  48: {
    key: 'depositing_rime_fog',
    en: 'Depositing rime fog',
    'pt-BR': 'Névoa gelada',
  },

  // Light drizzle
  51: {
    key: 'light_drizzle',
    en: 'Light drizzle',
    'pt-BR': 'Garoa leve',
  },

  // Moderate drizzle
  53: {
    key: 'moderate_drizzle',
    en: 'Moderate drizzle',
    'pt-BR': 'Garoa moderada',
  },

  // Dense drizzle
  55: {
    key: 'dense_drizzle',
    en: 'Dense drizzle',
    'pt-BR': 'Garoa intensa',
  },

  // Light freezing drizzle
  56: {
    key: 'light_freezing_drizzle',
    en: 'Light freezing drizzle',
    'pt-BR': 'Garoa gelada leve',
  },

  // Dense freezing drizzle
  57: {
    key: 'dense_freezing_drizzle',
    en: 'Dense freezing drizzle',
    'pt-BR': 'Garoa gelada intensa',
  },

  // Slight rain
  61: {
    key: 'slight_rain',
    en: 'Slight rain',
    'pt-BR': 'Chuva leve',
  },

  // Moderate rain
  63: {
    key: 'moderate_rain',
    en: 'Moderate rain',
    'pt-BR': 'Chuva moderada',
  },

  // Heavy rain
  65: {
    key: 'heavy_rain',
    en: 'Heavy rain',
    'pt-BR': 'Chuva forte',
  },

  // Light freezing rain
  66: {
    key: 'light_freezing_rain',
    en: 'Light freezing rain',
    'pt-BR': 'Chuva gelada leve',
  },

  // Heavy freezing rain
  67: {
    key: 'heavy_freezing_rain',
    en: 'Heavy freezing rain',
    'pt-BR': 'Chuva gelada forte',
  },

  // Slight snow
  71: {
    key: 'slight_snow',
    en: 'Slight snow',
    'pt-BR': 'Neve leve',
  },

  // Moderate snow
  73: {
    key: 'moderate_snow',
    en: 'Moderate snow',
    'pt-BR': 'Neve moderada',
  },

  // Heavy snow
  75: {
    key: 'heavy_snow',
    en: 'Heavy snow',
    'pt-BR': 'Neve forte',
  },

  // Snow grains
  77: {
    key: 'snow_grains',
    en: 'Snow grains',
    'pt-BR': 'Grãos de neve',
  },

  // Slight rain showers
  80: {
    key: 'slight_rain_showers',
    en: 'Slight rain showers',
    'pt-BR': 'Pancadas de chuva leves',
  },

  // Moderate rain showers
  81: {
    key: 'moderate_rain_showers',
    en: 'Moderate rain showers',
    'pt-BR': 'Pancadas de chuva moderadas',
  },

  // Violent rain showers
  82: {
    key: 'violent_rain_showers',
    en: 'Violent rain showers',
    'pt-BR': 'Pancadas de chuva violentas',
  },

  // Slight snow showers
  85: {
    key: 'slight_snow_showers',
    en: 'Slight snow showers',
    'pt-BR': 'Pancadas de neve leves',
  },

  // Heavy snow showers
  86: {
    key: 'heavy_snow_showers',
    en: 'Heavy snow showers',
    'pt-BR': 'Pancadas de neve fortes',
  },

  // Thunderstorm
  95: {
    key: 'thunderstorm',
    en: 'Thunderstorm',
    'pt-BR': 'Tempestade',
  },

  // Thunderstorm with slight hail
  96: {
    key: 'thunderstorm_slight_hail',
    en: 'Thunderstorm with slight hail',
    'pt-BR': 'Tempestade com granizo leve',
  },

  // Thunderstorm with heavy hail
  99: {
    key: 'thunderstorm_heavy_hail',
    en: 'Thunderstorm with heavy hail',
    'pt-BR': 'Tempestade com granizo forte',
  },
} as const;

/**
 * Get translated weather condition for WMO code
 */
export function getWeatherConditionText(wmoCode: number, locale: string = 'en'): string {
  const condition = weatherConditions[wmoCode as keyof typeof weatherConditions];

  if (!condition) {
    return locale === 'pt-BR' ? 'Desconhecido' : 'Unknown';
  }

  return condition[locale as 'en' | 'pt-BR'] || condition.en;
}

/**
 * Get translation key for weather condition
 */
export function getWeatherConditionKey(wmoCode: number): string {
  const condition = weatherConditions[wmoCode as keyof typeof weatherConditions];
  return condition?.key || 'unknown';
}
