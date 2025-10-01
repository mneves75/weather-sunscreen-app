/**
 * Weather context for app-wide weather state management
 */

import { weatherService } from '@/src/services';
import { logger } from '@/src/services/LoggerService';
import { Coordinates, Forecast, UVIndex, WeatherData } from '@/src/types';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

interface WeatherContextValue {
  // State
  weatherData: WeatherData | null;
  forecast: Forecast | null;
  uvIndex: UVIndex | null;
  currentLocation: Coordinates | null;

  // Loading states
  isLoadingWeather: boolean;
  isLoadingForecast: boolean;
  isLoadingUV: boolean;

  // Error states
  weatherError: Error | null;
  forecastError: Error | null;
  uvError: Error | null;

  // Actions
  setLocation: (coords: Coordinates) => void;
  refreshWeather: () => Promise<void>;
  refreshForecast: () => Promise<void>;
  refreshUV: () => Promise<void>;
  refreshAll: () => Promise<void>;
}

const WeatherContext = createContext<WeatherContextValue | undefined>(undefined);

interface WeatherProviderProps {
  children: React.ReactNode;
}

export function WeatherProvider({ children }: WeatherProviderProps) {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<Forecast | null>(null);
  const [uvIndex, setUVIndex] = useState<UVIndex | null>(null);
  const [currentLocation, setCurrentLocation] = useState<Coordinates | null>(null);

  const [isLoadingWeather, setIsLoadingWeather] = useState(false);
  const [isLoadingForecast, setIsLoadingForecast] = useState(false);
  const [isLoadingUV, setIsLoadingUV] = useState(false);

  const [weatherError, setWeatherError] = useState<Error | null>(null);
  const [forecastError, setForecastError] = useState<Error | null>(null);
  const [uvError, setUVError] = useState<Error | null>(null);

  // Refresh weather data
  const refreshWeather = useCallback(async () => {
    if (!currentLocation) {
      logger.warn('Cannot refresh weather: no location set', 'WEATHER');
      return;
    }

    setIsLoadingWeather(true);
    setWeatherError(null);

    try {
      logger.info('Refreshing weather data', 'WEATHER', { location: currentLocation });
      const data = await weatherService.getWeatherData(currentLocation);
      setWeatherData(data);
    } catch (error) {
      logger.error('Failed to refresh weather', error as Error, 'WEATHER');
      setWeatherError(error as Error);
    } finally {
      setIsLoadingWeather(false);
    }
  }, [currentLocation]);

  // Refresh forecast data
  const refreshForecast = useCallback(async () => {
    if (!currentLocation) {
      logger.warn('Cannot refresh forecast: no location set', 'WEATHER');
      return;
    }

    setIsLoadingForecast(true);
    setForecastError(null);

    try {
      logger.info('Refreshing forecast', 'WEATHER', { location: currentLocation });
      const data = await weatherService.getForecast(currentLocation);
      setForecast(data);
    } catch (error) {
      logger.error('Failed to refresh forecast', error as Error, 'WEATHER');
      setForecastError(error as Error);
    } finally {
      setIsLoadingForecast(false);
    }
  }, [currentLocation]);

  // Refresh UV index
  const refreshUV = useCallback(async () => {
    if (!currentLocation) {
      logger.warn('Cannot refresh UV: no location set', 'WEATHER');
      return;
    }

    setIsLoadingUV(true);
    setUVError(null);

    try {
      logger.info('Refreshing UV index', 'WEATHER', { location: currentLocation });
      const data = await weatherService.getUVIndex(currentLocation);
      setUVIndex(data);
    } catch (error) {
      logger.error('Failed to refresh UV', error as Error, 'WEATHER');
      setUVError(error as Error);
    } finally {
      setIsLoadingUV(false);
    }
  }, [currentLocation]);

  // Refresh all data with proper error handling
  const refreshAll = useCallback(async () => {
    // Use Promise.allSettled to handle individual failures gracefully
    const results = await Promise.allSettled([
      refreshWeather(),
      refreshForecast(),
      refreshUV(),
    ]);

    // Log any failures but don't throw - let individual refresh methods handle errors
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        logger.error(`Refresh ${index} failed`, result.reason, 'WEATHER');
      }
    });

    // If all failed, log a warning
    const failedCount = results.filter(r => r.status === 'rejected').length;
    if (failedCount === results.length) {
      logger.warn('All refresh operations failed', 'WEATHER');
    }
  }, [refreshWeather, refreshForecast, refreshUV]);

  // Set location and automatically fetch data
  const setLocation = useCallback((coords: Coordinates) => {
    logger.info('Setting new location', 'WEATHER', { coords });
    setCurrentLocation(coords);
  }, []);

  // Auto-refresh when location changes - prevent infinite loops
  useEffect(() => {
    if (currentLocation && !isLoadingWeather && !isLoadingForecast && !isLoadingUV) {
      // Add small delay to prevent rapid successive calls
      const timeoutId = setTimeout(() => {
        refreshAll();
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [currentLocation, isLoadingWeather, isLoadingForecast, isLoadingUV, refreshAll]);

  const value: WeatherContextValue = {
    weatherData,
    forecast,
    uvIndex,
    currentLocation,
    isLoadingWeather,
    isLoadingForecast,
    isLoadingUV,
    weatherError,
    forecastError,
    uvError,
    setLocation,
    refreshWeather,
    refreshForecast,
    refreshUV,
    refreshAll,
  };

  return (
    <WeatherContext.Provider value={value}>
      {children}
    </WeatherContext.Provider>
  );
}

/**
 * Hook to access weather context
 */
export function useWeather(): WeatherContextValue {
  const context = useContext(WeatherContext);
  if (context === undefined) {
    throw new Error('useWeather must be used within a WeatherProvider');
  }
  return context;
}
