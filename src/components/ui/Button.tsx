/**
 * Modern Button component with 5 variants, animations, and haptic feedback
 * Following 2025 mobile design trends
 */

import React from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  Animated,
  ActivityIndicator,
  Platform,
  GestureResponderEvent,
  ViewStyle,
  TextStyle,
} from 'react-native';
import type { LinearGradientProps } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useColors, useThemeTokens } from '@/src/theme';
import { createPressAnimation } from '@/src/theme/animations';
import { hasExpoLinearGradient } from '@/src/utils/nativeAvailability';

type LinearGradientComponent = React.ComponentType<LinearGradientProps> | null;

let cachedLinearGradient: LinearGradientComponent | undefined;

function getLinearGradient(): LinearGradientComponent {
  if (cachedLinearGradient !== undefined) {
    return cachedLinearGradient;
  }

  if (!hasExpoLinearGradient()) {
    cachedLinearGradient = null;
    return cachedLinearGradient;
  }

  try {
    const { LinearGradient } = require('expo-linear-gradient');
    cachedLinearGradient = LinearGradient as LinearGradientComponent;
  } catch (error) {
    if (__DEV__) {
      console.warn('[Button] expo-linear-gradient unavailable, falling back to solid background.', error);
    }
    cachedLinearGradient = null;
  }

  return cachedLinearGradient;
}

export type ButtonVariant = 'filled' | 'tonal' | 'outlined' | 'text' | 'elevated';
export type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  haptic?: boolean;
  fullWidth?: boolean;
  onPress?: (event: GestureResponderEvent) => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  title,
  variant = 'filled',
  size = 'medium',
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  haptic = true,
  fullWidth = false,
  onPress,
  style,
  textStyle,
}: ButtonProps) {
  const colors = useColors();
  const { shadow } = useThemeTokens();
  const { scale, pressIn, pressOut } = createPressAnimation(0.96);

  // Haptic feedback on press
  const handlePress = (event: GestureResponderEvent) => {
    if (haptic && Platform.OS === 'ios' && !disabled && !loading) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress?.(event);
  };

  // Variant styles
  const getVariantStyles = (): {
    containerStyle: ViewStyle;
    textColor: string;
    useGradient?: boolean;
    gradientColors?: string[];
  } => {
    switch (variant) {
      case 'filled':
        return {
          containerStyle: {
            backgroundColor: colors.primary,
          },
          textColor: colors.onPrimary,
          useGradient: true,
          gradientColors: [colors.primary, colors.primaryDark],
        };

      case 'tonal':
        return {
          containerStyle: {
            backgroundColor: colors.primaryContainer,
          },
          textColor: colors.onPrimaryContainer,
        };

      case 'outlined':
        return {
          containerStyle: {
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderColor: colors.outline,
          },
          textColor: colors.primary,
        };

      case 'text':
        return {
          containerStyle: {
            backgroundColor: 'transparent',
          },
          textColor: colors.primary,
        };

      case 'elevated':
        return {
          containerStyle: {
            backgroundColor: colors.surface,
            ...shadow.lg,
          },
          textColor: colors.primary,
        };

      default:
        return {
          containerStyle: {
            backgroundColor: colors.primary,
          },
          textColor: colors.onPrimary,
        };
    }
  };

  const sizeConfig = {
    small: { height: 40, fontSize: 14, paddingHorizontal: 16 },
    medium: { height: 48, fontSize: 16, paddingHorizontal: 24 },
    large: { height: 56, fontSize: 18, paddingHorizontal: 32 },
  }[size];

  const variantStyles = getVariantStyles();
  const LinearGradient = getLinearGradient();
  const shouldUseGradient = Boolean(
    variantStyles.useGradient &&
    LinearGradient &&
    variantStyles.gradientColors &&
    variantStyles.gradientColors.length >= 2,
  );

  const buttonContent = (
    <View style={styles.buttonContent}>
      {icon && iconPosition === 'left' && !loading && (
        <View style={styles.iconLeft}>{icon}</View>
      )}

      {loading ? (
        <ActivityIndicator color={variantStyles.textColor} />
      ) : (
        <Text
          style={[
            styles.buttonText,
            {
              color: variantStyles.textColor,
              fontSize: sizeConfig.fontSize,
              fontWeight: '600',
              letterSpacing: 0.5,
            },
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}

      {icon && iconPosition === 'right' && !loading && (
        <View style={styles.iconRight}>{icon}</View>
      )}
    </View>
  );

  const buttonStyle = [
    styles.button,
    {
      height: sizeConfig.height,
      paddingHorizontal: sizeConfig.paddingHorizontal,
      borderRadius: sizeConfig.height / 2, // Perfect pill shape
      opacity: disabled ? 0.5 : 1,
    },
    shouldUseGradient ? {} : variantStyles.containerStyle,
    fullWidth && styles.fullWidth,
    style,
  ];

  return (
    <Animated.View style={[{ transform: [{ scale }] }, fullWidth && styles.fullWidth]}>
      <TouchableOpacity
        disabled={disabled || loading}
        onPress={handlePress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        activeOpacity={0.8}
        style={styles.touchable}
      >
        {shouldUseGradient ? (
          <LinearGradient
            colors={variantStyles.gradientColors as [string, string, ...string[]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={buttonStyle}
          >
            {buttonContent}
          </LinearGradient>
        ) : (
          <View style={buttonStyle}>{buttonContent}</View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  touchable: {
    overflow: 'hidden',
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    textAlign: 'center',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
  fullWidth: {
    width: '100%',
  },
});
