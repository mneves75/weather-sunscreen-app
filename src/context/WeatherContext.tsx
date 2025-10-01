/**
 * Weather context for app-wide weather state management
 */

import { alertRuleEngine, weatherService } from '@/src/services';
import { logger } from '@/src/services/LoggerService';
import { Coordinates, Forecast, UVIndex, WeatherData } from '@/src/types';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

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

  const isRefreshingAllRef = useRef(false);

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
    if (isRefreshingAllRef.current) {
      logger.debug('Skipping refreshAll: refresh already in progress', 'WEATHER');
      return;
    }

    isRefreshingAllRef.current = true;
    const sources = ['weather', 'forecast', 'uv'] as const;

    try {
      const results = await Promise.allSettled([
        refreshWeather(),
        refreshForecast(),
        refreshUV(),
      ]);

      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          const source = sources[index] ?? 'unknown';
          logger.error(`Failed to refresh ${source}`, result.reason, 'WEATHER');
        }
      });

      if (results.every(result => result.status === 'rejected')) {
        logger.warn('All refresh operations failed', 'WEATHER');
      }
    } finally {
      isRefreshingAllRef.current = false;
    }
  }, [refreshWeather, refreshForecast, refreshUV]);

  // Set location and automatically fetch data
  const setLocation = useCallback((coords: Coordinates) => {
    logger.info('Setting new location', 'WEATHER', { coords });
    setCurrentLocation(coords);
  }, []);

  // Auto-refresh when location changes - detect coordinate changes
  useEffect(() => {
    if (currentLocation) {
      // Add small delay to prevent rapid successive calls
      const timeoutId = setTimeout(() => {
        void refreshAll();
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [currentLocation?.latitude, currentLocation?.longitude, refreshAll]);

  // Trigger alert evaluation when weather data updates
  useEffect(() => {
    if (weatherData) {
      // Evaluate alert rules when weather data is available
      // This is non-blocking and will generate messages if conditions are met
      alertRuleEngine.evaluateRules({
        weather: weatherData,
        // Note: UV data would be passed here if available
      }).catch(error => {
        logger.warn('Failed to evaluate alert rules', 'WEATHER', { error });
        // Don't throw - alert evaluation is not critical for weather display
      });
    }
  }, [weatherData]);

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
