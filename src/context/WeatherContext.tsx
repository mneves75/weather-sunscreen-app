import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { WeatherData, Location } from '../types/weather';
import { WeatherService } from '../services/weatherService';

interface WeatherState {
  weatherData: WeatherData | null;
  currentLocation: Location | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

interface WeatherContextType extends WeatherState {
  loadWeatherData: (location?: Location) => Promise<void>;
  updateLocation: (location: Location) => Promise<void>;
  refreshWeatherData: () => Promise<void>;
  clearError: () => void;
}

const WeatherContext = createContext<WeatherContextType | undefined>(undefined);

interface WeatherProviderProps {
  children: ReactNode;
}

export function WeatherProvider({ children }: WeatherProviderProps) {
  const [state, setState] = useState<WeatherState>({
    weatherData: null,
    currentLocation: null,
    isLoading: false,
    error: null,
    lastUpdated: null,
  });

  const loadWeatherData = useCallback(async (_location?: Location) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      // Use the weather service to get comprehensive data
      const weatherData = await WeatherService.getCurrentWeatherData();

      setState((prev) => ({
        ...prev,
        weatherData,
        currentLocation: weatherData?.location
          ? {
              latitude: weatherData.location.lat,
              longitude: weatherData.location.lon,
            }
          : prev.currentLocation,
        isLoading: false,
        lastUpdated: new Date(),
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load weather data',
      }));
    }
  }, []);

  const updateLocation = useCallback(
    async (newLocation: Location) => {
      setState((prev) => ({ ...prev, currentLocation: newLocation }));
      await loadWeatherData(newLocation);
    },
    [loadWeatherData],
  );

  const refreshWeatherData = useCallback(async () => {
    await loadWeatherData();
  }, [loadWeatherData]);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const contextValue: WeatherContextType = {
    ...state,
    loadWeatherData,
    updateLocation,
    refreshWeatherData,
    clearError,
  };

  return <WeatherContext.Provider value={contextValue}>{children}</WeatherContext.Provider>;
}

export function useWeather(): WeatherContextType {
  const context = useContext(WeatherContext);
  if (!context) {
    throw new Error('useWeather must be used within a WeatherProvider');
  }
  return context;
}
