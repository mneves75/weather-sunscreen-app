/**
 * Central type definitions export
 */

export * from './ai';
export * from './i18n';
export * from './messages';
export * from './notifications';
export * from './services';
export * from './sunscreen';
export * from './theme';
export * from './weather';

// Re-export commonly used types for convenience
export type {
    Forecast,
    ForecastDay, DaylightData, UVHourlyPoint, UVIndex, WeatherData
} from './weather';

export type {
    Theme, ThemeColors,
    ThemeContextValue, ThemeMode
} from './theme';

export type {
    Locale,
    Translation
} from './i18n';

export type {
    AlertRule,
    AlertRuleCondition, AlertRuleEvaluationResult, AlertRuleOperator, DiagnosticLog, LogEntry, LogLevel, MessageServiceConfig, SkinType, UserPreferences
} from './services';

export type {
    BatchOperationResult, Message,
    MessageCategory, MessageFilter, MessageInput, MessageSeverity, MessageSort, MessageSortDirection, MessageSortField, MessageStats, MessageUpdate
} from './messages';

export type {
    AnyNotificationTrigger, NotificationAction,
    NotificationCategory, NotificationChannel, NotificationPayload, NotificationPermission,
    NotificationPermissionStatus, NotificationPlatform, NotificationResponse, NotificationServiceConfig, NotificationToken, NotificationTrigger,
    NotificationTriggerType, ReceivedNotification, ScheduledNotification
} from './notifications';
