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

  // Secondary colors
  secondary: string;
  secondaryContainer: string;
  onSecondary: string;
  onSecondaryContainer: string;

  // Background colors
  background: string;
  backgroundElevated: string;
  backgroundSecondary: string;
  onBackground: string;

  // Surface colors
  surface: string;
  surfaceVariant: string;
  surfaceElevated1: string;
  surfaceElevated2: string;
  surfaceElevated3: string;
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
  tertiaryContainer: string;
  onTertiary: string;
  onTertiaryContainer: string;

  // Status colors
  success: string;
  successLight: string;
  successDark: string;
  successContainer: string;
  onSuccessContainer: string;
  warning: string;
  warningLight: string;
  warningDark: string;
  warningContainer: string;
  onWarningContainer: string;
  error: string;
  errorLight: string;
  errorDark: string;
  errorContainer: string;
  onErrorContainer: string;
  info: string;
  infoLight: string;
  infoDark: string;
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
  glassHighlight: string;
  surfaceTint: string;

  // Weather-adaptive gradients (stored as color values, used in LinearGradient)
  gradientSunnyStart: string;
  gradientSunnyEnd: string;
  gradientRainyStart: string;
  gradientRainyEnd: string;
  gradientCloudyStart: string;
  gradientCloudyEnd: string;
}

export interface Spacing {
  xxs: number;   // 4  - Tight spacing
  xs: number;    // 8  - Small gaps
  sm: number;    // 12 - Moderate gaps
  md: number;    // 16 - Default component padding
  lg: number;    // 24 - Section spacing
  xl: number;    // 32 - Screen padding, large gaps
  xxl: number;   // 48 - Hero sections
  xxxl: number;  // 64 - Maximum vertical spacing
}

export interface Typography {
  fontFamily: {
    regular: string;
    display: string;
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
    '6xl': number; // 60
    '7xl': number; // 72
  };
  lineHeight: {
    tight: number;   // 1.2 - Large headings
    snug: number;    // 1.375 - Medium headings
    normal: number;  // 1.5 - Body text
    relaxed: number; // 1.625 - Long-form
    loose: number;   // 1.75 - Maximum spacing
  };
  fontWeight: {
    thin: '100' | '200';
    extralight: '200' | '300';
    light: '300';
    regular: '400';
    medium: '500';
    semibold: '600';
    bold: '700';
    extrabold: '800';
    black: '900';
  };
  letterSpacing: {
    tightest: number; // -0.5 (large headings)
    tighter: number;  // -0.4 (medium headings)
    tight: number;    // -0.08 (body text)
    normal: number;   // 0 (small text)
    wide: number;     // 0.5 (all caps)
    wider: number;    // 1.0 (very wide)
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
