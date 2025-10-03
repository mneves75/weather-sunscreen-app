import { getCurrentLanguage } from '@/src/i18n';
import type { Locale } from '@/src/types';
import { aiService } from './AIService';
import { logger } from './LoggerService';

interface TranslationServiceParams {
  title: string;
  body: string;
  sourceLanguage?: string;
  targetLanguage?: string;
  providedTranslations?: Record<string, { title: string; body: string }>;
}

interface TranslationServiceResult {
  translatedTitle?: string;
  translatedBody?: string;
  translations?: Record<string, { title: string; body: string }>;
}

class TranslationService {
  private static instance: TranslationService;
  private cache = new Map<string, { title: string; body: string }>();

  private constructor() {}

  public static getInstance(): TranslationService {
    if (!TranslationService.instance) {
      TranslationService.instance = new TranslationService();
    }
    return TranslationService.instance;
  }

  public async translateIfNeeded(params: TranslationServiceParams): Promise<TranslationServiceResult> {
    const {
      title,
      body,
      sourceLanguage = 'en',
      targetLanguage,
      providedTranslations,
    } = params;

    const appLanguage = targetLanguage ?? (getCurrentLanguage() as string | Locale | undefined);
    if (!appLanguage || appLanguage === sourceLanguage) {
      return {
        translations: providedTranslations,
      };
    }

    const translations = { ...(providedTranslations ?? {}) };

    const existing = translations[appLanguage];
    if (existing) {
      return {
        translatedTitle: existing.title,
        translatedBody: existing.body,
        translations,
      };
    }

    const cacheKey = this.getCacheKey(title, body, sourceLanguage, appLanguage);
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      translations[appLanguage] = cached;
      return {
        translatedTitle: cached.title,
        translatedBody: cached.body,
        translations,
      };
    }

    try {
      const translation = await aiService.translateMessage({
        title,
        body,
        sourceLanguage,
        targetLanguage: appLanguage,
      });

      if (translation.title !== title || translation.body !== body) {
        translations[appLanguage] = translation;
        this.cache.set(cacheKey, translation);
        return {
          translatedTitle: translation.title,
          translatedBody: translation.body,
          translations,
        };
      }

      return {
        translations: Object.keys(translations).length ? translations : undefined,
      };
    } catch (error) {
      logger.warn('Failed to obtain translation for message', 'TRANSLATION', {
        error: (error as Error).message,
        sourceLanguage,
        targetLanguage: appLanguage,
      });

      return {
        translations: Object.keys(translations).length ? translations : undefined,
      };
    }
  }

  private getCacheKey(title: string, body: string, sourceLanguage: string, targetLanguage: string): string {
    return JSON.stringify({ title, body, sourceLanguage, targetLanguage });
  }
}

export const translationService = TranslationService.getInstance();
