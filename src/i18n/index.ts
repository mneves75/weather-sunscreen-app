import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

// Import translation files
import en from './locales/en.json';
import ptBR from './locales/pt-BR.json';

/**
 * Internationalization configuration for Weather Sunscreen App
 * Supports English and Brazilian Portuguese based on device locale
 */

// Get device locale and map to supported languages
const getDeviceLocale = (): string => {
  const locale = Localization.locale;
  console.log('📱 Device locale detected:', locale);
  
  // Map device locales to our supported languages
  if (locale.startsWith('pt')) {
    // Portuguese variants (pt-BR, pt-PT, etc.) -> Brazilian Portuguese
    return 'pt-BR';
  }
  
  // Default to English for all other locales
  return 'en';
};

// Initialize i18next
i18n
  .use(initReactI18next)
  .init({
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
        console.warn(`Missing translation key: ${key} for language: ${lng}`);
      }
    },
  });

// Export language utilities
export const getCurrentLanguage = (): string => i18n.language;
export const isPortuguese = (): boolean => i18n.language === 'pt-BR';
export const isEnglish = (): boolean => i18n.language === 'en';

// Function to manually change language (useful for settings)
export const changeLanguage = async (languageCode: string): Promise<void> => {
  console.log('🌐 Changing language to:', languageCode);
  await i18n.changeLanguage(languageCode);
};

// Get device region information
export const getLocalizationInfo = () => ({
  locale: Localization.locale,
  locales: Localization.locales,
  timezone: Localization.timezone,
  isRTL: Localization.isRTL,
  region: Localization.region,
});

export default i18n;