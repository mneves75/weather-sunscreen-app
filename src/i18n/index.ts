/**
 * i18n configuration with AsyncStorage persistence
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Locale } from '@/src/types/i18n';

import en from './en.json';
import ptBR from './pt-BR.json';

const LANGUAGE_STORAGE_KEY = '@WeatherSunscreen:language';

// Language detector for AsyncStorage
const languageDetector = {
  type: 'languageDetector' as const,
  async: true,
  detect: async (callback: (lang: string) => void) => {
    try {
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (savedLanguage) {
        callback(savedLanguage);
        return;
      }
    } catch (error) {
      console.error('Failed to load saved language:', error);
    }

    // Fallback to English
    callback('en');
  },
  init: () => {},
  cacheUserLanguage: async (language: string) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch (error) {
      console.error('Failed to save language:', error);
    }
  },
};

// Initialize i18n
i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v4', // Required for i18next v23+
    resources: {
      en: { translation: en },
      'pt-BR': { translation: ptBR },
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already escapes
    },
    react: {
      useSuspense: false, // Important for React Native
    },
  });

/**
 * Change app language
 */
export async function changeLanguage(locale: Locale): Promise<void> {
  await i18n.changeLanguage(locale);
}

/**
 * Get current language
 */
export function getCurrentLanguage(): Locale {
  return i18n.language as Locale;
}

/**
 * Get available languages
 */
export function getAvailableLanguages(): Locale[] {
  return ['en', 'pt-BR'];
}

export default i18n;
