/**
 * Glass effect view with fallback blur
 */

import React from 'react';
import { StyleSheet, ViewProps } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme, useThemeTokens } from '@/src/theme';

interface GlassViewProps extends ViewProps {
  children: React.ReactNode;
  intensity?: number;
}

export function GlassView({ children, intensity = 30, style, ...props }: GlassViewProps) {
  const { isDark } = useTheme();
  const { borderRadius } = useThemeTokens();

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
