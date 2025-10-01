/**
 * Custom hook for accessing and managing weather data
 */

import { useSettings } from '@/src/context/SettingsContext';
import { useWeather } from '@/src/context/WeatherContext';
import { convertPressure, convertSpeed, convertTemperature } from '@/src/utils';
import { useCallback, useEffect, useRef } from 'react';

export function useWeatherData() {
  const {
    weatherData,
    isLoadingWeather,
    weatherError,
    refreshWeather,
    currentLocation,
  } = useWeather();

  const { preferences } = useSettings();

  const hasRequestedInitialWeatherRef = useRef(false);
  const lastLocationKeyRef = useRef<string | null>(null);
  
  // Convert temperature based on user preference
  const convertedTemperature = useCallback((celsius: number) => {
    return convertTemperature(celsius, 'celsius', preferences.temperatureUnit);
  }, [preferences.temperatureUnit]);
  
  // Convert speed based on user preference
  const convertedSpeed = useCallback((kmh: number) => {
    return convertSpeed(kmh, 'kmh', preferences.speedUnit);
  }, [preferences.speedUnit]);
  
  // Convert pressure based on user preference
  const convertedPressure = useCallback((hPa: number) => {
    return convertPressure(hPa, 'hPa', preferences.pressureUnit);
  }, [preferences.pressureUnit]);
  
  // Get temperature with unit
  const getTemperatureWithUnit = useCallback((celsius: number) => {
    const converted = convertedTemperature(celsius);
    const symbol = preferences.temperatureUnit === 'celsius' ? '°C' : '°F';
    return `${Math.round(converted)}${symbol}`;
  }, [convertedTemperature, preferences.temperatureUnit]);
  
  // Auto-refresh when location changes - only fetch once per coordinate change
  useEffect(() => {
    if (!currentLocation) {
      hasRequestedInitialWeatherRef.current = false;
      lastLocationKeyRef.current = null;
      return;
    }

    const locationKey = `${currentLocation.latitude}:${currentLocation.longitude}`;
    if (lastLocationKeyRef.current !== locationKey) {
      hasRequestedInitialWeatherRef.current = false;
      lastLocationKeyRef.current = locationKey;
    }

    if (
      !hasRequestedInitialWeatherRef.current &&
      !weatherData &&
      !isLoadingWeather
    ) {
      hasRequestedInitialWeatherRef.current = true;
      void refreshWeather();
    }
  }, [currentLocation?.latitude, currentLocation?.longitude, weatherData, isLoadingWeather, refreshWeather]);
  
  return {
    weatherData,
    isLoading: isLoadingWeather,
    error: weatherError,
    refresh: refreshWeather,
    hasLocation: !!currentLocation,
    
    // Conversion helpers
    convertedTemperature,
    convertedSpeed,
    convertedPressure,
    getTemperatureWithUnit,
    
    // Units
    temperatureUnit: preferences.temperatureUnit,
    speedUnit: preferences.speedUnit,
    pressureUnit: preferences.pressureUnit,
  };
}
