/**
 * Sunscreen Context
 * Manages sunscreen application state, persistence, and notifications
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { logger } from '../services/LoggerService';
import { SunscreenTrackerService } from '../services/SunscreenTrackerService';
import { SunscreenApplication, SunscreenState } from '../types/sunscreen';
import { useWeather } from './WeatherContext';

const STORAGE_KEY = '@sunscreen_application';

interface SunscreenContextValue extends SunscreenState {
  applySunscreen: (isSwimming?: boolean) => Promise<void>;
  clearApplication: () => Promise<void>;
  toggleSwimmingMode: () => void;
  timeRemaining: number;
  timeRemainingFormatted: string;
  isLoading: boolean;
}

const SunscreenContext = createContext<SunscreenContextValue | undefined>(undefined);

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const SunscreenProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { weatherData } = useWeather();
  const [state, setState] = useState<SunscreenState>({
    currentApplication: null,
    alertActive: false,
    isSwimming: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  // Load persisted state on mount
  useEffect(() => {
    loadPersistedState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Request notification permissions on mount
  useEffect(() => {
    requestNotificationPermissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update time remaining every minute
  useEffect(() => {
    if (state.currentApplication) {
      updateTimeRemaining();
      intervalRef.current = setInterval(updateTimeRemaining, 60000); // Every minute

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [state.currentApplication]);

  // Check if reapplication is needed
  useEffect(() => {
    if (state.currentApplication && !state.alertActive) {
      const isNeeded = SunscreenTrackerService.isReapplicationNeeded(
        state.currentApplication.appliedAt,
        state.currentApplication.reapplyAt
      );

      if (isNeeded) {
        triggerReapplicationAlert();
      }
    }
  }, [timeRemaining, state.currentApplication, state.alertActive]);

  const loadPersistedState = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: SunscreenState = JSON.parse(stored);
        setState(parsed);
        logger.info('Loaded persisted sunscreen state', 'SUNSCREEN', { parsed });
      }
    } catch (error) {
      logger.error('Failed to load persisted state', error as Error, 'SUNSCREEN');
    } finally {
      setIsLoading(false);
    }
  };

  const persistState = async (newState: SunscreenState) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      logger.info('Persisted sunscreen state', 'SUNSCREEN');
    } catch (error) {
      logger.error('Failed to persist state', error as Error, 'SUNSCREEN');
    }
  };

  const requestNotificationPermissions = async () => {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        logger.warn('Notification permissions not granted', 'SUNSCREEN');
      }
    } catch (error) {
      logger.error('Failed to request notification permissions', error as Error, 'SUNSCREEN');
    }
  };

  const updateTimeRemaining = () => {
    if (state.currentApplication) {
      const remaining = SunscreenTrackerService.getTimeRemaining(
        state.currentApplication.reapplyAt
      );
      setTimeRemaining(remaining);
    } else {
      setTimeRemaining(0);
    }
  };

  const scheduleNotification = async (reapplyAt: number) => {
    try {
      // Cancel any existing notifications
      await Notifications.cancelAllScheduledNotificationsAsync();

      // Schedule new notification      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '☀️ Sunscreen Reapplication',
          body: "It's time to reapply your sunscreen for continued protection!",
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: { 
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: new Date(reapplyAt) 
        },
      });

      logger.info('Scheduled reapplication notification', 'SUNSCREEN', { reapplyAt });
    } catch (error) {
      logger.error('Failed to schedule notification', error as Error, 'SUNSCREEN');
    }
  };

  const triggerReapplicationAlert = () => {
    setState((prev) => {
      const newState = { ...prev, alertActive: true };
      persistState(newState);
      return newState;
    });
    logger.info('Reapplication alert activated', 'SUNSCREEN');
  };

  const applySunscreen = useCallback(
    async (isSwimming = false) => {
      if (!weatherData) {
        logger.warn('Cannot apply sunscreen without weather data', 'SUNSCREEN');
        return;
      }

      try {
        const now = Date.now();

        // Calculate reapplication time
        const calculation = SunscreenTrackerService.calculateReapplicationTime({
          uvIndex: weatherData.uvIndex?.value || 0,
          temperature: weatherData.current.temperature,
          humidity: weatherData.current.humidity,
          cloudCover: weatherData.current.cloudCover || 0,
          isSwimming,
        });

        const reapplyAt = now + calculation.minutes * 60000;

        const application: SunscreenApplication = {
          appliedAt: now,
          uvIndex: weatherData.uvIndex?.value || 0,
          temperature: weatherData.current.temperature,
          humidity: weatherData.current.humidity,
          cloudCover: weatherData.current.cloudCover || 0,
          reapplicationMinutes: calculation.minutes,
          reapplyAt,
        };

        const newState: SunscreenState = {
          currentApplication: application,
          alertActive: false,
          isSwimming,
        };

        setState(newState);
        await persistState(newState);
        await scheduleNotification(reapplyAt);

        logger.info('Sunscreen applied', 'SUNSCREEN', { application, calculation });
      } catch (error) {
        logger.error('Failed to apply sunscreen', error as Error, 'SUNSCREEN');
        throw error;
      }
    },
    [weatherData]
  );

  const clearApplication = useCallback(async () => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();

      const newState: SunscreenState = {
        currentApplication: null,
        alertActive: false,
        isSwimming: false,
      };

      setState(newState);
      await persistState(newState);
      setTimeRemaining(0);

      logger.info('Sunscreen application cleared', 'SUNSCREEN');
    } catch (error) {
      logger.error('Failed to clear application', error as Error, 'SUNSCREEN');
      throw error;
    }
  }, []);

  const toggleSwimmingMode = useCallback(() => {
    setState((prev) => {
      const newState = { ...prev, isSwimming: !prev.isSwimming };
      persistState(newState);
      return newState;
    });
  }, []);

  const timeRemainingFormatted = SunscreenTrackerService.formatTimeRemaining(timeRemaining);

  const value: SunscreenContextValue = {
    ...state,
    applySunscreen,
    clearApplication,
    toggleSwimmingMode,
    timeRemaining,
    timeRemainingFormatted,
    isLoading,
  };

  return <SunscreenContext.Provider value={value}>{children}</SunscreenContext.Provider>;
};

export const useSunscreen = (): SunscreenContextValue => {
  const context = useContext(SunscreenContext);
  if (!context) {
    throw new Error('useSunscreen must be used within SunscreenProvider');
  }
  return context;
};

