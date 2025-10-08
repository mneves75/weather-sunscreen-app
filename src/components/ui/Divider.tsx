/**
 * Divider component
 */

import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { useColors, useThemeTokens } from '@/src/theme';

interface DividerProps extends ViewProps {
  vertical?: boolean;
  thickness?: number;
}

export function Divider({ vertical = false, thickness = 1, style, ...props }: DividerProps) {
  const colors = useColors();
  const { spacing } = useThemeTokens();

  const dividerStyles = [
    styles.divider,
    {
      backgroundColor: colors.divider,
      [vertical ? 'width' : 'height']: thickness,
      [vertical ? 'height' : 'width']: '100%',
      marginVertical: vertical ? 0 : spacing.sm,
      marginHorizontal: vertical ? spacing.sm : 0,
    },
    style,
  ];

  return <View style={dividerStyles} {...props} />;
}

const styles = StyleSheet.create({
  divider: {},
});
