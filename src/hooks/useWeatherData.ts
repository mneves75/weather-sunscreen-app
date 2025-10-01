/**
 * Custom hook for accessing and managing weather data
 */

import { useSettings } from '@/src/context/SettingsContext';
import { useWeather } from '@/src/context/WeatherContext';
import { convertPressure, convertSpeed, convertTemperature } from '@/src/utils';
import { useCallback, useEffect } from 'react';

export function useWeatherData() {
  const {
    weatherData,
    isLoadingWeather,
    weatherError,
    refreshWeather,
    currentLocation,
  } = useWeather();
  
  const { preferences } = useSettings();
  
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
  
  // Auto-refresh when location changes - prevent infinite loops
  useEffect(() => {
    if (currentLocation && !weatherData && !isLoadingWeather && !weatherError) {
      // Add small delay to prevent rapid successive calls
      const timeoutId = setTimeout(() => {
        refreshWeather();
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [currentLocation, weatherData, isLoadingWeather, weatherError, refreshWeather]);
  
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

