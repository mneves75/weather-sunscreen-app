/**
 * AI Service
 * Handles AI-powered features using Vercel AI SDK with Anthropic
 *
 * Features:
 * - Sunscreen recommendations based on UV index and skin type
 * - Smart notification generation
 * - Weather insights and Q&A
 * - Activity suggestions
 *
 * @see https://sdk.vercel.ai/docs
 */

import { generateText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { z } from 'zod';
import type {
  AIRecommendationRequest,
  SunscreenRecommendation,
  SmartNotificationRequest,
  SmartNotification,
  WeatherInsightRequest,
  WeatherInsight,
  ActivitySuggestion,
  AIServiceConfig,
  AIError,
  TranslateMessageRequest,
} from '@/src/types/ai';
import { logger } from './LoggerService';

// Zod schemas for structured outputs
const SunscreenRecommendationSchema = z.object({
  spf: z.number().min(15).max(100),
  reapplyInterval: z.number().min(60).max(360),
  type: z.enum(['physical', 'chemical', 'hybrid']),
  features: z.array(z.string()),
  reasoning: z.string(),
  urgency: z.enum(['low', 'moderate', 'high', 'critical']),
  additionalTips: z.array(z.string()),
});

const SmartNotificationSchema = z.object({
  title: z.string().max(50),
  body: z.string().max(200),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  actionLabel: z.string().optional(),
  actionUrl: z.string().optional(),
  reasoning: z.string(),
});

const ActivitySuggestionSchema = z.object({
  activity: z.string(),
  suitability: z.number().min(0).max(100),
  timing: z.string(),
  precautions: z.array(z.string()),
  reasoning: z.string(),
});

class AIService {
  private static instance: AIService;
  private config: AIServiceConfig;
  private model: ReturnType<typeof anthropic>;

  private constructor() {
    // Default configuration
    this.config = {
      apiKey: process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY || '',
      model: 'claude-3-5-sonnet-20241022',
      maxTokens: 500,
      temperature: 0.7,
      enabled: !!process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY,
    };

    this.model = anthropic(this.config.model);
  }

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  /**
   * Check if AI service is enabled and configured
   */
  public isEnabled(): boolean {
    return this.config.enabled ?? false;
  }

  /**
   * Generate AI-powered sunscreen recommendation
   */
  public async generateSunscreenRecommendation(
    request: AIRecommendationRequest
  ): Promise<SunscreenRecommendation> {
    if (!this.isEnabled()) {
      return this.getFallbackRecommendation(request);
    }

    try {
      const startTime = Date.now();
      logger.info('Generating AI sunscreen recommendation', 'AI_SERVICE', {
        uvIndex: request.uvIndex,
        skinType: request.skinType,
      });

      const prompt = this.buildRecommendationPrompt(request);

      const { text } = await generateText({
        model: this.model,
        prompt,
        temperature: this.config.temperature,
      });

      const recommendation = this.parseRecommendation(text, request);

      logger.info(
        `Generated recommendation in ${Date.now() - startTime}ms`,
        'AI_SERVICE',
        { spf: recommendation.spf, urgency: recommendation.urgency }
      );

      return recommendation;
    } catch (error) {
      logger.error('Failed to generate AI recommendation', error as Error, 'AI_SERVICE');
      return this.getFallbackRecommendation(request);
    }
  }

  /**
   * Generate smart notification content
   */
  public async generateSmartNotification(
    request: SmartNotificationRequest
  ): Promise<SmartNotification> {
    if (!this.isEnabled()) {
      return this.getFallbackNotification(request);
    }

    try {
      const startTime = Date.now();
      logger.info('Generating smart notification', 'AI_SERVICE', {
        type: request.type,
      });

      const prompt = this.buildNotificationPrompt(request);

      const { text } = await generateText({
        model: this.model,
        prompt,
        temperature: 0.8,
      });

      const notification = this.parseNotification(text, request);

      logger.info(
        `Generated notification in ${Date.now() - startTime}ms`,
        'AI_SERVICE',
        { priority: notification.priority }
      );

      return notification;
    } catch (error) {
      logger.error('Failed to generate smart notification', error as Error, 'AI_SERVICE');
      return this.getFallbackNotification(request);
    }
  }

  /**
   * Get weather insight or answer question
   */
  public async getWeatherInsight(
    request: WeatherInsightRequest
  ): Promise<WeatherInsight> {
    if (!this.isEnabled()) {
      return {
        answer: 'AI insights are not currently available.',
        confidence: 0,
      };
    }

    try {
      const startTime = Date.now();
      logger.info('Getting weather insight', 'AI_SERVICE', {
        question: request.question,
      });

      const prompt = this.buildInsightPrompt(request);

      const { text } = await generateText({
        model: this.model,
        prompt,
        temperature: 0.7,
      });

      logger.info(
        `Generated insight in ${Date.now() - startTime}ms`,
        'AI_SERVICE'
      );

      return {
        answer: text,
        confidence: 0.85,
        suggestions: [],
      };
    } catch (error) {
      logger.error('Failed to get weather insight', error as Error, 'AI_SERVICE');
      throw error;
    }
  }

  /**
   * Translate dynamic message content between languages.
   * Falls back to original content if AI service is disabled or translation fails.
   */
  public async translateMessage(request: TranslateMessageRequest): Promise<{ title: string; body: string }> {
    const { sourceLanguage, targetLanguage, title, body } = request;

    if (!targetLanguage || targetLanguage === sourceLanguage) {
      return { title, body };
    }

    if (!this.isEnabled()) {
      logger.warn('AI translation requested but service is disabled', 'AI_SERVICE', {
        sourceLanguage,
        targetLanguage,
      });
      return { title, body };
    }

    try {
      const startTime = Date.now();
      logger.info('Translating message content', 'AI_SERVICE', {
        sourceLanguage,
        targetLanguage,
      });

      const prompt = this.buildTranslationPrompt(request);
      const { text } = await generateText({
        model: this.model,
        prompt,
        temperature: 0.2,
        maxTokens: Math.min(this.config.maxTokens ?? 500, 400),
      });

      const translation = this.parseTranslation(text, request);

      logger.info(
        `Translated message in ${Date.now() - startTime}ms`,
        'AI_SERVICE',
        { sourceLanguage, targetLanguage }
      );

      return translation;
    } catch (error) {
      logger.error('Failed to translate message content', error as Error, 'AI_SERVICE');
      return { title, body };
    }
  }

  /**
   * Generate activity suggestions based on weather
   */
  public async generateActivitySuggestions(
    request: AIRecommendationRequest,
    count: number = 3
  ): Promise<ActivitySuggestion[]> {
    if (!this.isEnabled()) {
      return this.getFallbackActivities(request);
    }

    try {
      const startTime = Date.now();
      logger.info('Generating activity suggestions', 'AI_SERVICE', {
        uvIndex: request.uvIndex,
        count,
      });

      const prompt = this.buildActivityPrompt(request, count);

      const { text } = await generateText({
        model: this.model,
        prompt,
        temperature: 0.8,
      });

      const activities = this.parseActivities(text);

      logger.info(
        `Generated ${activities.length} activities in ${Date.now() - startTime}ms`,
        'AI_SERVICE'
      );

      return activities;
    } catch (error) {
      logger.error('Failed to generate activities', error as Error, 'AI_SERVICE');
      return this.getFallbackActivities(request);
    }
  }

  /**
   * Build prompt for sunscreen recommendation
   */
  private buildRecommendationPrompt(request: AIRecommendationRequest): string {
    const { uvIndex, skinType, weather, userPreferences } = request;

    return `You are a dermatology expert providing sunscreen recommendations.

Current Conditions:
- UV Index: ${uvIndex}
- Skin Type: ${skinType}
- Temperature: ${weather.current.temperature}°C
- Condition: ${weather.current.condition}
- Cloud Cover: ${weather.current.cloudCover}%

User Preferences:
${userPreferences?.waterResistant ? '- Prefers water-resistant sunscreen' : ''}
${userPreferences?.sensitive ? '- Has sensitive skin' : ''}
${userPreferences?.outdoor ? '- Planning outdoor activities' : ''}

Provide a concise sunscreen recommendation including:
1. Recommended SPF (15-100)
2. How often to reapply (in minutes)
3. Type (physical/chemical/hybrid)
4. Key features to look for
5. Urgency level
6. 2-3 practical tips

Format your response as JSON matching this structure:
{
  "spf": number,
  "reapplyInterval": number (minutes),
  "type": "physical" | "chemical" | "hybrid",
  "features": ["feature1", "feature2"],
  "reasoning": "brief explanation",
  "urgency": "low" | "moderate" | "high" | "critical",
  "additionalTips": ["tip1", "tip2"]
}`;
  }

  /**
   * Build prompt for smart notification
   */
  private buildNotificationPrompt(request: SmartNotificationRequest): string {
    const { type, data, userContext } = request;

    return `Generate a concise, actionable notification for a weather/sunscreen app.

Type: ${type}
UV Index: ${data.uvIndex || 'N/A'}
Temperature: ${data.weather?.current.temperature || 'N/A'}°C
Location: ${userContext?.location || 'Unknown'}

Create a notification that is:
- Clear and actionable
- Under 200 characters for body
- Under 50 characters for title
- Appropriate priority level

Format as JSON:
{
  "title": "short title",
  "body": "concise message",
  "priority": "low" | "medium" | "high" | "urgent",
  "actionLabel": "optional action text",
  "actionUrl": "optional deep link",
  "reasoning": "why this notification"
}`;
  }

  /**
   * Build prompt for weather insight
   */
  private buildInsightPrompt(request: WeatherInsightRequest): string {
    return `Answer this weather-related question concisely and accurately:

Question: ${request.question}

${request.weather ? `Current Weather:
- Temperature: ${request.weather.current.temperature}°C
- Condition: ${request.weather.current.condition}
- Humidity: ${request.weather.current.humidity}%` : ''}

${request.uvIndex ? `UV Index: ${request.uvIndex.value} (${request.uvIndex.level})` : ''}

Provide a clear, helpful answer in 2-3 sentences.`;
  }

  /**
   * Build prompt for activity suggestions
   */
  private buildActivityPrompt(request: AIRecommendationRequest, count: number): string {
    return `Suggest ${count} outdoor activities suitable for current weather conditions.

Weather:
- UV Index: ${request.uvIndex}
- Temperature: ${request.weather.current.temperature}°C
- Condition: ${request.weather.current.condition}

For each activity, provide:
- Activity name
- Suitability score (0-100)
- Best timing
- Safety precautions
- Brief reasoning

Format as JSON array.`;
  }

  /**
   * Parse recommendation from AI response
   */
  private parseRecommendation(
    text: string,
    request: AIRecommendationRequest
  ): SunscreenRecommendation {
    try {
      const parsed = JSON.parse(text);
      return SunscreenRecommendationSchema.parse(parsed);
    } catch {
      return this.getFallbackRecommendation(request);
    }
  }

  /**
   * Parse notification from AI response
   */
  private parseNotification(
    text: string,
    request: SmartNotificationRequest
  ): SmartNotification {
    try {
      const parsed = JSON.parse(text);
      return SmartNotificationSchema.parse(parsed);
    } catch {
      return this.getFallbackNotification(request);
    }
  }

  /**
   * Parse activities from AI response
   */
  private parseActivities(text: string): ActivitySuggestion[] {
    try {
      const parsed = JSON.parse(text);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  /**
   * Fallback recommendation when AI is unavailable
   */
  private getFallbackRecommendation(
    request: AIRecommendationRequest
  ): SunscreenRecommendation {
    const { uvIndex, skinType } = request;

    let spf = 30;
    let urgency: 'low' | 'moderate' | 'high' | 'critical' = 'moderate';

    if (uvIndex < 3) {
      spf = 15;
      urgency = 'low';
    } else if (uvIndex < 6) {
      spf = 30;
      urgency = 'moderate';
    } else if (uvIndex < 8) {
      spf = 40;
      urgency = 'high';
    } else {
      spf = 50;
      urgency = 'critical';
    }

    // Adjust for skin type
    if (skinType === 'very-fair' || skinType === 'fair') {
      spf = Math.min(spf + 10, 100);
    }

    return {
      spf,
      reapplyInterval: uvIndex >= 8 ? 90 : 120,
      type: 'hybrid',
      features: ['broad-spectrum', 'water-resistant'],
      reasoning: `Based on UV index ${uvIndex} and skin type ${skinType}`,
      urgency,
      additionalTips: [
        'Apply 15 minutes before sun exposure',
        'Use approximately 1 ounce (shot glass full) for full body',
        'Reapply after swimming or heavy sweating',
      ],
    };
  }

  /**
   * Fallback notification when AI is unavailable
   */
  private getFallbackNotification(
    request: SmartNotificationRequest
  ): SmartNotification {
    return {
      title: 'Weather Alert',
      body: 'Check current conditions for safety recommendations',
      priority: 'medium',
      reasoning: 'Fallback notification - AI unavailable',
    };
  }

  /**
   * Fallback activities when AI is unavailable
   */
  private getFallbackActivities(
    request: AIRecommendationRequest
  ): ActivitySuggestion[] {
    return [
      {
        activity: 'Morning Walk',
        suitability: 75,
        timing: 'Early morning (6-9 AM)',
        precautions: ['Apply sunscreen', 'Wear hat', 'Stay hydrated'],
        reasoning: 'Lower UV index in morning hours',
      },
    ];
  }

  private buildTranslationPrompt(request: TranslateMessageRequest): string {
    const { sourceLanguage, targetLanguage, title, body } = request;
    return [
      'You are a professional translator. Translate the following message content.',
      'Preserve the original meaning, tone, and formatting. Do not add commentary.',
      'Return a JSON object with keys "title" and "body" only.',
      `Source language: ${sourceLanguage}.`,
      `Target language: ${targetLanguage}.`,
      'Original content:',
      `TITLE: ${JSON.stringify(title)}`,
      `BODY: ${JSON.stringify(body)}`,
    ].join('\n');
  }

  private parseTranslation(text: string, request: TranslateMessageRequest): { title: string; body: string } {
    const fallback = { title: request.title, body: request.body };

    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return fallback;
      }

      const parsed = JSON.parse(jsonMatch[0]);
      const translatedTitle = typeof parsed.title === 'string' ? parsed.title.trim() : fallback.title;
      const translatedBody = typeof parsed.body === 'string' ? parsed.body.trim() : fallback.body;

      return {
        title: translatedTitle || fallback.title,
        body: translatedBody || fallback.body,
      };
    } catch (error) {
      logger.warn('Failed to parse translation response', 'AI_SERVICE', { error: (error as Error).message });
      return fallback;
    }
  }
}

// Export singleton instance
export const aiService = AIService.getInstance();
