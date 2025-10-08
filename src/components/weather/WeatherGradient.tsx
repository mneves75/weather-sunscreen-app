/**
 * Weather Gradient Background
 * Animated gradient backgrounds based on weather conditions
 *
 * Design principles:
 * - Smooth color transitions
 * - Weather-specific gradients (sunny, rainy, cloudy)
 * - Subtle animation on weather change
 * - Works behind glass effects
 *
 * @example
 * ```typescript
 * <WeatherGradient weatherType="sunny">
 *   <GlassView>
 *     <TemperatureDisplay />
 *   </GlassView>
 * </WeatherGradient>
 * ```
 */

import React, { useEffect } from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  Easing,
} from 'react-native-reanimated';
import { useColors } from '@/src/theme/theme';

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export type GradientWeatherType = 'sunny' | 'rainy' | 'cloudy' | 'snowy' | 'default';

export interface WeatherGradientProps {
  /** Weather type determines gradient colors */
  weatherType: GradientWeatherType;
  /** Children to render on top of gradient */
  children: React.ReactNode;
  /** Additional styles */
  style?: ViewStyle;
}

export function WeatherGradient({
  weatherType,
  children,
  style,
}: WeatherGradientProps) {
  const colors = useColors();
  const opacity = useSharedValue(0);

  // Fade in animation
  useEffect(() => {
    opacity.value = withTiming(1, {
      duration: 800,
      easing: Easing.bezier(0.4, 0.0, 0.2, 1.0),
    });
  }, [weatherType]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const gradientColors = getWeatherGradient(weatherType, colors);

  return (
    <AnimatedLinearGradient
      colors={gradientColors}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={[styles.gradient, style, animatedStyle]}
    >
      {children}
    </AnimatedLinearGradient>
  );
}

/**
 * Get gradient colors based on weather type
 */
function getWeatherGradient(
  weatherType: GradientWeatherType,
  colors: any
): string[] {
  const gradientMap: Record<GradientWeatherType, string[]> = {
    // Sunny: Bright blue sky gradient
    sunny: [
      colors.gradientSunnyStart || '#4A90E2',
      colors.gradientSunnyEnd || '#87CEEB',
    ],

    // Rainy: Dark gray gradient
    rainy: [
      colors.gradientRainyStart || '#5D6D7E',
      colors.gradientRainyEnd || '#34495E',
    ],

    // Cloudy: Medium gray gradient
    cloudy: [
      colors.gradientCloudyStart || '#95A5A6',
      colors.gradientCloudyEnd || '#7F8C8D',
    ],

    // Snowy: Icy blue-gray gradient
    snowy: [
      '#B0C4DE',
      '#D3D3D3',
    ],

    // Default: Subtle background gradient
    default: [
      colors.background,
      colors.backgroundSecondary,
    ],
  };

  return gradientMap[weatherType];
}

const styles = StyleSheet.create({
  gradient: {
    borderRadius: 24,     // Match TemperatureDisplay borderRadius
    overflow: 'hidden',   // Clip gradient to rounded corners
    minHeight: 200,       // Ensure minimum height for content
  },
});
