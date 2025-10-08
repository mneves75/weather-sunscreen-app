/**
 * Glass card component
 */

import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { GlassView } from './GlassView';
import { useThemeTokens, useColors } from '@/src/theme';

interface GlassCardProps extends ViewProps {
  children: React.ReactNode;
  /** Blur intensity for fallback (1-100, default: 30) */
  intensity?: number;
  /** Show border around card (default: true) */
  border?: boolean;
  /** Elevation level for visual hierarchy (1-5, default: 2) */
  elevation?: 1 | 2 | 3 | 4 | 5;
  /** Disable glass during animations/scrolling for performance (default: false) */
  disabled?: boolean;
}

export function GlassCard({
  children,
  intensity = 30,
  border = true,
  elevation = 2,
  disabled = false,
  style,
  ...props
}: GlassCardProps) {
  const { spacing, borderRadius } = useThemeTokens();
  const colors = useColors();

  return (
    <GlassView
      intensity={intensity}
      elevation={elevation}
      disabled={disabled}
      style={[
        styles.card,
        {
          padding: spacing.md,
          borderRadius: borderRadius.lg,
          borderWidth: border ? 1 : 0,
          borderColor: border ? colors.glassBorder : 'transparent',
        },
        style,
      ]}
      {...props}
    >
      {children}
    </GlassView>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
});
