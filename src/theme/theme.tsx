/**
 * Theme system with context provider, hooks, and AsyncStorage persistence
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useColorScheme as useNativeColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeMode, ColorScheme, ThemeContextValue, Theme } from '@/src/types/theme';
import { getThemeTokens } from './tokens';

const STORAGE_KEY = '@WeatherSunscreen:themeMode';
const HIGH_CONTRAST_KEY = '@WeatherSunscreen:highContrast';

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const systemColorScheme = useNativeColorScheme() ?? 'light';
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [highContrast, setHighContrastState] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load persisted theme preference on mount
  useEffect(() => {
    async function loadThemePreference() {
      try {
        const [savedThemeMode, savedHighContrast] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY),
          AsyncStorage.getItem(HIGH_CONTRAST_KEY),
        ]);

        if (savedThemeMode && ['light', 'dark', 'system'].includes(savedThemeMode)) {
          setThemeModeState(savedThemeMode as ThemeMode);
        }

        if (savedHighContrast !== null) {
          setHighContrastState(savedHighContrast === 'true');
        }
      } catch (error) {
        console.error('Failed to load theme preference:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadThemePreference();
  }, []);

  // Compute actual color scheme based on mode
  const scheme: ColorScheme = useMemo(() => {
    if (themeMode === 'system') {
      return systemColorScheme;
    }
    return themeMode;
  }, [themeMode, systemColorScheme]);

  const isDark = scheme === 'dark';

  // Get theme tokens based on scheme and high contrast
  const themeTokens = useMemo(() => {
    return getThemeTokens(scheme, highContrast);
  }, [scheme, highContrast]);

  // Create full theme object
  const theme: Theme = useMemo(() => ({
    mode: themeMode,
    scheme,
    isDark,
    highContrast,
    tokens: themeTokens,
  }), [themeMode, scheme, isDark, highContrast, themeTokens]);

  // Set theme mode with persistence
  const setThemeMode = useCallback(async (mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, mode);
    } catch (error) {
      console.error('Failed to save theme mode:', error);
    }
  }, []);

  // Toggle between light and dark
  const toggleTheme = useCallback(async () => {
    const newMode: ThemeMode = scheme === 'light' ? 'dark' : 'light';
    await setThemeMode(newMode);
  }, [scheme, setThemeMode]);

  // Set high contrast with persistence
  const setHighContrast = useCallback(async (enabled: boolean) => {
    setHighContrastState(enabled);
    try {
      await AsyncStorage.setItem(HIGH_CONTRAST_KEY, enabled.toString());
    } catch (error) {
      console.error('Failed to save high contrast preference:', error);
    }
  }, []);

  const value: ThemeContextValue = useMemo(() => ({
    themeMode,
    setThemeMode,
    toggleTheme,
    scheme,
    isDark,
    highContrast,
    setHighContrast,
    colors: themeTokens.colors,
    theme,
  }), [
    themeMode,
    setThemeMode,
    toggleTheme,
    scheme,
    isDark,
    highContrast,
    setHighContrast,
    themeTokens.colors,
    theme,
  ]);

  // Don't render until theme is loaded from storage
  if (isLoading) {
    return null;
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook to access full theme context
 * @returns Theme context with mode, colors, and utility functions
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

/**
 * Convenience hook to access only colors
 * @returns Current theme colors
 */
export function useColors() {
  const { colors } = useTheme();
  return colors;
}

/**
 * Hook to access theme tokens (spacing, typography, etc.)
 */
export function useThemeTokens() {
  const { theme } = useTheme();
  return theme.tokens;
}
