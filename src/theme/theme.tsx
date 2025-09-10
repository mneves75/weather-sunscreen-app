import React, { createContext, useContext, useMemo, useState } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import { tokens } from './tokens';

type Scheme = 'light' | 'dark';

type ThemeContextType = {
  scheme: Scheme;
  colors: typeof tokens.light.colors;
  setScheme: (s: Scheme) => void;
  highContrast: boolean;
  setHighContrast: (v: boolean) => void;
};

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const sys = (Appearance.getColorScheme() as ColorSchemeName) || 'light';
  const [scheme, setScheme] = useState<Scheme>(sys === 'dark' ? 'dark' : 'light');
  const [highContrast, setHighContrast] = useState(false);

  const value = useMemo<ThemeContextType>(() => {
    const palette = tokens[scheme];
    type Colors = typeof tokens.light.colors;
    const base: Colors = palette.colors as Colors;
    const colors: Colors = (
      highContrast ? { ...base, primary: '#000', surface: '#fff' } : base
    ) as Colors;
    return { scheme, setScheme, highContrast, setHighContrast, colors };
  }, [scheme, highContrast]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}
