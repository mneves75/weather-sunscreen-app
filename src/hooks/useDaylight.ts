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

function getTodayKey(date: Date = new Date()): string {
  return date.toISOString().split('T')[0];
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
