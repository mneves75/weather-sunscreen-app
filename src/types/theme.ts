/**
 * Theme-related TypeScript type definitions
 */

export type ThemeMode = 'light' | 'dark' | 'system';
export type ColorScheme = 'light' | 'dark';

export interface ThemeColors {
  // Primary colors
  primary: string;
  primaryDark: string;
  primaryLight: string;
  primaryContainer: string;
  onPrimary: string;
  onPrimaryContainer: string;

  // Background colors
  background: string;
  backgroundElevated: string;
  backgroundSecondary: string;
  onBackground: string;

  // Surface colors
  surface: string;
  surfaceVariant: string;
  onSurface: string;
  onSurfaceVariant: string;

  // Text colors
  text: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;

  // Accent colors
  accent: string;
  accentSecondary: string;
  tertiary: string;

  // Status colors
  success: string;
  warning: string;
  error: string;
  errorContainer: string;
  onErrorContainer: string;
  info: string;
  infoContainer: string;
  onInfoContainer: string;

  // UV level colors
  uvLow: string;
  uvModerate: string;
  uvHigh: string;
  uvVeryHigh: string;
  uvExtreme: string;

  // Border and divider
  border: string;
  divider: string;
  outline: string;
  outlineVariant: string;

  // Tab bar
  tabBarBackground: string;
  tabBarActive: string;
  tabBarInactive: string;

  // Glass effect colors (for fallback)
  glassBackground: string;
  glassBorder: string;
}

export interface Spacing {
  xs: number;    // 4
  sm: number;    // 8
  md: number;    // 16
  lg: number;    // 24
  xl: number;    // 32
  xxl: number;   // 48
  xxxl: number;  // 64
}

export interface Typography {
  fontFamily: {
    regular: string;
    medium: string;
    semibold: string;
    bold: string;
    mono: string;
  };
  fontSize: {
    xs: number;    // 12
    sm: number;    // 14
    base: number;  // 16
    lg: number;    // 18
    xl: number;    // 20
    '2xl': number; // 24
    '3xl': number; // 30
    '4xl': number; // 36
    '5xl': number; // 48
  };
  lineHeight: {
    tight: number;   // 1.2
    normal: number;  // 1.5
    relaxed: number; // 1.75
  };
}

export interface BorderRadius {
  none: number;   // 0
  sm: number;     // 4
  md: number;     // 8
  lg: number;     // 12
  xl: number;     // 16
  '2xl': number;  // 24
  full: number;   // 9999
}

export interface Shadow {
  sm: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
  md: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
  lg: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
  xl: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
}

export interface ThemeTokens {
  colors: ThemeColors;
  spacing: Spacing;
  typography: Typography;
  borderRadius: BorderRadius;
  shadow: Shadow;
}

export interface Theme {
  mode: ThemeMode;
  scheme: ColorScheme;
  isDark: boolean;
  highContrast: boolean;
  tokens: ThemeTokens;
}

export interface ThemeContextValue {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  scheme: ColorScheme;
  isDark: boolean;
  highContrast: boolean;
  setHighContrast: (enabled: boolean) => void;
  colors: ThemeColors;
  theme: Theme;
}
