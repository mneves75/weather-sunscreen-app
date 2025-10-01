/**
 * Themed button component
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacityProps,
} from 'react-native';
import { useColors, useThemeTokens } from '@/src/theme';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
}

export function Button({
  title,
  variant = 'primary',
  size = 'medium',
  loading = false,
  fullWidth = false,
  disabled,
  style,
  ...props
}: ButtonProps) {
  const colors = useColors();
  const { spacing, borderRadius, typography } = useThemeTokens();

  const buttonStyles = [
    styles.button,
    {
      backgroundColor: variant === 'primary' ? colors.primary : 'transparent',
      borderColor: variant === 'outline' ? colors.border : 'transparent',
      borderWidth: variant === 'outline' ? 1 : 0,
      borderRadius: borderRadius.md,
      paddingVertical: size === 'small' ? spacing.sm : size === 'large' ? spacing.md : spacing.sm,
      paddingHorizontal: size === 'small' ? spacing.md : size === 'large' ? spacing.xl : spacing.lg,
      opacity: disabled || loading ? 0.5 : 1,
    },
    fullWidth && styles.fullWidth,
    style,
  ];

  const textStyles = [
    styles.text,
    {
      color: variant === 'primary' ? colors.textInverse : colors.text,
      fontSize: size === 'small' ? typography.fontSize.sm : size === 'large' ? typography.fontSize.lg : typography.fontSize.base,
      fontWeight: '600' as const,
    },
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? colors.textInverse : colors.primary} />
      ) : (
        <Text style={textStyles}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  fullWidth: {
    width: '100%',
  },
  text: {
    textAlign: 'center',
  },
});
