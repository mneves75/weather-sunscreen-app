/**
 * Glass Container Component
 * Combines multiple glass views for iOS 26 Liquid Glass combined effects
 *
 * On iOS 26+: Uses native GlassContainer for merged glass effects
 * On iOS < 26 / Android / Web: Falls back to flexbox layout with BlurView
 *
 * @see https://docs.expo.dev/versions/v54.0.0/sdk/glass-effect/
 */

import React from 'react';
import { Platform, StyleSheet, View, ViewProps } from 'react-native';
import { GlassContainer as NativeGlassContainer, isLiquidGlassAvailable } from 'expo-glass-effect';
import { useThemeTokens } from '@/src/theme';

interface GlassContainerProps extends ViewProps {
  children: React.ReactNode;
  /** Spacing between glass elements (default: 8) */
  spacing?: number;
  /** Flex direction (default: 'row') */
  direction?: 'row' | 'column';
}

export function GlassContainer({
  children,
  spacing = 8,
  direction = 'row',
  style,
  ...props
}: GlassContainerProps) {
  const { spacing: themeSpacing } = useThemeTokens();

  // Check if Liquid Glass is available (iOS 26+)
  const hasLiquidGlass = Platform.OS === 'ios' && isLiquidGlassAvailable();

  // iOS 26+ with Liquid Glass support
  if (hasLiquidGlass) {
    return (
      <NativeGlassContainer
        spacing={spacing}
        style={[
          styles.container,
          { flexDirection: direction, gap: spacing },
          style,
        ]}
        {...props}
      >
        {children}
      </NativeGlassContainer>
    );
  }

  // Fallback: Regular View with gap for iOS < 26, Android, Web
  return (
    <View
      style={[
        styles.container,
        {
          flexDirection: direction,
          gap: spacing || themeSpacing.md,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
