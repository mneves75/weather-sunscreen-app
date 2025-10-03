/**
 * Design tokens - Single source of truth for all design values
 */

import { Platform } from 'react-native';
import { BorderRadius, Shadow, Spacing, ThemeColors, ThemeTokens, Typography } from '@/src/types/theme';

// Color palettes - Premium design system (Apple Weather inspired)
const lightColors: ThemeColors = {
  // Primary colors - Electric Blue (Apple system blue, premium accent)
  primary: '#007AFF',        // Apple Blue
  primaryDark: '#0051D5',
  primaryLight: '#4DA2FF',
  primaryContainer: '#E5F2FF',
  onPrimary: '#FFFFFF',
  onPrimaryContainer: '#003D99',

  // Secondary colors - Fresh Green (complementary accent)
  secondary: '#30D158',       // Apple Green
  secondaryContainer: '#E5F9EC',
  onSecondary: '#FFFFFF',
  onSecondaryContainer: '#0D8A2E',

  // Background colors
  background: '#FFFFFF',
  backgroundElevated: '#F9F9F9',
  backgroundSecondary: '#F2F2F7',    // Apple light gray
  onBackground: '#000000',

  // Surface colors - Apple-style subtle elevations
  surface: '#FFFFFF',
  surfaceVariant: '#F2F2F7',         // Apple light gray
  surfaceElevated1: '#FAFAFA',
  surfaceElevated2: '#F5F5F5',
  surfaceElevated3: '#F0F0F0',
  onSurface: '#000000',
  onSurfaceVariant: '#3C3C43',       // Apple secondary label (60% opacity equivalent)

  // Text colors - Apple-style hierarchy
  text: '#000000',                   // Pure black
  textSecondary: '#3C3C43',          // 60% opacity gray
  textTertiary: '#8E8E93',           // 30% opacity gray
  textInverse: '#FFFFFF',

  // Accent colors - Simplified (single primary focus)
  accent: '#5E5CE6',             // Apple Purple (secondary accent only)
  accentSecondary: '#FF375F',    // Apple Pink
  tertiary: '#64D2FF',           // Apple Light Blue
  tertiaryContainer: '#E5F6FF',
  onTertiary: '#000000',
  onTertiaryContainer: '#003D5C',

  // Status colors - Apple system colors
  success: '#30D158',            // Apple Green
  successLight: '#6EE7B7',
  successDark: '#0D8A2E',
  successContainer: '#E5F9EC',
  onSuccessContainer: '#0D8A2E',

  warning: '#FFD60A',            // Apple Yellow
  warningLight: '#FFE566',
  warningDark: '#CC9F00',
  warningContainer: '#FFF9E5',
  onWarningContainer: '#8C6600',

  error: '#FF453A',              // Apple Red
  errorLight: '#FF6961',
  errorDark: '#D70015',
  errorContainer: '#FFE5E5',
  onErrorContainer: '#990011',

  info: '#64D2FF',               // Apple Light Blue
  infoLight: '#8FDDFF',
  infoDark: '#0099D6',
  infoContainer: '#E5F6FF',
  onInfoContainer: '#006699',

  // UV level colors - Apple system colors
  uvLow: '#30D158',              // Apple Green (0-2)
  uvModerate: '#FFD60A',         // Apple Yellow (3-5)
  uvHigh: '#FF9F0A',             // Apple Orange (6-7)
  uvVeryHigh: '#FF453A',         // Apple Red (8-10)
  uvExtreme: '#BF5AF2',          // Apple Purple (11+)

  // Border and divider - Subtle
  border: '#E5E5EA',             // Apple separator light
  divider: '#E5E5EA',
  outline: '#D1D1D6',
  outlineVariant: '#E5E5EA',

  // Tab bar
  tabBarBackground: '#F9F9F9',
  tabBarActive: '#007AFF',       // Apple Blue
  tabBarInactive: '#8E8E93',

  // Glass effect colors - Premium light glass
  glassBackground: 'rgba(255, 255, 255, 0.72)',
  glassBorder: 'rgba(0, 0, 0, 0.04)',
  glassHighlight: 'rgba(255, 255, 255, 0.90)',
  surfaceTint: 'rgba(0, 122, 255, 0.06)',

  // Weather-adaptive gradients - Atmospheric, subtle
  gradientSunnyStart: '#4A90E2',
  gradientSunnyEnd: '#87CEEB',
  gradientRainyStart: '#5D6D7E',
  gradientRainyEnd: '#34495E',
  gradientCloudyStart: '#95A5A6',
  gradientCloudyEnd: '#7F8C8D',
};

