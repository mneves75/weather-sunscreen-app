import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import { storageService } from '../services/storageService';
import { logger } from '../services/loggerService';
import { tokens } from './tokens';

type Scheme = 'light' | 'dark';
type ThemeMode = 'system' | 'light' | 'dark';

type ThemeContextType = {
  // Effective scheme currently applied to tokens
  scheme: Scheme;
  // Persisted user preference (or 'system')
  themeMode: ThemeMode;
  setThemeMode: (m: ThemeMode) => void;
  toggleTheme: () => void;
  setScheme: (s: Scheme) => void;
  isDark: boolean;
  highContrast: boolean;
  setHighContrast: (v: boolean) => void;
  colors: { [K in keyof typeof tokens.light.colors]: string };
};

const ThemeContext = createContext<ThemeContextType | null>(null);
const STORAGE_KEYS = {
  mode: '@WeatherSunscreen:themeMode',
  highContrast: '@WeatherSunscreen:themeHighContrast',
} as const;

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = (Appearance.getColorScheme() as ColorSchemeName) || 'light';
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [systemScheme, setSystemScheme] = useState<Scheme>(system === 'dark' ? 'dark' : 'light');
  const [scheme, setSchemeState] = useState<Scheme>(systemScheme);
  const [highContrast, setHighContrastState] = useState(false);

  // Load saved mode on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const saved = await storageService.getItem(STORAGE_KEYS.mode);
        if (!cancelled && (saved === 'light' || saved === 'dark' || saved === 'system')) {
          setThemeModeState(saved as ThemeMode);
          setSchemeState(saved === 'system' ? systemScheme : (saved as Scheme));
        }
      } catch (error) {
        logger.warn('Failed to restore theme mode from storage', {
          error: error instanceof Error ? error.message : String(error),
        });
      }

      try {
        const savedContrast = await storageService.getBoolean(STORAGE_KEYS.highContrast, false);
        if (!cancelled) {
          setHighContrastState(savedContrast);
        }
      } catch (error) {
        logger.warn('Failed to restore high contrast preference from storage', {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [systemScheme]);

  // React to system changes when in 'system' mode
  useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      const sys = (colorScheme ?? 'light') === 'dark' ? 'dark' : 'light';
      setSystemScheme(sys);
      if (themeMode === 'system') setSchemeState(sys);
    });
    return () => sub.remove();
  }, [themeMode]);

  const persistThemeMode = (mode: ThemeMode) => {
    void storageService.setItem(STORAGE_KEYS.mode, mode).catch((error) => {
      logger.warn('Failed to persist theme mode', {
        error: error instanceof Error ? error.message : String(error),
      });
    });
  };

  const persistHighContrast = (value: boolean) => {
    void storageService.setBoolean(STORAGE_KEYS.highContrast, value).catch((error) => {
      logger.warn('Failed to persist high contrast preference', {
        error: error instanceof Error ? error.message : String(error),
      });
    });
  };

  const setThemeMode = (m: ThemeMode) => {
    setThemeModeState(m);
    setSchemeState(m === 'system' ? systemScheme : (m as Scheme));
    persistThemeMode(m);
  };

  const setScheme = (s: Scheme) => {
    setThemeMode(s);
  };

  const toggleTheme = () => {
    const next: ThemeMode =
      themeMode === 'light' ? 'dark' : themeMode === 'dark' ? 'system' : 'light';
    setThemeMode(next);
  };

  type Colors = { [K in keyof typeof tokens.light.colors]: string };
  const colors: Colors = useMemo(() => {
    const base = tokens[scheme].colors as Colors;
    return highContrast ? { ...base, primary: '#000', surface: '#fff' } : base;
  }, [scheme, highContrast]) as Colors;

  const setHighContrast = (value: boolean) => {
    setHighContrastState(value);
    persistHighContrast(value);
  };

  const value: ThemeContextType = {
    scheme,
    themeMode,
    setThemeMode,
    toggleTheme,
    setScheme,
    isDark: scheme === 'dark',
    highContrast,
    setHighContrast,
    colors,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextType {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}

export function useColors() {
  return useTheme().colors;
}
