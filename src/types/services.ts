/**
 * Service-related TypeScript type definitions
 */

import type { MessageSeverity } from './messages';

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

/**
 * Message service configuration
 */
export interface MessageServiceConfig {
  /** Maximum number of messages to store */
  maxMessages: number;
  
  /** Number of days to retain messages */
  retentionDays: number;
  
  /** Automatically delete read messages after retention period */
  autoDeleteRead: boolean;
  
  /** Batch size for bulk operations */
  batchSize: number;
  
  /** Enable automatic cleanup on service initialization */
  autoCleanup: boolean;
}

/**
 * Comparison operator for alert rule conditions
 */
export type AlertRuleOperator = 'gt' | 'lt' | 'eq' | 'gte' | 'lte' | 'neq';

/**
 * Alert rule condition
 */
export interface AlertRuleCondition {
  /** Field to evaluate */
  field: string;
  
  /** Comparison operator */
  operator: AlertRuleOperator;
  
  /** Value to compare against */
  value: number | string | boolean;
}

/**
 * Alert rule for generating messages from weather/UV data
 */
export interface AlertRule {
  /** Unique rule identifier */
  id: string;
  
  /** Rule type */
  type: 'weather' | 'uv';
  
  /** Whether the rule is enabled */
  enabled: boolean;
  
  /** Rule name for identification */
  name: string;
  
  /** Rule description */
  description?: string;
  
  /** Conditions that must be met to trigger the alert */
  conditions: AlertRuleCondition[];
  
  /** Logic operator for multiple conditions */
  conditionLogic?: 'and' | 'or';
  
  /** Message template to generate */
  message: {
    /** Message title (supports {{field}} interpolation) */
    title: string;
    
    /** Message body (supports {{field}} interpolation) */
    body: string;
    
    /** Message severity */
    severity: MessageSeverity;
    
    /** Optional action label */
    actionLabel?: string;
    
    /** Optional action URL */
    actionUrl?: string;
  };
  
  /** Cooldown period in minutes before rule can trigger again */
  cooldownMinutes: number;
  
  /** Last time the rule was triggered (Unix timestamp) */
  lastTriggered?: number;
  
  /** Rule priority (higher = more important) */
  priority?: number;
  
  /** Whether rule should trigger notifications */
  triggerNotification?: boolean;
  
  /** Custom data to include in generated message */
  customData?: Record<string, unknown>;
}

/**
 * Alert rule evaluation result
 */
export interface AlertRuleEvaluationResult {
  /** Rule that was evaluated */
  rule: AlertRule;
  
  /** Whether the rule conditions were met */
  triggered: boolean;
  
  /** Reason for trigger or non-trigger */
  reason: string;
  
  /** Whether the rule is in cooldown */
  inCooldown: boolean;
  
  /** Data context used for evaluation */
  context: Record<string, unknown>;
}
