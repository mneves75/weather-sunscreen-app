/**
 * Glass effect view with iOS 26 Liquid Glass support and fallback blur
 *
 * On iOS 26+: Uses native Liquid Glass effect via expo-glass-effect
 * On iOS < 26 / Android / Web: Falls back to BlurView
 *
 * @see https://docs.expo.dev/versions/v54.0.0/sdk/glass-effect/
 */

import React from 'react';
import { Platform, StyleSheet, View, ViewProps, AccessibilityInfo } from 'react-native';
import { BlurView } from 'expo-blur';
import { GlassView as NativeGlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import { useTheme, useThemeTokens } from '@/src/theme';

interface GlassViewProps extends ViewProps {
  children: React.ReactNode;
  /** Blur intensity for fallback (1-100, default: 30) */
  intensity?: number;
  /** Glass effect style for iOS 26+ (default: 'regular') */
  glassEffectStyle?: 'clear' | 'regular';
  /** Make glass interactive on iOS 26+ (default: false) */
  isInteractive?: boolean;
  /** Tint color for glass effect */
  tintColor?: string;
  /** Disable glass during animations/scrolling for performance (default: false) */
  disabled?: boolean;
  /** Elevation level for visual hierarchy (1-5, default: 2) */
  elevation?: 1 | 2 | 3 | 4 | 5;
}

export function GlassView({
  children,
  intensity = 30,
  glassEffectStyle = 'regular',
  isInteractive = false,
  tintColor,
  disabled = false,
  elevation = 2,
  style,
  ...props
}: GlassViewProps) {
  const { isDark, colors } = useTheme();
  const { borderRadius } = useThemeTokens();
  const [reduceTransparency, setReduceTransparency] = React.useState(false);

  // CRITICAL: Check accessibility preferences on mount and when app resumes
  // Some users have reduced transparency enabled for medical/visual reasons
  React.useEffect(() => {
    if (Platform.OS === 'ios') {
      AccessibilityInfo.isReduceTransparencyEnabled().then(setReduceTransparency);
    }
  }, []);

  // Check if Liquid Glass is available (iOS 26+)
  const hasLiquidGlass = Platform.OS === 'ios' && isLiquidGlassAvailable();

  // PERFORMANCE: If disabled prop is true, render static view with elevation shadows
  // Use this during scrolling or heavy animations to maintain 60fps
  if (disabled) {
    return (
      <View
        style={[
          styles.glass,
          {
            backgroundColor: colors.surface,
            borderRadius: borderRadius.md,
            // Elevation-based shadow for depth without glass effect
            // Formula: opacity = elevation * 0.05 (0.05 to 0.25)
            //          radius = elevation * 4 (4px to 20px)
            //          offset = elevation * 2 (2px to 10px)
            shadowColor: '#000',
            shadowOpacity: elevation * 0.05,
            shadowRadius: elevation * 4,
            shadowOffset: { width: 0, height: elevation * 2 },
            // Android elevation support
            elevation: Platform.OS === 'android' ? elevation * 2 : 0,
          },
          style,
        ]}
        {...props}
      >
        {children}
      </View>
    );
  }

  // ACCESSIBILITY: Respect reduce transparency setting
  // Fallback to minimal blur (intensity: 10) + solid background for readability
  if (reduceTransparency) {
    return (
      <BlurView
        intensity={10}
        tint={isDark ? 'dark' : 'light'}
        style={[styles.glass, { borderRadius: borderRadius.md, backgroundColor: colors.surfaceVariant }, style]}
        {...props}
      >
        {children}
      </BlurView>
    );
  }

  // iOS 26+ with Liquid Glass support
  if (hasLiquidGlass) {
    return (
      <NativeGlassView
        glassEffectStyle={glassEffectStyle}
        isInteractive={isInteractive}
        tintColor={tintColor || colors.primary}
        style={[styles.glass, { borderRadius: borderRadius.md }, style]}
        {...props}
      >
        {children}
      </NativeGlassView>
    );
  }

  // Fallback: BlurView for iOS < 26, Android, Web
  return (
    <BlurView
      intensity={intensity}
      tint={isDark ? 'dark' : 'light'}
      style={[styles.glass, { borderRadius: borderRadius.md }, style]}
      {...props}
    >
      {children}
    </BlurView>
  );
}

const styles = StyleSheet.create({
  glass: {
    overflow: 'hidden',
  },
});
