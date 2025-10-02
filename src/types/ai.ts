/**
 * AI-related TypeScript type definitions
 */

import type { SkinType, UVIndex, WeatherData } from './weather';

export interface AIRecommendationRequest {
  uvIndex: number;
  skinType: SkinType;
  weather: WeatherData;
  currentTime?: Date;
  userPreferences?: {
    waterResistant?: boolean;
    sensitive?: boolean;
    outdoor?: boolean;
  };
}

export interface SunscreenRecommendation {
  spf: number;
  reapplyInterval: number; // minutes
  type: 'physical' | 'chemical' | 'hybrid';
  features: string[];
  reasoning: string;
  urgency: 'low' | 'moderate' | 'high' | 'critical';
  additionalTips: string[];
}

export interface WeatherInsightRequest {
  question: string;
  weather?: WeatherData;
  uvIndex?: UVIndex;
  context?: Record<string, any>;
}

export interface WeatherInsight {
  answer: string;
  confidence: number;
  sources?: string[];
  suggestions?: string[];
}

export interface SmartNotificationRequest {
  type: 'uv-alert' | 'weather-alert' | 'sunscreen-reminder' | 'activity-suggestion';
  data: {
    uvIndex?: number;
    weather?: WeatherData;
    skinType?: SkinType;
    lastApplication?: Date;
    currentActivity?: string;
  };
  userContext?: {
    location?: string;
    preferences?: Record<string, any>;
  };
}

export interface SmartNotification {
  title: string;
  body: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actionLabel?: string;
  actionUrl?: string;
  reasoning: string;
}

export interface ActivitySuggestion {
  activity: string;
  suitability: number; // 0-100
  timing: string;
  precautions: string[];
  reasoning: string;
}

export interface AIServiceConfig {
  apiKey: string;
  model: string;
  maxTokens?: number;
  temperature?: number;
  enabled?: boolean;
}

export interface AIError {
  code: 'rate_limit' | 'invalid_key' | 'network_error' | 'unknown';
  message: string;
  details?: any;
}
