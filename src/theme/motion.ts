/**
 * Material Motion Utilities
 *
 * Provides utilities for Material Design 3 motion patterns
 * including state layers, ripple effects, and transition helpers
 *
 * @see https://m3.material.io/styles/motion/overview
 */

import { Platform } from 'react-native';

/**
 * State Layer Opacity Values (Material Design 3)
 * These values create visual feedback for interactive elements
 */
export const stateLayers = {
  hover: 0.08,      // Desktop hover state
  focus: 0.12,      // Keyboard focus state
  pressed: 0.12,    // Touch/click pressed state
  dragged: 0.16,    // Dragging an element
  disabled: 0.38,   // Disabled state opacity
} as const;

/**
 * Elevation Overlay Opacity (Material Design 3)
 * Used for tonal elevation on dark surfaces
 */
export const elevationOverlay = {
  level0: 0.00,   // Surface
  level1: 0.05,   // +1dp
  level2: 0.08,   // +2dp
  level3: 0.11,   // +3dp
  level4: 0.12,   // +4dp
  level5: 0.14,   // +5dp
} as const;

/**
 * Get state layer style for pressed/hover states
 *
 * @param baseColor - Base color to apply opacity to
 * @param state - Interaction state (hover, pressed, etc.)
 * @returns RGBA color string with appropriate opacity
 *
 * @example
 * ```typescript
 * <Pressable
 *   style={({ pressed }) => [
 *     styles.button,
 *     pressed && { backgroundColor: getStateLayer(colors.primary, 'pressed') }
 *   ]}
 * >
 *   <Text>Button</Text>
 * </Pressable>
 * ```
 */
export function getStateLayer(
  baseColor: string,
  state: keyof typeof stateLayers = 'pressed'
): string {
  const opacity = stateLayers[state];

  // Simple hex to rgba conversion (supports #RGB, #RRGGBB)
  if (baseColor.startsWith('#')) {
    let hex = baseColor.replace('#', '');

    // Convert 3-digit hex to 6-digit
    if (hex.length === 3) {
      hex = hex.split('').map(c => c + c).join('');
    }

    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }

  // If already rgba/rgb, modify opacity (basic implementation)
  if (baseColor.startsWith('rgba')) {
    return baseColor.replace(/[\d.]+\)$/g, `${opacity})`);
  }

  // Fallback
  return `rgba(0, 0, 0, ${opacity})`;
}

/**
 * Material Design 3 Emphasis Levels
 * Typography opacity values for creating visual hierarchy
 */
export const emphasis = {
  high: 1.0,       // Primary text
  medium: 0.74,    // Secondary text (formerly 0.6 in M2)
  disabled: 0.38,  // Disabled text
} as const;

/**
 * Ripple Effect Configuration (Android)
 * Material Design 3 ripple parameters
 */
export const ripple = {
  // Ripple radius expands from touch point
  radius: 'auto' as const,

  // Ripple color based on surface
  light: 'rgba(0, 0, 0, 0.12)',
  dark: 'rgba(255, 255, 255, 0.12)',

  // Ripple bounded to component (vs unbounded for icons)
  bounded: true,

  // Ripple duration
  duration: 300,
} as const;

/**
 * Get appropriate ripple color based on theme
 */
export function getRippleColor(isDark: boolean): string {
  return isDark ? ripple.dark : ripple.light;
}

/**
 * Platform-specific motion behavior
 */
export const platformMotion = {
  /**
   * Should use reduced motion on this platform?
   * iOS/Android: Check accessibility settings
   * Web: Check prefers-reduced-motion
   */
  shouldReduceMotion: false, // Set by AccessibilityInfo in app

  /**
   * Should use ripple effects?
   * Android: Yes (Material Design)
   * iOS: No (use scale feedback instead)
   */
  shouldUseRipple: Platform.OS === 'android',

  /**
   * Should use haptic feedback?
   * iOS/Android: Yes
   * Web: No
   */
  shouldUseHaptics: Platform.OS !== 'web',
} as const;

/**
 * Motion Token: Transition Duration by Size
 * Larger elements should move slower for natural motion
 */
export function getTransitionDuration(elementSize: 'small' | 'medium' | 'large'): number {
  const durationMap = {
    small: 100,   // Chips, buttons, icons
    medium: 200,  // Cards, list items
    large: 300,   // Modals, sheets, screens
  };
  return durationMap[elementSize];
}

/**
 * Motion Token: Stagger Delay by List Size
 * Prevents excessive delays for long lists
 */
export function getListStaggerDelay(listLength: number): number {
  if (listLength <= 5) return 50;   // Short lists: 50ms delay
  if (listLength <= 20) return 30;  // Medium lists: 30ms delay
  return 0;                          // Long lists: no stagger (performance)
}
