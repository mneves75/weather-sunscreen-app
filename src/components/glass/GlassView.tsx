/**
 * Glass effect view with iOS 26 Liquid Glass support and fallback blur
 *
 * On iOS 26+: Uses native Liquid Glass effect via expo-glass-effect
 * On iOS < 26 / Android / Web: Falls back to BlurView
 *
 * @see https://docs.expo.dev/versions/v54.0.0/sdk/glass-effect/
 */

import React from 'react';
import { Platform, StyleSheet, ViewProps, AccessibilityInfo } from 'react-native';
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
}

export function GlassView({
  children,
  intensity = 30,
  glassEffectStyle = 'regular',
  isInteractive = false,
  tintColor,
  style,
  ...props
}: GlassViewProps) {
  const { isDark, colors } = useTheme();
  const { borderRadius } = useThemeTokens();
  const [reduceTransparency, setReduceTransparency] = React.useState(false);

  // Check accessibility preferences on mount
  React.useEffect(() => {
    if (Platform.OS === 'ios') {
      AccessibilityInfo.isReduceTransparencyEnabled().then(setReduceTransparency);
    }
  }, []);

  // Check if Liquid Glass is available (iOS 26+)
  const hasLiquidGlass = Platform.OS === 'ios' && isLiquidGlassAvailable();

  // If reduce transparency is enabled, use minimal blur
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
