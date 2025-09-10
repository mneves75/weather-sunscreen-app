export type ThemeMode = 'light' | 'dark' | 'system';

export interface ColorScheme {
  // Background colors
  background: string;
  surface: string;
  surfaceVariant: string;

  // Text colors
  primary: string;
  secondary: string;
  tertiary: string;
  onBackground: string;
  onSurface: string;
  onSurfaceVariant: string;

  // Weather-specific colors
  temperature: string;
  temperatureSecondary: string;

  // Status colors
  success: string;
  warning: string;
  error: string;
  info: string;

  // Interactive elements
  card: string;
  cardBorder: string;
  input: string;
  inputBorder: string;

  // UV Index colors remain consistent across themes
  uvLow: string;
  uvModerate: string;
  uvHigh: string;
  uvVeryHigh: string;
  uvExtreme: string;
}

export interface Theme {
  mode: ThemeMode;
  colors: ColorScheme;
}

// Light theme color scheme
export const lightColors: ColorScheme = {
  // Background colors
  background: '#F8F9FA',
  surface: '#FFFFFF',
  surfaceVariant: '#F1F3F4',

  // Text colors
  primary: '#2C3E50',
  secondary: '#7F8C8D',
  tertiary: '#95A5A6',
  onBackground: '#2C3E50',
  onSurface: '#2C3E50',
  onSurfaceVariant: '#7F8C8D',

  // Weather-specific colors
  temperature: '#4A90E2',
  temperatureSecondary: '#34495E',

  // Status colors
  success: '#27AE60',
  warning: '#F39C12',
  error: '#E74C3C',
  info: '#3498DB',

  // Interactive elements
  card: '#FFFFFF',
  cardBorder: '#E8F4FD',
  input: '#FFFFFF',
  inputBorder: '#BDC3C7',

  // UV Index colors (consistent across themes)
  uvLow: '#289D00',
  uvModerate: '#F7D908',
  uvHigh: '#F85D00',
  uvVeryHigh: '#E90B00',
  uvExtreme: '#B33DAD',
};

// Dark theme color scheme
export const darkColors: ColorScheme = {
  // Background colors
  background: '#0D1117',
  surface: '#161B22',
  surfaceVariant: '#21262D',

  // Text colors
  primary: '#F0F6FC',
  secondary: '#8B949E',
  tertiary: '#6E7681',
  onBackground: '#F0F6FC',
  onSurface: '#F0F6FC',
  onSurfaceVariant: '#8B949E',

  // Weather-specific colors
  temperature: '#58A6FF',
  temperatureSecondary: '#7D8590',

  // Status colors
  success: '#2EA043',
  warning: '#FB8500',
  error: '#F85149',
  info: '#1F6FEB',

  // Interactive elements
  card: '#161B22',
  cardBorder: '#30363D',
  input: '#21262D',
  inputBorder: '#30363D',

  // UV Index colors (consistent across themes)
  uvLow: '#289D00',
  uvModerate: '#F7D908',
  uvHigh: '#F85D00',
  uvVeryHigh: '#E90B00',
  uvExtreme: '#B33DAD',
};

export const lightTheme: Theme = {
  mode: 'light',
  colors: lightColors,
};

export const darkTheme: Theme = {
  mode: 'dark',
  colors: darkColors,
};
