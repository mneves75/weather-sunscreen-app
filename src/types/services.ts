/**
 * Service-related TypeScript type definitions
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  level: LogLevel;
  message: string;
  category?: string;
  timestamp: number;
  data?: Record<string, unknown>;
  error?: Error;
}

export interface DiagnosticLog {
  id: string;
  level: 'warn' | 'error';
  message: string;
  timestamp: number;
  stack?: string;
  context?: Record<string, unknown>;
}

export interface DiagnosticsBuffer {
  logs: DiagnosticLog[];
  maxSize: number;
  enabled: boolean;
}

export interface WeatherServiceConfig {
  apiKey?: string;
  baseUrl?: string;
  timeout: number;
  retryAttempts: number;
  cacheTimeout: number;
}

export interface WeatherServiceError {
  code: string;
  message: string;
  originalError?: Error;
  timestamp: number;
}

export type SkinType = 'very-fair' | 'fair' | 'medium' | 'olive' | 'brown' | 'black';

export interface UserPreferences {
  skinType: SkinType;
  temperatureUnit: 'celsius' | 'fahrenheit';
  speedUnit: 'kmh' | 'mph' | 'ms';
  pressureUnit: 'hPa' | 'inHg' | 'mmHg';
  notificationsEnabled: boolean;
  uvAlerts: boolean;
  weatherAlerts: boolean;
  locale: 'en' | 'pt-BR';
}
