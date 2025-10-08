/**
 * Themed text component
 */

import React from 'react';
import { StyleSheet, Text as RNText, TextProps as RNTextProps } from 'react-native';
import { useColors, useThemeTokens } from '@/src/theme';

type TextVariant = 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'body1' | 'body2' | 'caption' | 'overline';
type TextWeight = 'regular' | 'medium' | 'semibold' | 'bold';

interface TextProps extends RNTextProps {
  variant?: TextVariant;
  weight?: TextWeight;
  color?: 'primary' | 'secondary' | 'tertiary' | 'inverse' | 'error' | 'onSurface' | 'onBackground';
  children: React.ReactNode;
}

export function Text({
  variant = 'body',
  weight = 'regular',
  color,
  style,
  children,
  ...props
}: TextProps) {
  const colors = useColors();
  const { typography } = useThemeTokens();
  const flattenedStyle = StyleSheet.flatten(style) || {};

  const colorMap = {
    primary: colors.text,
    secondary: colors.textSecondary,
    tertiary: colors.textTertiary,
    inverse: colors.textInverse,
    error: colors.error,
    onSurface: colors.onSurface,
    onBackground: colors.onBackground,
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

  const finalFontSize = typeof flattenedStyle.fontSize === 'number'
    ? flattenedStyle.fontSize
    : fontSizeMap[variant];

  const finalLineHeight = typeof flattenedStyle.lineHeight === 'number'
    ? flattenedStyle.lineHeight
    : (variant.startsWith('h')
      ? typography.lineHeight.tight * finalFontSize
      : typography.lineHeight.normal * finalFontSize);

  const textStyles = [
    styles.text,
    {
      color: color ? colorMap[color] : colors.onSurface,
      fontSize: finalFontSize,
      fontWeight: fontWeightMap[weight],
      lineHeight: finalLineHeight,
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
