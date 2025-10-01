/**
 * Themed card component
 */

import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { useColors, useThemeTokens } from '@/src/theme';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  elevated?: boolean;
}

export function Card({ children, elevated = false, style, ...props }: CardProps) {
  const colors = useColors();
  const { spacing, borderRadius, shadow } = useThemeTokens();

  const cardStyles = [
    styles.card,
    {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
    },
    elevated && shadow.md,
    style,
  ];

  return (
    <View style={cardStyles} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
});
