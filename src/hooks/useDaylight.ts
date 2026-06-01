import { useMemo } from 'react';
import { useForecast } from './useForecast';
import { DaylightData, ForecastDay } from '@/src/types';

interface DaylightResult {
  day?: ForecastDay;
  daylight?: DaylightData;
  peakUV?: number;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

// Build the YYYY-MM-DD key from LOCAL calendar components, not UTC.
// toISOString() is UTC, so for users west of UTC in the evening it rolls to tomorrow's
// date and never matches the forecast day, silently falling back to days[0] — showing
// sunrise/sunset/peak-UV for the wrong day.
export function getTodayKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function useDaylight(now: Date = new Date()): DaylightResult {
  const { days, isLoading, error, refresh } = useForecast();

  const todayKey = getTodayKey(now);

  const activeDay = useMemo(() => {
    if (!days.length) {
      return undefined;
    }

    const exactMatch = days.find((day) => day.date === todayKey);
    return exactMatch ?? days[0];
  }, [days, todayKey]);

  return {
    day: activeDay,
    daylight: activeDay?.daylight,
    peakUV: activeDay?.uvIndex.max,
    isLoading,
    error,
    refresh,
  };
}
