/**
 * Weather context for app-wide weather state management
 */

import { alertRuleEngine, weatherService } from '@/src/services';
import { logger } from '@/src/services/LoggerService';
import { Coordinates, Forecast, Location, UVIndex, WeatherData } from '@/src/types';
import React, { createContext, useCallback, use, useEffect, useRef, useState } from 'react';

interface WeatherContextValue {
  // State
  weatherData: WeatherData | null;
  forecast: Forecast | null;
  uvIndex: UVIndex | null;
  currentLocation: Coordinates | null;
  currentLocationDetails: Location | null;

  // Loading states
  isLoadingWeather: boolean;
  isLoadingForecast: boolean;
  isLoadingUV: boolean;

  // Error states
  weatherError: Error | null;
  forecastError: Error | null;
  uvError: Error | null;

  // Actions
  setLocation: (coords: Coordinates, details?: Partial<Location>) => void;
  refreshWeather: () => Promise<void>;
  refreshForecast: () => Promise<void>;
  refreshUV: () => Promise<void>;
  refreshAll: () => Promise<void>;
}

const WeatherContext = createContext<WeatherContextValue | undefined>(undefined);

interface WeatherProviderProps {
  children: React.ReactNode;
}

// react-doctor-disable-next-line react-doctor/prefer-useReducer -- independent state slices; useReducer adds no runtime benefit and risks regression
export function WeatherProvider({ children }: WeatherProviderProps) {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<Forecast | null>(null);
  const [uvIndex, setUVIndex] = useState<UVIndex | null>(null);
  const [currentLocation, setCurrentLocation] = useState<Coordinates | null>(null);
  const [currentLocationDetails, setCurrentLocationDetails] = useState<Location | null>(null);

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
      logger.info('Refreshing weather data', 'WEATHER', {
        location: currentLocation,
        details: currentLocationDetails ?? undefined,
      });
      const data = await weatherService.getWeatherData(
        currentLocation,
        currentLocationDetails ?? undefined
      );

      const enrichedData = currentLocationDetails
        ? {
            ...data,
            location: {
              coordinates: data.location.coordinates ?? currentLocation,
              city: currentLocationDetails.city ?? data.location.city,
              country: currentLocationDetails.country ?? data.location.country,
              timezone: data.location.timezone ?? currentLocationDetails.timezone,
            },
          }
        : data;

      setWeatherData(enrichedData);
      if (enrichedData.uvIndex) {
        // Mirror UV data from the weather payload so UI renders even if the dedicated UV fetch fails.
        setUVIndex(enrichedData.uvIndex);
        setUVError(null);
      }
    } catch (error) {
      logger.error('Failed to refresh weather', error as Error, 'WEATHER');
      setWeatherError(error as Error);
    } finally {
      setIsLoadingWeather(false);
    }
  }, [currentLocation, currentLocationDetails]);

  // Refresh forecast data
  const refreshForecast = useCallback(async () => {
    if (!currentLocation) {
      logger.warn('Cannot refresh forecast: no location set', 'WEATHER');
      return;
    }

    setIsLoadingForecast(true);
    setForecastError(null);

    try {
      logger.info('Refreshing forecast', 'WEATHER', {
        location: currentLocation,
        details: currentLocationDetails ?? undefined,
      });
      const data = await weatherService.getForecast(
        currentLocation,
        currentLocationDetails ?? undefined
      );
      setForecast(data);
    } catch (error) {
      logger.error('Failed to refresh forecast', error as Error, 'WEATHER');
      setForecastError(error as Error);
    } finally {
      setIsLoadingForecast(false);
    }
  }, [currentLocation, currentLocationDetails]);

  // Refresh UV index
  // CRITICAL: This function fetches UV index data and updates the state.
  // The WeatherService always returns data (real, cached, or mock), never throws.
  // This ensures the context always has valid UV data to display.
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

      // WeatherService always returns valid data (real, cached, or mock fallback)
      // Never returns null/undefined
      logger.info('UV index fetched successfully', 'WEATHER', {
        location: currentLocation,
        uvValue: data.value,
        uvLevel: data.level,
      });

      // Update state with UV data (ensures UI has data to display)
      setUVIndex(data);
    } catch (error) {
      // If the network request fails, fall back to a deterministic mock so the UI still renders.
      logger.error('Failed to refresh UV', error as Error, 'WEATHER');
      const fallbackUV = weatherService.getFallbackUVIndex();
      setUVIndex(fallbackUV);
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
  const setLocation = useCallback((coords: Coordinates, details?: Partial<Location>) => {
    logger.info('Setting new location', 'WEATHER', { coords, details });
    setCurrentLocation(coords);
    setCurrentLocationDetails(prev => {
      if (details) {
        return {
          coordinates: coords,
          city: details.city,
          country: details.country,
          timezone: details.timezone ?? prev?.timezone,
        };
      }

      if (
        prev &&
        prev.coordinates.latitude === coords.latitude &&
        prev.coordinates.longitude === coords.longitude
      ) {
        return { ...prev, coordinates: coords };
      }

      return {
        coordinates: coords,
      };
    });
  }, []);

  // Auto-refresh when location changes - detect coordinate changes
  // Use ref to avoid dependency on refreshAll which causes excessive re-renders
  const refreshAllRef = useRef(refreshAll);
  refreshAllRef.current = refreshAll;

  useEffect(() => {
    if (currentLocation) {
      // Add small delay to prevent rapid successive calls
      const timeoutId = setTimeout(() => {
        void refreshAllRef.current();
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  // react-doctor-disable-next-line react-doctor/exhaustive-deps -- intentional dependency list — omitted values are stable refs/animation handles; listing them would re-run this single-trigger effect (verified)
  }, [currentLocation?.latitude, currentLocation?.longitude]);

  // Trigger alert evaluation when weather or UV data updates.
  // UV data MUST be passed for the UV alert rules ('current' field) to fire — without it
  // the High/Extreme UV alerts never trigger, defeating the core sunscreen-safety feature.
  useEffect(() => {
    // react-doctor-disable-next-line react-doctor/no-event-handler -- reactive sync effect (external data/state), not a user-event handler — verified intentional
    if (weatherData) {
      // Non-blocking; generates (and persists) messages if conditions are met.
      alertRuleEngine.evaluateRules({
        weather: weatherData,
        uvIndex: uvIndex ?? weatherData.uvIndex ?? undefined,
      }).catch(error => {
        logger.warn('Failed to evaluate alert rules', 'WEATHER', { error });
        // Don't throw - alert evaluation is not critical for weather display
      });
    }
  }, [weatherData, uvIndex]);

  const value: WeatherContextValue = {
    weatherData,
    forecast,
    uvIndex,
    currentLocation,
    currentLocationDetails,
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
  const context = use(WeatherContext);
  if (context === undefined) {
    throw new Error('useWeather must be used within a WeatherProvider');
  }
  return context;
}
