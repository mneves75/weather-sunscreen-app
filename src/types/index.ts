/**
 * Central type definitions export
 */

export * from './weather';
export * from './theme';
export * from './i18n';
export * from './services';

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
} from './services';
