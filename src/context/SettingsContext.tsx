/**
 * Settings context for user preferences
 */

import React, { createContext, use, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserPreferences, SkinType } from '@/src/types';
import { logger } from '@/src/services/LoggerService';

const SETTINGS_STORAGE_KEY = '@WeatherSunscreen:settings';

const DEFAULT_PREFERENCES: UserPreferences = {
  skinType: 'medium',
  temperatureUnit: 'celsius',
  speedUnit: 'kmh',
  pressureUnit: 'hPa',
  notificationsEnabled: false,
  uvAlerts: false,
  weatherAlerts: false,
  locale: 'en',
  timeFormat: 'system',
};

interface SettingsContextValue {
  preferences: UserPreferences;
  updatePreference: <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => Promise<void>;
  resetPreferences: () => Promise<void>;
  isLoading: boolean;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

interface SettingsProviderProps {
  children: React.ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [isLoading, setIsLoading] = useState(true);

  // Load preferences from storage
  useEffect(() => {
    async function loadPreferences() {
      try {
        const stored = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as UserPreferences;
          setPreferences({ ...DEFAULT_PREFERENCES, ...parsed });
          logger.info('Loaded user preferences', 'SETTINGS');
        }
      } catch (error) {
        logger.error('Failed to load preferences', error as Error, 'SETTINGS');
      } finally {
        setIsLoading(false);
      }
    }

    // react-doctor-disable-next-line react-doctor/no-initialize-state -- AsyncStorage-hydrated state — async load has no synchronous snapshot for useState/useSyncExternalStore
    loadPreferences();
  }, []);

  // Save preferences to storage
  const savePreferences = useCallback(async (prefs: UserPreferences) => {
    try {
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(prefs));
      logger.info('Saved user preferences', 'SETTINGS');
    } catch (error) {
      logger.error('Failed to save preferences', error as Error, 'SETTINGS');
      throw error;
    }
  }, []);

  // Update a single preference
  const updatePreference = useCallback(async <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    // Compute from the current preferences (in deps) rather than reading a value written
    // inside the setState updater — that relied on the updater running synchronously,
    // which React does not guarantee under concurrent rendering.
    const updated = { ...preferences, [key]: value };
    setPreferences(updated);
    await savePreferences(updated);
    logger.info(`Updated preference: ${key}`, 'SETTINGS', { [key]: value });
  }, [preferences, savePreferences]);

  // Reset to defaults
  const resetPreferences = useCallback(async () => {
    setPreferences(DEFAULT_PREFERENCES);
    await savePreferences(DEFAULT_PREFERENCES);
    logger.info('Reset preferences to defaults', 'SETTINGS');
  }, [savePreferences]);

  const value: SettingsContextValue = {
    preferences,
    updatePreference,
    resetPreferences,
    isLoading,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

/**
 * Hook to access settings context
 */
export function useSettings(): SettingsContextValue {
  const context = use(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
