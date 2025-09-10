import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { logger } from '../services/loggerService';

// Safe import of expo-localization with fallback
type LocalizationLike = {
  locale?: string;
  locales?: string[];
  timezone?: string;
  isRTL?: boolean;
  region?: string;
};
let Localization: LocalizationLike | null = null;
try {
  Localization = require('expo-localization');
  logger.info('✅ ExpoLocalization native module loaded successfully');
} catch {
  logger.warn('⚠️ ExpoLocalization native module not available');
  logger.info('🌐 Using fallback localization for development');
  // Fallback localization object
  Localization = {
    locale: 'en-US',
    locales: ['en-US'],
    timezone: 'America/New_York',
    isRTL: false,
    region: 'US',
  };
}

// Import translation files
import en from './locales/en.json';
import ptBR from './locales/pt-BR.json';

/**
 * Internationalization configuration for Weather Sunscreen App
 * Supports English and Brazilian Portuguese based on device locale
 */

// Get device locale and map to supported languages
const getDeviceLocale = (): string => {
  let locale = 'en-US';

  try {
    if (Localization && Localization.locale) {
      locale = Localization.locale;
      logger.info('📱 Device locale detected:', { locale });
    } else {
      logger.info('📱 Using fallback locale: en-US');
    }
  } catch {
    logger.warn('Failed to get device locale');
    logger.info('📱 Using fallback locale: en-US');
  }

  // Map device locales to our supported languages
  if (locale.startsWith('pt')) {
    // Portuguese variants (pt-BR, pt-PT, etc.) -> Brazilian Portuguese
    return 'pt-BR';
  }

  // Default to English for all other locales
  return 'en';
};

// Initialize i18next
i18n.use(initReactI18next).init({
  // Automatically detect and set language based on device
  lng: getDeviceLocale(),

  // Fallback language if translation is missing
  fallbackLng: 'en',

  // Available languages
  supportedLngs: ['en', 'pt-BR'],

  // Translation resources
  resources: {
    en: {
      translation: en,
    },
    'pt-BR': {
      translation: ptBR,
    },
  },

  // i18next configuration
  interpolation: {
    escapeValue: false, // React already handles XSS protection
  },

  // Development options
  debug: __DEV__, // Only log in development

  // Key separator and namespace separator
  keySeparator: '.',
  nsSeparator: ':',

  // Return empty string for missing keys in production
  saveMissing: __DEV__,
  missingKeyHandler: (lng, ns, key) => {
    if (__DEV__) {
      logger.warn('Missing translation key', { key, language: lng });
    }
  },
});

// Export language utilities
export const getCurrentLanguage = (): string => i18n.language;
export const isPortuguese = (): boolean => i18n.language === 'pt-BR';
export const isEnglish = (): boolean => i18n.language === 'en';

// Function to manually change language (useful for settings)
export const changeLanguage = async (languageCode: string): Promise<void> => {
  logger.info('🌐 Changing language', { languageCode });
  await i18n.changeLanguage(languageCode);
};

// Get device region information
export const getLocalizationInfo = () => {
  if (!Localization) {
    return {
      locale: 'en-US',
      locales: ['en-US'],
      timezone: 'America/New_York',
      isRTL: false,
      region: 'US',
    };
  }

  try {
    return {
      locale: Localization.locale || 'en-US',
      locales: Localization.locales || ['en-US'],
      timezone: Localization.timezone || 'America/New_York',
      isRTL: Localization.isRTL || false,
      region: Localization.region || 'US',
    };
  } catch {
    logger.warn('Failed to get localization info');
    return {
      locale: 'en-US',
      locales: ['en-US'],
      timezone: 'America/New_York',
      isRTL: false,
      region: 'US',
    };
  }
};

export default i18n;
