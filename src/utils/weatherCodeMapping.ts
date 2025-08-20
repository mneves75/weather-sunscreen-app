import i18n from '../i18n';

/**
 * WMO Weather Interpretation Codes (WW)
 * As defined by the World Meteorological Organization
 * Source: https://open-meteo.com/en/docs#weathervariables
 * 
 * Now supports internationalization with English and Brazilian Portuguese
 */

export interface WeatherInfo {
  description: string;
  icon: string;
  category: 'clear' | 'cloudy' | 'rain' | 'snow' | 'fog' | 'thunderstorm' | 'drizzle';
}

// WMO weather code mapping to icons and categories (language-agnostic)
export const WMO_WEATHER_CODES: Record<number, Omit<WeatherInfo, 'description'>> = {
  // Clear sky
  0: { icon: '☀️', category: 'clear' },

  // Mainly clear, partly cloudy, and overcast
  1: { icon: '🌤️', category: 'clear' },
  2: { icon: '⛅', category: 'cloudy' },
  3: { icon: '☁️', category: 'cloudy' },

  // Fog and depositing rime fog
  45: { icon: '🌫️', category: 'fog' },
  48: { icon: '🌫️', category: 'fog' },

  // Drizzle: Light, moderate, and dense intensity
  51: { icon: '🌦️', category: 'drizzle' },
  53: { icon: '🌦️', category: 'drizzle' },
  55: { icon: '🌧️', category: 'drizzle' },

  // Freezing Drizzle: Light and dense intensity
  56: { icon: '🌨️', category: 'drizzle' },
  57: { icon: '🌨️', category: 'drizzle' },

  // Rain: Slight, moderate and heavy intensity
  61: { icon: '🌦️', category: 'rain' },
  63: { icon: '🌧️', category: 'rain' },
  65: { icon: '🌧️', category: 'rain' },

  // Freezing Rain: Light and heavy intensity
  66: { icon: '🌨️', category: 'rain' },
  67: { icon: '🌨️', category: 'rain' },

  // Snow fall: Slight, moderate, and heavy intensity
  71: { icon: '🌨️', category: 'snow' },
  73: { icon: '❄️', category: 'snow' },
  75: { icon: '❄️', category: 'snow' },

  // Snow grains
  77: { icon: '🌨️', category: 'snow' },

  // Rain showers: Slight, moderate, and violent
  80: { icon: '🌦️', category: 'rain' },
  81: { icon: '🌧️', category: 'rain' },
  82: { icon: '⛈️', category: 'rain' },

  // Snow showers slight and heavy
  85: { icon: '🌨️', category: 'snow' },
  86: { icon: '❄️', category: 'snow' },

  // Thunderstorm: Slight or moderate and with slight and heavy hail
  95: { icon: '⛈️', category: 'thunderstorm' },
  96: { icon: '⛈️', category: 'thunderstorm' },
  99: { icon: '⛈️', category: 'thunderstorm' },
};

/**
 * Get weather information for a WMO weather code with localized description
 * @param code - WMO weather code (0-99)
 * @returns Weather information object with localized description, icon, and category
 */
export function getWeatherInfo(code: number): WeatherInfo {
  const weatherMapping = WMO_WEATHER_CODES[code];
  
  if (!weatherMapping) {
    console.warn(`Unknown weather code: ${code}, using default`);
    return {
      description: i18n.t('weather.codes.unknown'),
      icon: '❓',
      category: 'clear',
    };
  }
  
  return {
    description: i18n.t(`weather.codes.${code}`),
    icon: weatherMapping.icon,
    category: weatherMapping.category,
  };
}

/**
 * Get a simplified weather category for styling purposes
 * @param code - WMO weather code
 * @returns Simplified weather category
 */
export function getWeatherCategory(code: number): WeatherInfo['category'] {
  return getWeatherInfo(code).category;
}

/**
 * Get localized weather description from WMO code
 * @param code - WMO weather code
 * @returns Localized human-readable weather description
 */
export function getWeatherDescription(code: number): string {
  return getWeatherInfo(code).description;
}

/**
 * Get weather icon/emoji from WMO code
 * @param code - WMO weather code
 * @returns Weather icon emoji
 */
export function getWeatherIcon(code: number): string {
  return getWeatherInfo(code).icon;
}

/**
 * Check if weather code indicates precipitation
 * @param code - WMO weather code
 * @returns True if weather involves precipitation
 */
export function isPrecipitation(code: number): boolean {
  const category = getWeatherCategory(code);
  return ['rain', 'snow', 'drizzle', 'thunderstorm'].includes(category);
}

/**
 * Check if weather code indicates clear/sunny conditions
 * @param code - WMO weather code
 * @returns True if weather is clear or mainly clear
 */
export function isClearWeather(code: number): boolean {
  return code === 0 || code === 1;
}

/**
 * Get UV exposure recommendation based on weather code
 * @param code - WMO weather code
 * @returns UV exposure level (low, moderate, high)
 */
export function getUVExposureLevel(code: number): 'low' | 'moderate' | 'high' {
  const category = getWeatherCategory(code);
  
  switch (category) {
    case 'clear':
      return 'high';
    case 'cloudy':
      return code === 2 ? 'moderate' : 'low'; // Partly cloudy vs overcast
    case 'fog':
      return 'low';
    default:
      return 'low'; // Rain, snow, thunderstorm
  }
}

/**
 * Get all available weather codes and their descriptions (for debugging/testing)
 * @returns Array of all weather code mappings
 */
export function getAllWeatherCodes(): Array<{ code: number; info: WeatherInfo }> {
  return Object.entries(WMO_WEATHER_CODES)
    .map(([code, info]) => ({ code: parseInt(code), info }))
    .sort((a, b) => a.code - b.code);
}