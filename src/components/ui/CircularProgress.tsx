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
 * import { UV_GRADIENT } from '@/src/utils';
 *
 * <CircularProgress
 *   value={8}
 *   max={11}
 *   size={200}
 *   trackWidth={12}
 *   gradient={UV_GRADIENT}
 * >
 *   <Text variant="5xl" fontWeight="700">8</Text>
 *   <Text variant="body1">Very High</Text>
 * </CircularProgress>
 * ```
 */

import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedProps,
  Easing,
} from 'react-native-reanimated';
import { useColors } from '@/src/theme/theme';
import { UV_GRADIENT } from '@/src/utils';

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
  /**
   * Array of colors for gradient progression
   * Accepts both mutable and readonly arrays for flexibility with constants
   */
  gradient?: readonly string[];
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
  gradient = UV_GRADIENT, // UV gradient - single source of truth from utils
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

  const defaultTrackColor = trackColor || colors.surfaceVariant;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Defs>
          {/* True SVG linear gradient with evenly spaced color stops */}
          {/* For UV_GRADIENT = ['#30D158', '#FFD60A', '#FF9F0A', '#FF453A', '#BF5AF2'] */}
          {/* This creates smooth color transitions: Low(green) → Moderate(yellow) → High(orange) → Very High(red) → Extreme(purple) */}
          <LinearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            {gradient.map((color, index) => {
              // Distribute stops evenly across the gradient (0%, 25%, 50%, 75%, 100%)
              const offset = gradient.length > 1 ? (index / (gradient.length - 1)) * 100 : 0;
              return (
                <Stop
                  key={`stop-${index}`}
                  offset={`${offset}%`}
                  stopColor={color}
                  stopOpacity="1"
                />
              );
            })}
          </LinearGradient>
        </Defs>

        {/* Background track (inactive portion) */}
        <Circle
          cx={centerX}
          cy={centerY}
          r={radius}
          stroke={defaultTrackColor}
          strokeWidth={trackWidth}
          fill="transparent"
        />

        {/* Animated progress circle with true gradient stroke */}
        <AnimatedCircle
          cx={centerX}
          cy={centerY}
          r={radius}
          stroke="url(#progressGradient)"
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
