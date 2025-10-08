/**
 * Modern Card component with 4 variants, animations, and glass effects
 * Following 2025 mobile design trends
 */

import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ViewProps,
  GestureResponderEvent,
  ViewStyle,
} from 'react-native';
import type { LinearGradientProps } from 'expo-linear-gradient';
import { GlassView } from 'expo-glass-effect';
import { useColors, useThemeTokens, useGlassAvailability } from '@/src/theme';
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
      console.warn('[Card] expo-linear-gradient unavailable, falling back to solid background.', error);
    }
    cachedLinearGradient = null;
  }

  return cachedLinearGradient;
}

export type CardVariant = 'elevated' | 'filled' | 'outlined' | 'glass';
export type CardElevation = 'sm' | 'md' | 'lg' | 'xl';

interface CardProps extends Omit<ViewProps, 'children'> {
  children: React.ReactNode;
  variant?: CardVariant;
  elevation?: CardElevation;
  gradient?: [string, string];
  interactive?: boolean;
  onPress?: (event: GestureResponderEvent) => void;
}

export function Card({
  children,
  variant = 'elevated',
  elevation = 'md',
  gradient,
  interactive = false,
  onPress,
  style,
  ...props
}: CardProps) {
  const colors = useColors();
  const { shadow, spacing, borderRadius } = useThemeTokens();
  const { canUseGlass } = useGlassAvailability();
  const { scale, pressIn, pressOut } = createPressAnimation(0.98);
  const LinearGradient = getLinearGradient();

  // Variant styles
  const getVariantStyles = (): ViewStyle => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: colors.surface,
          ...shadow[elevation],
        };

      case 'filled':
        return {
          backgroundColor: colors.surfaceVariant,
          ...shadow.sm,
        };

      case 'outlined':
        return {
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.outline,
        };

      case 'glass':
        return {
          // Glass styling handled by GlassView wrapper
        };

      default:
        return {
          backgroundColor: colors.surface,
        };
    }
  };

  const variantStyles = getVariantStyles();

  const cardStyle: ViewStyle[] = [
    styles.card,
    {
      borderRadius: borderRadius.xl,
      padding: spacing.lg,
    },
    variantStyles,
    style,
  ];

  if (gradient && variant !== 'glass' && !LinearGradient) {
    cardStyle.push({ backgroundColor: gradient[0] });
  }

  const cardContent = (
    <View style={styles.cardContent}>
      {gradient && variant !== 'glass' && LinearGradient ? (
        <LinearGradient
          colors={gradient as [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      ) : null}
      {children}
    </View>
  );

  // Glass variant with iOS 26+ support
  if (variant === 'glass' && canUseGlass) {
    return (
      <Animated.View style={[{ transform: [{ scale: interactive ? scale : 1 }] }, style]}>
        {interactive ? (
          <TouchableOpacity
            onPress={onPress}
            onPressIn={pressIn}
            onPressOut={pressOut}
            activeOpacity={0.8}
            style={styles.touchable}
          >
            <GlassView
              style={cardStyle}
              glassEffectStyle="regular"
              tintColor={colors.surfaceTint}
              {...props}
            >
              {cardContent}
            </GlassView>
          </TouchableOpacity>
        ) : (
          <GlassView
            style={cardStyle}
            glassEffectStyle="regular"
            tintColor={colors.surfaceTint}
            {...props}
          >
            {cardContent}
          </GlassView>
        )}
      </Animated.View>
    );
  }

  // Standard variants
  const Container = interactive ? TouchableOpacity : View;

  return (
    <Animated.View style={[{ transform: [{ scale: interactive ? scale : 1 }] }, style]}>
      <Container
        onPress={interactive ? onPress : undefined}
        onPressIn={interactive ? pressIn : undefined}
        onPressOut={interactive ? pressOut : undefined}
        activeOpacity={interactive ? 0.8 : 1}
        style={cardStyle}
        {...props}
      >
        {cardContent}
      </Container>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  touchable: {
    overflow: 'hidden',
  },
  card: {
    overflow: 'hidden',
  },
  cardContent: {
    position: 'relative',
  },
});
