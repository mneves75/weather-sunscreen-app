import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Theme, ThemeMode, lightTheme, darkTheme } from '../types/theme';

interface ThemeContextType {
  theme: Theme;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  toggleTheme: () => Promise<void>;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

const THEME_STORAGE_KEY = '@WeatherSunscreen:themeMode';

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [systemColorScheme, setSystemColorScheme] = useState<ColorSchemeName>(
    Appearance.getColorScheme() ?? 'light',
  );

  // Determine current theme based on mode and system preference
  const getCurrentTheme = useCallback((mode: ThemeMode, systemScheme: ColorSchemeName): Theme => {
    if (mode === 'system') {
      return systemScheme === 'dark' ? darkTheme : lightTheme;
    }
    return mode === 'dark' ? darkTheme : lightTheme;
  }, []);

  const [theme, setTheme] = useState<Theme>(() => getCurrentTheme(themeMode, systemColorScheme));

  // Load saved theme preference on mount
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedMode = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedMode && ['light', 'dark', 'system'].includes(savedMode)) {
          const mode = savedMode as ThemeMode;
          setThemeModeState(mode);
          setTheme(getCurrentTheme(mode, systemColorScheme));
        }
      } catch (error) {
        console.error('Failed to load theme preference:', error);
        // Continue with default 'system' mode
      }
    };

    loadThemePreference();
  }, [getCurrentTheme, systemColorScheme]);

  // Listen for system theme changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      const safeColorScheme = colorScheme ?? 'light';
      setSystemColorScheme(safeColorScheme);
      setTheme(getCurrentTheme(themeMode, safeColorScheme));
    });

    return () => subscription?.remove();
  }, [getCurrentTheme, themeMode]);

  // Update theme when theme mode changes
  useEffect(() => {
    setTheme(getCurrentTheme(themeMode, systemColorScheme));
  }, [getCurrentTheme, themeMode, systemColorScheme]);

  const setThemeMode = useCallback(async (mode: ThemeMode) => {
    try {
      setThemeModeState(mode);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  }, []);

  const toggleTheme = useCallback(async () => {
    // Cycle through: light -> dark -> system
    const nextMode: ThemeMode =
      themeMode === 'light' ? 'dark' : themeMode === 'dark' ? 'system' : 'light';

    await setThemeMode(nextMode);
  }, [themeMode, setThemeMode]);

  const isDark = theme === darkTheme;

  const contextValue: ThemeContextType = useMemo(
    () => ({
      theme,
      themeMode,
      setThemeMode,
      toggleTheme,
      isDark,
    }),
    [theme, themeMode, setThemeMode, toggleTheme, isDark],
  );

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Helper hook for easy color access
export function useColors() {
  const { theme } = useTheme();
  return theme.colors;
}
