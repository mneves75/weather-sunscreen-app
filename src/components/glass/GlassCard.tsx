/**
 * Glass card component
 */

import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { GlassView } from './GlassView';
import { useThemeTokens, useColors } from '@/src/theme';

interface GlassCardProps extends ViewProps {
  children: React.ReactNode;
  intensity?: number;
  border?: boolean;
}

export function GlassCard({
  children,
  intensity = 30,
  border = true,
  style,
  ...props
}: GlassCardProps) {
  const { spacing, borderRadius } = useThemeTokens();
  const colors = useColors();

  return (
    <GlassView
      intensity={intensity}
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
