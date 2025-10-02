/**
 * Design tokens - Single source of truth for all design values
 */

import { BorderRadius, Shadow, Spacing, ThemeColors, ThemeTokens, Typography } from '@/src/types/theme';

// Color palettes
const lightColors: ThemeColors = {
  // Primary colors
  primary: '#2563EB',      // Blue 600
  primaryDark: '#1E40AF',  // Blue 700
  primaryLight: '#3B82F6', // Blue 500
  primaryContainer: '#DBEAFE', // Blue 100
  onPrimary: '#FFFFFF',
  onPrimaryContainer: '#1E3A8A', // Blue 900

  // Background colors
  background: '#FFFFFF',
  backgroundElevated: '#F9FAFB',
  backgroundSecondary: '#F3F4F6',
  onBackground: '#111827',

  // Surface colors
  surface: '#FFFFFF',
  surfaceVariant: '#E5E7EB',
  onSurface: '#111827',
  onSurfaceVariant: '#6B7280',

  // Text colors
  text: '#111827',           // Gray 900
  textSecondary: '#6B7280',  // Gray 500
  textTertiary: '#9CA3AF',   // Gray 400
  textInverse: '#FFFFFF',

  // Accent colors
  accent: '#8B5CF6',         // Purple 500
  accentSecondary: '#EC4899', // Pink 500
  tertiary: '#06B6D4',       // Cyan 500

  // Status colors
  success: '#10B981',  // Green 500
  warning: '#F59E0B',  // Amber 500
  error: '#EF4444',    // Red 500
  errorContainer: '#FEE2E2', // Red 100
  onErrorContainer: '#991B1B', // Red 800
  info: '#3B82F6',     // Blue 500
  infoContainer: '#DBEAFE', // Blue 100
  onInfoContainer: '#1E3A8A', // Blue 900

  // UV level colors
  uvLow: '#10B981',       // Green 500 (0-2)
  uvModerate: '#F59E0B',  // Amber 500 (3-5)
  uvHigh: '#F97316',      // Orange 500 (6-7)
  uvVeryHigh: '#EF4444',  // Red 500 (8-10)
  uvExtreme: '#9333EA',   // Purple 600 (11+)

  // Border and divider
  border: '#E5E7EB',    // Gray 200
  divider: '#E5E7EB',   // Gray 200
  outline: '#D1D5DB',   // Gray 300
  outlineVariant: '#E5E7EB', // Gray 200

  // Tab bar
  tabBarBackground: '#FFFFFF',
  tabBarActive: '#2563EB',
  tabBarInactive: '#9CA3AF',

  // Glass effect colors (for fallback)
  glassBackground: 'rgba(255, 255, 255, 0.7)',
  glassBorder: 'rgba(255, 255, 255, 0.18)',
  surfaceTint: 'rgba(37, 99, 235, 0.1)', // Primary with 10% opacity
};

const darkColors: ThemeColors = {
  // Primary colors
  primary: '#3B82F6',      // Blue 500
  primaryDark: '#2563EB',  // Blue 600
  primaryLight: '#60A5FA', // Blue 400
  primaryContainer: '#1E3A8A', // Blue 900
  onPrimary: '#FFFFFF',
  onPrimaryContainer: '#DBEAFE', // Blue 100

  // Background colors
  background: '#111827',         // Gray 900
  backgroundElevated: '#1F2937', // Gray 800
  backgroundSecondary: '#374151', // Gray 700
  onBackground: '#F9FAFB',

  // Surface colors
  surface: '#1F2937',      // Gray 800
  surfaceVariant: '#374151', // Gray 700
  onSurface: '#F9FAFB',
  onSurfaceVariant: '#9CA3AF',

  // Text colors
  text: '#F9FAFB',           // Gray 50
  textSecondary: '#9CA3AF',  // Gray 400
  textTertiary: '#6B7280',   // Gray 500
  textInverse: '#111827',    // Gray 900

  // Accent colors
  accent: '#A78BFA',         // Purple 400
  accentSecondary: '#F472B6', // Pink 400
  tertiary: '#22D3EE',       // Cyan 400

  // Status colors
  success: '#34D399',  // Green 400
  warning: '#FBBF24',  // Amber 400
  error: '#F87171',    // Red 400
  errorContainer: '#7F1D1D', // Red 900
  onErrorContainer: '#FEE2E2', // Red 100
  info: '#60A5FA',     // Blue 400
  infoContainer: '#1E3A8A', // Blue 900
  onInfoContainer: '#DBEAFE', // Blue 100

  // UV level colors
  uvLow: '#34D399',      // Green 400 (0-2)
  uvModerate: '#FBBF24', // Amber 400 (3-5)
  uvHigh: '#FB923C',     // Orange 400 (6-7)
  uvVeryHigh: '#F87171', // Red 400 (8-10)
  uvExtreme: '#A855F7',  // Purple 500 (11+)

  // Border and divider
  border: '#374151',   // Gray 700
  divider: '#374151',  // Gray 700
  outline: '#4B5563',  // Gray 600
  outlineVariant: '#374151', // Gray 700

  // Tab bar
  tabBarBackground: '#1F2937',
  tabBarActive: '#3B82F6',
  tabBarInactive: '#6B7280',

  // Glass effect colors (for fallback)
  glassBackground: 'rgba(31, 41, 55, 0.7)',
  glassBorder: 'rgba(255, 255, 255, 0.1)',
  surfaceTint: 'rgba(59, 130, 246, 0.1)', // Primary with 10% opacity
};

const highContrastLightColors: ThemeColors = {
  ...lightColors,
  text: '#000000',
  textSecondary: '#4B5563',
  border: '#D1D5DB',
  divider: '#D1D5DB',
};

const highContrastDarkColors: ThemeColors = {
  ...darkColors,
  text: '#FFFFFF',
  textSecondary: '#D1D5DB',
  border: '#4B5563',
  divider: '#4B5563',
};

// Spacing scale (4px base grid)
const spacing: Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

// Typography scale
const typography: Typography = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
    mono: 'SpaceMono',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

// Border radius scale
const borderRadius: BorderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
};

// Shadow definitions (works for both iOS and Android)
const shadow: Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};

// Export token collections
export const tokens = {
  colors: {
    light: lightColors,
    dark: darkColors,
    lightHighContrast: highContrastLightColors,
    darkHighContrast: highContrastDarkColors,
  },
  spacing,
  typography,
  borderRadius,
  shadow,
};

// Helper function to get theme tokens
export function getThemeTokens(
  scheme: 'light' | 'dark',
  highContrast: boolean = false
): ThemeTokens {
  let colors: ThemeColors;

  if (highContrast) {
    colors = scheme === 'light' ? highContrastLightColors : highContrastDarkColors;
  } else {
    colors = scheme === 'light' ? lightColors : darkColors;
  }

  return {
    colors,
    spacing,
    typography,
    borderRadius,
    shadow,
  };
}
