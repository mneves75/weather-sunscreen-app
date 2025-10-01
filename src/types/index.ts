/**
 * Central type definitions export
 */

export * from './weather';
export * from './theme';
export * from './i18n';
export * from './services';
export * from './messages';
export * from './notifications';

// Re-export commonly used types for convenience
export type {
  WeatherData,
  UVIndex,
  Forecast,
  ForecastDay,
} from './weather';

export type {
  Theme,
  ThemeMode,
  ThemeColors,
  ThemeContextValue,
} from './theme';

export type {
  Locale,
  Translation,
} from './i18n';

export type {
  LogLevel,
  LogEntry,
  DiagnosticLog,
  UserPreferences,
  SkinType,
  MessageServiceConfig,
  AlertRule,
  AlertRuleCondition,
  AlertRuleOperator,
  AlertRuleEvaluationResult,
} from './services';

export type {
  Message,
  MessageCategory,
  MessageSeverity,
  MessageFilter,
  MessageStats,
  MessageInput,
  MessageUpdate,
  MessageSort,
  MessageSortField,
  MessageSortDirection,
  BatchOperationResult,
} from './messages';

export type {
  NotificationToken,
  NotificationPermission,
  NotificationPermissionStatus,
  NotificationPayload,
  NotificationPlatform,
  NotificationTrigger,
  NotificationTriggerType,
  AnyNotificationTrigger,
  ScheduledNotification,
  NotificationAction,
  NotificationCategory,
  NotificationResponse,
  ReceivedNotification,
  NotificationChannel,
  NotificationServiceConfig,
} from './notifications';
