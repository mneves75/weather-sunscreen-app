/**
 * Glass Effect Helpers
 * Utilities for checking glass availability and managing fallbacks
 * 
 * iOS 26+ Liquid Glass support with graceful fallbacks for:
 * - iOS < 26 (blur effects)
 * - Android (Material Design elevation)
 * - Accessibility (reduced transparency mode)
 */

import { isLiquidGlassAvailable } from 'expo-glass-effect';
import { useEffect, useState } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';

/**
 * Glass availability state
 */
export interface GlassAvailability {
  /** True if Liquid Glass components are available (iOS 26+) */
  hasLiquidGlass: boolean;
  
  /** True if glass effects should be rendered (considers accessibility) */
  canUseGlass: boolean;
  
  /** True if user has reduce transparency enabled */
  shouldReduceTransparency: boolean;
  
  /** True if running on iOS */
  isIOS: boolean;
  
  /** True if running on Android */
  isAndroid: boolean;
}

/**
 * Hook to check glass availability and accessibility preferences
 * 
 * @example
 * ```typescript
 * function Card() {
 *   const { canUseGlass, hasLiquidGlass } = useGlassAvailability();
 *   
 *   if (canUseGlass) {
 *     return <GlassView style={styles.card} />;
 *   }
 *   
 *   // Fallback for older iOS / Android / accessibility
 *   return <View style={[styles.card, styles.solidCard]} />;
 * }
 * ```
 */
export function useGlassAvailability(): GlassAvailability {
  const [hasLiquidGlass, setHasLiquidGlass] = useState(false);
  const [shouldReduceTransparency, setShouldReduceTransparency] = useState(false);
  
  useEffect(() => {
    // Check if Liquid Glass is available
    const glassAvailable = Platform.OS === 'ios' && isLiquidGlassAvailable();
    setHasLiquidGlass(glassAvailable);

    // Check accessibility preferences
    if (Platform.OS === 'ios') {
      AccessibilityInfo.isReduceTransparencyEnabled().then((enabled) => {
        setShouldReduceTransparency(enabled ?? false);
      });

      // Listen for changes to accessibility settings
      const subscription = AccessibilityInfo.addEventListener(
        'reduceTransparencyChanged',
        (enabled) => {
          setShouldReduceTransparency(enabled);
        }
      );

      return () => {
        subscription?.remove();
      };
    }
  }, []);

  return {
    hasLiquidGlass,
    canUseGlass: hasLiquidGlass && !shouldReduceTransparency,
    shouldReduceTransparency,
    isIOS: Platform.OS === 'ios',
    isAndroid: Platform.OS === 'android',
  };
}

/**
 * Get the appropriate glass effect style based on platform and variant
 * 
 * @param variant - Glass variant ('regular' or 'clear')
 * @returns Glass effect style for expo-glass-effect
 */
export function getGlassEffectStyle(variant: 'regular' | 'clear' = 'regular'): 'regular' | 'clear' {
  return variant;
}

/**
 * Get recommended glass container spacing based on relationship between elements
 * 
 * @param relationship - How elements relate to each other
 * @returns Spacing value in pixels
 */
export function getGlassSpacing(
  relationship: 'tight' | 'balanced' | 'separate' | 'independent'
): number {
  const spacingMap = {
    tight: 8,        // Elements merge significantly
    balanced: 16,    // Elements merge slightly
    separate: 24,    // Elements separate but related
    independent: 40, // Elements fully independent
  };

  return spacingMap[relationship];
}

/**
 * Check if glass effects should be disabled (e.g., during animations)
 * 
 * @param isScrolling - True if user is actively scrolling
 * @param isAnimating - True if heavy animations are running
 * @returns True if glass should be disabled for performance
 */
export function shouldDisableGlass(
  isScrolling: boolean = false,
  isAnimating: boolean = false
): boolean {
  return isScrolling || isAnimating;
}

/**
 * Get performance-safe glass count limit for current screen
 * 
 * @param screenType - Type of screen ('static' | 'scrollable' | 'animated')
 * @returns Maximum recommended number of glass effects
 */
export function getGlassLimit(screenType: 'static' | 'scrollable' | 'animated'): number {
  const limits = {
    static: 10,      // Static screens can handle more
    scrollable: 5,   // Scrollable screens should be conservative
    animated: 3,     // Animated screens should minimize glass
  };

  return limits[screenType];
}

/**
 * Calculate appropriate glass tint color based on theme
 * 
 * @param primaryColor - Theme primary color
 * @param opacity - Opacity for tint (0-1)
 * @returns Tint color with opacity
 */
export function getGlassTintColor(primaryColor: string, opacity: number = 0.1): string {
  // Ensure opacity is within valid range
  const validOpacity = Math.max(0, Math.min(1, opacity));
  
  // For hex colors, convert to rgba
  if (primaryColor.startsWith('#')) {
    const hex = primaryColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return `rgba(${r}, ${g}, ${b}, ${validOpacity})`;
  }
  
  // For rgba colors, replace alpha
  if (primaryColor.startsWith('rgba')) {
    return primaryColor.replace(/[\d.]+\)$/g, `${validOpacity})`);
  }
  
  // For rgb colors, convert to rgba
  if (primaryColor.startsWith('rgb')) {
    return primaryColor.replace('rgb', 'rgba').replace(')', `, ${validOpacity})`);
  }
  
  // Fallback: return color as-is
  return primaryColor;
}

/**
 * Determine if glass container should be used based on element count
 * 
 * @param elementCount - Number of glass elements to group
 * @returns True if container should be used
 */
export function shouldUseGlassContainer(elementCount: number): boolean {
  // Use container for 2+ glass elements for performance and visual merging
  return elementCount >= 2;
}

/**
 * Get fallback blur intensity for non-Liquid Glass platforms
 * 
 * @param glassVariant - Original glass variant
 * @returns Blur intensity for BlurView (0-100)
 */
export function getFallbackBlurIntensity(glassVariant: 'regular' | 'clear'): number {
  return glassVariant === 'regular' ? 50 : 30;
}

/**
 * Platform-specific glass implementation checker
 */
export const GlassPlatform = {
  /**
   * Check if current platform supports Liquid Glass
   */
  supportsLiquidGlass(): boolean {
    return Platform.OS === 'ios' && isLiquidGlassAvailable();
  },

  /**
   * Check if current platform should use Material Design elevation
   */
  shouldUseMaterialElevation(): boolean {
    return Platform.OS === 'android';
  },

  /**
   * Check if current platform should use blur effects
   */
  shouldUseBlurFallback(): boolean {
    return Platform.OS === 'ios' && !isLiquidGlassAvailable();
  },

  /**
   * Get recommended elevation for Material Design (Android)
   */
  getMaterialElevation(level: 'low' | 'medium' | 'high'): number {
    const elevations = {
      low: 2,
      medium: 4,
      high: 8,
    };
    return elevations[level];
  },
};

/**
 * Debug helper to log glass availability info
 * Only logs in development mode
 */
export function logGlassAvailability(availability: GlassAvailability): void {
  if (__DEV__) {
    console.log('[GlassHelpers] Availability:', {
      platform: Platform.OS,
      hasLiquidGlass: availability.hasLiquidGlass,
      canUseGlass: availability.canUseGlass,
      shouldReduceTransparency: availability.shouldReduceTransparency,
    });
  }
}

