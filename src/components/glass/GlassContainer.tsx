/**
 * Glass Container Component
 * Combines multiple glass views for iOS 26 Liquid Glass merged effects
 *
 * PERFORMANCE OPTIMIZATION:
 * On iOS 26+, wrapping multiple GlassView components in a GlassContainer
 * tells the system to merge adjacent glass effects into a single render pass.
 * This significantly improves performance when displaying multiple glass elements.
 *
 * Without Container (3 separate render passes):
 * ┌─────────┐  ┌─────────┐  ┌─────────┐
 * │ Glass 1 │  │ Glass 2 │  │ Glass 3 │
 * └─────────┘  └─────────┘  └─────────┘
 *
 * With Container (1 merged render pass):
 * ┌───────────────────────────────────┐
 * │  Glass 1  │  Glass 2  │  Glass 3  │
 * └───────────────────────────────────┘
 *
 * On iOS < 26 / Android / Web: Falls back to flexbox layout
 *
 * @see https://docs.expo.dev/versions/v54.0.0/sdk/glass-effect/
 * @see docs/REF_DOC/liquid-glass-app-with-expo-ui-and-swiftui.md
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

  // PLATFORM CHECK: Determine if native Liquid Glass is available
  // iOS 26+ supports merged glass rendering for performance
  const hasLiquidGlass = Platform.OS === 'ios' && isLiquidGlassAvailable();

  // iOS 26+ with Native Liquid Glass support
  // Multiple adjacent GlassView children are automatically merged
  // into a single render pass, improving performance
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

  // FALLBACK: Regular View with gap for iOS < 26, Android, Web
  // No performance optimization, but maintains visual consistency
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
