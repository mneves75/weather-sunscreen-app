/**
 * Custom hook for accessing and managing forecast data
 */

import { useSettings } from '@/src/context/SettingsContext';
import { useWeather } from '@/src/context/WeatherContext';
import { convertTemperature } from '@/src/utils';
import { useCallback, useEffect, useRef } from 'react';

export function useForecast() {
  const {
    forecast,
    isLoadingForecast,
    forecastError,
    refreshForecast,
    currentLocation,
  } = useWeather();

  const { preferences } = useSettings();

  const hasRequestedInitialForecastRef = useRef(false);
  const lastLocationKeyRef = useRef<string | null>(null);
  
  // Convert temperature based on user preference
  const convertedTemperature = useCallback((celsius: number) => {
    return convertTemperature(celsius, 'celsius', preferences.temperatureUnit);
  }, [preferences.temperatureUnit]);
  
  // Get temperature with unit
  const getTemperatureWithUnit = useCallback((celsius: number) => {
    const converted = convertedTemperature(celsius);
    const symbol = preferences.temperatureUnit === 'celsius' ? '°C' : '°F';
    return `${Math.round(converted)}${symbol}`;
  }, [convertedTemperature, preferences.temperatureUnit]);
  
  // Auto-refresh when location changes - only once per coordinate change
  useEffect(() => {
    if (!currentLocation) {
      hasRequestedInitialForecastRef.current = false;
      lastLocationKeyRef.current = null;
      return;
    }

    const locationKey = `${currentLocation.latitude}:${currentLocation.longitude}`;
    if (lastLocationKeyRef.current !== locationKey) {
      hasRequestedInitialForecastRef.current = false;
      lastLocationKeyRef.current = locationKey;
    }

    if (
      !hasRequestedInitialForecastRef.current &&
      !forecast &&
      !isLoadingForecast
    ) {
      hasRequestedInitialForecastRef.current = true;
      void refreshForecast();
    }
  }, [currentLocation?.latitude, currentLocation?.longitude, forecast, isLoadingForecast, refreshForecast]);
  
  return {
    forecast,
    days: forecast?.days || [],
    isLoading: isLoadingForecast,
    error: forecastError,
    refresh: refreshForecast,
    hasLocation: !!currentLocation,
    
    // Conversion helpers
    convertedTemperature,
    getTemperatureWithUnit,
    
    // Units
    temperatureUnit: preferences.temperatureUnit,
  };
}
