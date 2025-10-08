/**
 * Animated Circular Progress Indicator
 * Used for UV index with gradient color support
 *
 * Design principles:
 * - Smooth animated ring (Reanimated)
 * - Gradient support (green → yellow → red → purple for UV)
 * - Stroke linecap "round" for premium look
 * - Material Design 3 emphasized easing
 *
 * @example
 * ```typescript
 * <CircularProgress
 *   value={8}
 *   max={11}
 *   size={200}
 *   trackWidth={12}
 *   gradient={['#30D158', '#FFD60A', '#FF9F0A', '#FF453A', '#BF5AF2']}
 * >
 *   <Text variant="5xl" fontWeight="700">8</Text>
 *   <Text variant="body1">Very High</Text>
 * </CircularProgress>
 * ```
 */

import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedProps,
  Easing,
} from 'react-native-reanimated';
import { useColors } from '@/src/theme/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface CircularProgressProps {
  /** Current value (e.g., 8 for UV index) */
  value: number;
  /** Maximum value (e.g., 11 for UV) */
  max: number;
  /** Diameter in pixels */
  size?: number;
  /** Ring thickness */
  trackWidth?: number;
  /** Array of colors for gradient progression */
  gradient?: string[];
  /** Custom track color (inactive portion) */
  trackColor?: string;
  /** Animation duration in milliseconds */
  duration?: number;
  /** Center content */
  children?: React.ReactNode;
}

export function CircularProgress({
  value,
  max,
  size = 200,
  trackWidth = 12,
  gradient = ['#30D158', '#FFD60A', '#FF9F0A', '#FF453A', '#BF5AF2'], // UV gradient
  trackColor,
  duration = 1000,
  children,
}: CircularProgressProps) {
  const colors = useColors();
  const progress = useSharedValue(0);

  const radius = (size - trackWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const centerX = size / 2;
  const centerY = size / 2;

  // Animate progress when value changes
  useEffect(() => {
    progress.value = withTiming(value / max, {
      duration,
      easing: Easing.bezier(0.4, 0.0, 0.2, 1.0),  // Material emphasized easing
    });
  }, [value, max, duration]);

  // Animated props for the progress circle
  const animatedProps = useAnimatedProps(() => {
    const strokeDashoffset = circumference * (1 - progress.value);
    return {
      strokeDashoffset,
    };
  });

  // Calculate gradient color based on current progress
  const getGradientColor = (progressValue: number): string => {
    if (gradient.length === 0) return colors.primary;
    if (gradient.length === 1) return gradient[0];

    // Map progress (0-1) to gradient array index
    const position = progressValue * (gradient.length - 1);
    const index = Math.floor(position);
    const nextIndex = Math.min(index + 1, gradient.length - 1);

    // If exactly on a color stop, return that color
    if (position === index) {
      return gradient[index];
    }

    // Otherwise, interpolate between two colors (simple approach: just use nearest)
    // For a full gradient ring, you'd need SVG linearGradient or more complex interpolation
    return gradient[Math.min(Math.round(position), gradient.length - 1)];
  };

  const strokeColor = getGradientColor(value / max);
  const defaultTrackColor = trackColor || colors.surfaceVariant;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        {/* Background track (inactive portion) */}
        <Circle
          cx={centerX}
          cy={centerY}
          r={radius}
          stroke={defaultTrackColor}
          strokeWidth={trackWidth}
          fill="transparent"
        />

        {/* Animated progress circle */}
        <AnimatedCircle
          cx={centerX}
          cy={centerY}
          r={radius}
          stroke={strokeColor}
          strokeWidth={trackWidth}
          strokeDasharray={circumference}
          strokeDashoffset={circumference}  // Start hidden
          strokeLinecap="round"
          fill="transparent"
          animatedProps={animatedProps}
          rotation="-90"
          origin={`${centerX}, ${centerY}`}
        />
      </Svg>

      {/* Center content */}
      {children && (
        <View style={styles.centerContent}>
          {children}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContent: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