const darkColors: ThemeColors = {
  // Primary colors - Electric Blue (Apple adaptive blue for dark mode)
  primary: '#0A84FF',            // Apple Blue (vibrant, premium)
  primaryDark: '#0051D5',
  primaryLight: '#409CFF',
  primaryContainer: '#003D99',
  onPrimary: '#FFFFFF',
  onPrimaryContainer: '#B3D7FF',

  // Secondary colors - Fresh Green
  secondary: '#32D74B',          // Apple Green (dark mode variant)
  secondaryContainer: '#0D8A2E',
  onSecondary: '#FFFFFF',
  onSecondaryContainer: '#AEFFC7',

  // Background colors - True black OLED + Apple card backgrounds
  background: '#000000',             // True black (OLED power savings)
  backgroundElevated: '#1C1C1E',     // Apple elevated background
  backgroundSecondary: '#2C2C2E',    // Apple secondary background
  onBackground: '#FFFFFF',           // Pure white (infinite contrast on OLED)

  // Surface colors - Apple-style material hierarchy
  surface: '#1C1C1E',            // Apple card background (primary)
  surfaceVariant: '#2C2C2E',     // Apple secondary surface
  surfaceElevated1: '#2C2C2E',   // Level 1 elevation
  surfaceElevated2: '#3A3A3C',   // Level 2 elevation (modals)
  surfaceElevated3: '#48484A',   // Level 3 elevation (popovers)
  onSurface: '#FFFFFF',          // Pure white primary text
  onSurfaceVariant: 'rgba(235, 235, 245, 0.6)',   // Apple 60% opacity (secondary labels)

  // Text colors - Apple-style 3-tier hierarchy
  text: '#FFFFFF',               // Pure white (21.0:1 contrast - perfect)
  textSecondary: 'rgba(235, 235, 245, 0.6)',      // 60% opacity (~8.5:1 contrast)
  textTertiary: 'rgba(235, 235, 245, 0.3)',       // 30% opacity (~4.5:1 contrast)
  textInverse: '#000000',

  // Accent colors - Apple system (simplified)
  accent: '#BF5AF2',             // Apple Purple
  accentSecondary: '#FF375F',    // Apple Pink
  tertiary: '#64D2FF',           // Apple Light Blue
  tertiaryContainer: '#003D5C',
  onTertiary: '#FFFFFF',
  onTertiaryContainer: '#B3E5FF',

  // Status colors - Apple system (dark mode)
  success: '#32D74B',            // Apple Green
  successLight: '#6EE7B7',
  successDark: '#0D8A2E',
  successContainer: '#0D8A2E',
  onSuccessContainer: '#AEFFC7',

  warning: '#FFD60A',            // Apple Yellow
  warningLight: '#FFE566',
  warningDark: '#CC9F00',
  warningContainer: '#8C6600',
  onWarningContainer: '#FFF9CC',

  error: '#FF453A',              // Apple Red
  errorLight: '#FF6961',
  errorDark: '#D70015',
  errorContainer: '#990011',
  onErrorContainer: '#FFCCCC',

  info: '#64D2FF',               // Apple Light Blue
  infoLight: '#8FDDFF',
  infoDark: '#0099D6',
  infoContainer: '#006699',
  onInfoContainer: '#B3E5FF',

  // UV level colors - Apple system (vibrant for dark mode)
  uvLow: '#32D74B',              // Apple Green (0-2)
  uvModerate: '#FFD60A',         // Apple Yellow (3-5)
  uvHigh: '#FF9F0A',             // Apple Orange (6-7)
  uvVeryHigh: '#FF453A',         // Apple Red (8-10)
  uvExtreme: '#BF5AF2',          // Apple Purple (11+)

  // Border and divider - Apple subtle separators
  border: 'rgba(84, 84, 88, 0.6)',     // Apple separator (dark)
  divider: 'rgba(84, 84, 88, 0.65)',
  outline: 'rgba(84, 84, 88, 0.48)',
  outlineVariant: 'rgba(84, 84, 88, 0.36)',

  // Tab bar
  tabBarBackground: '#1C1C1E',
  tabBarActive: '#0A84FF',             // Apple Blue
  tabBarInactive: 'rgba(235, 235, 245, 0.6)',

  // Glass effect colors - Premium Apple Weather style
  glassBackground: 'rgba(28, 28, 30, 0.72)',    // 72% opacity + blur for depth
  glassBorder: 'rgba(255, 255, 255, 0.08)',     // Subtle edge
  glassHighlight: 'rgba(255, 255, 255, 0.12)',  // Gentle highlight
  surfaceTint: 'rgba(10, 132, 255, 0.08)',      // Blue tint

  // Weather-adaptive gradients - Atmospheric, sky-like
  gradientSunnyStart: '#4A90E2',       // Soft blue
  gradientSunnyEnd: '#5DADE2',         // Light blue
  gradientRainyStart: '#34495E',       // Dark blue-gray
  gradientRainyEnd: '#2C3E50',         // Deeper gray
  gradientCloudyStart: '#566573',      // Medium gray
  gradientCloudyEnd: '#455A64',        // Darker gray
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

// Spacing scale (8px base grid)
const spacing: Spacing = {
  xxs: 4,    // Tight spacing (icon padding, hairline gaps)
  xs: 8,     // Small gaps between related elements
  sm: 12,    // Moderate gaps within components
  md: 16,    // Default component padding
  lg: 24,    // Section spacing
  xl: 32,    // Screen padding, large gaps
  xxl: 48,   // Hero sections, major separations
  xxxl: 64,  // Maximum vertical spacing
};

// Typography scale - Platform-specific
const typography: Typography = {
  fontFamily: {
    regular: Platform.select({
      ios: 'SF Pro Text',
      android: 'Inter-Regular',
      default: 'System',
    })!,
    display: Platform.select({
      ios: 'SF Pro Display',
      android: 'Inter-Bold',
      default: 'System',
    })!,
    medium: Platform.select({
      ios: 'SF Pro Text',
      android: 'Inter-Medium',
      default: 'System',
    })!,
    semibold: Platform.select({
      ios: 'SF Pro Text',
      android: 'Inter-SemiBold',
      default: 'System',
    })!,
    bold: Platform.select({
      ios: 'SF Pro Display',
      android: 'Inter-Bold',
      default: 'System',
    })!,
    mono: Platform.select({
      ios: 'SF Mono',
      android: 'RobotoMono-Regular',
      default: 'SpaceMono',
    })!,
  },
  fontSize: {
    xs: 11,      // Captions (Apple-style)
    sm: 13,      // Secondary text
    base: 15,    // Body text (Apple uses 15px, not 16px)
    lg: 17,      // Emphasized body
    xl: 20,      // Small heading
    '2xl': 22,   // Medium heading
    '3xl': 28,   // Large heading
    '4xl': 34,   // Hero heading
    '5xl': 48,   // Temperature display
    '6xl': 64,   // Large temperature
    '7xl': 76,   // Extra large (hero)
  },
  lineHeight: {
    tight: 1.1,      // Large numbers (temperature display)
    snug: 1.2,       // Headings
    normal: 1.4,     // Body text (tighter than 1.5 for Apple feel)
    relaxed: 1.5,    // Long-form reading
    loose: 1.6,      // Maximum spacing
  },
  fontWeight: {
    thin: Platform.select({ ios: '100', android: '200', default: '100' }) as '100' | '200',
    extralight: Platform.select({ ios: '200', android: '300', default: '200' }) as '200' | '300',
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },
  letterSpacing: {
    tightest: -0.5,    // Large headings (64px+ temperature)
    tighter: -0.4,     // Medium headings (28-48px)
    tight: -0.08,      // Body text (15-17px) - Apple precision
    normal: 0,         // Small text (11-13px)
    wide: 0.5,         // All caps labels
    wider: 1.0,        // Very wide spacing
  },
};

// Border radius scale - Premium rounded (Apple-style)
const borderRadius: BorderRadius = {
  none: 0,
  sm: 8,       // Small UI elements
  md: 12,      // Buttons, chips
  lg: 16,      // Small cards
  xl: 20,      // Standard cards (Apple uses 20px)
  '2xl': 24,   // Hero cards, modals
  full: 9999,  // Pills, circular elements
};

// Shadow definitions - Soft, layered (Apple-style)
const shadow: Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,     // Softer
    shadowRadius: 3,         // Slightly larger blur
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,     // Softer
    shadowRadius: 12,        // Much larger blur for smoothness
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,     // Softer
    shadowRadius: 24,        // Large blur for premium depth
    elevation: 4,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.10,     // Softer but noticeable
    shadowRadius: 32,        // Very large blur for dramatic depth
    elevation: 6,
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
