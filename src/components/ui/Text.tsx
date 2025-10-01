/**
 * Themed text component
 */

import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';
import { useColors, useThemeTokens } from '@/src/theme';

type TextVariant = 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'body1' | 'body2' | 'caption' | 'overline';
type TextWeight = 'regular' | 'medium' | 'semibold' | 'bold';

interface TextProps extends RNTextProps {
  variant?: TextVariant;
  weight?: TextWeight;
  color?: 'primary' | 'secondary' | 'tertiary' | 'inverse' | 'error';
  children: React.ReactNode;
}

export function Text({
  variant = 'body',
  weight = 'regular',
  color = 'primary',
  style,
  children,
  ...props
}: TextProps) {
  const colors = useColors();
  const { typography } = useThemeTokens();

  const colorMap = {
    primary: colors.text,
    secondary: colors.textSecondary,
    tertiary: colors.textTertiary,
    inverse: colors.textInverse,
    error: colors.error,
  };

  const fontSizeMap = {
    h1: typography.fontSize['4xl'],
    h2: typography.fontSize['3xl'],
    h3: typography.fontSize['2xl'],
    h4: typography.fontSize.xl,
    body: typography.fontSize.base,
    body1: typography.fontSize.base,
    body2: typography.fontSize.sm,
    caption: typography.fontSize.sm,
    overline: typography.fontSize.xs,
  };

  const fontWeightMap: Record<TextWeight, '400' | '500' | '600' | '700'> = {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  };

  const textStyles = [
    styles.text,
    {
      color: colorMap[color],
      fontSize: fontSizeMap[variant],
      fontWeight: fontWeightMap[weight],
      lineHeight: variant.startsWith('h') ? typography.lineHeight.tight * fontSizeMap[variant] : typography.lineHeight.normal * fontSizeMap[variant],
    },
    variant === 'overline' && styles.overline,
    style,
  ];

  return (
    <RNText style={textStyles} {...props}>
      {children}
    </RNText>
  );
}

const styles = StyleSheet.create({
  text: {
    // Base styles
  },
  overline: {
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
