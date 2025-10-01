/**
 * Application-wide timing constants
 * Centralized for easy tuning and clarity
 */

export const TIMINGS = {
  // Cache durations
  WEATHER_CACHE_DURATION: 10 * 60 * 1000, // 10 minutes
  LOCATION_CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
  OPENMETEO_CACHE_DURATION: 15 * 60 * 1000, // 15 minutes (API recommendation)

  // Cleanup intervals
  CACHE_CLEANUP_INTERVAL: 5 * 60 * 1000, // 5 minutes

  // Timeouts
  THEME_HYDRATION_TIMEOUT: 3000, // 3 seconds
  LOCATION_REQUEST_TIMEOUT: 15 * 1000, // 15 seconds
  LOCATION_MAX_AGE: 30 * 1000, // 30 seconds

  // Debounce/throttle delays
  LOCATION_UPDATE_DEBOUNCE: 150, // milliseconds
  NETWORK_CHECK_CACHE: 1000, // 1 second (cache network status checks)

  // Reapplication timer intervals
  REAPPLICATION_CHECK_MIN: 30 * 1000, // 30 seconds
  REAPPLICATION_CHECK_MAX: 5 * 60 * 1000, // 5 minutes
  REAPPLICATION_CHECK_DEFAULT: 10 * 60 * 1000, // 10 minutes
  REAPPLICATION_CHECK_ERROR_RETRY: 5 * 60 * 1000, // 5 minutes

  // React Query
  QUERY_STALE_TIME: 60_000, // 1 minute
  QUERY_GC_TIME: 5 * 60_000, // 5 minutes

  // Retry delays (exponential backoff)
  RETRY_BASE_DELAY: 1000, // 1 second
  RETRY_MAX_DELAY: 30000, // 30 seconds

  // Native module
  MODULE_CACHE_INVALIDATION_MIN_INTERVAL: 60000, // 1 minute
} as const;

export const LIMITS = {
  // Cache sizes
  MAX_CACHE_SIZE: 10,
  MAX_RECENT_APPLICATIONS: 10,

  // API limits
  MAX_FORECAST_DAYS: 16, // Open-Meteo maximum
  MIN_FORECAST_DAYS: 1,
  MAX_HOURLY_FORECAST_HOURS: 48,
  MIN_HOURLY_FORECAST_HOURS: 1,

  // Retry limits
  MAX_RETRIES: 2, // 3 total attempts

  // Weather data parity thresholds
  TEMPERATURE_DELTA_WARNING: 5, // degrees C
  TEMPERATURE_DELTA_CRITICAL: 10, // degrees C
  PARITY_CHECK_SAMPLE_RATE: 0.1, // 10% sampling in production (100% in dev)
} as const;
