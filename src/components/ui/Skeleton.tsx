/**
 * Skeleton Loader Components
 * Content-aware loading placeholders with shimmer animation
 *
 * Design principles:
 * - Shimmer animation (smooth, subtle)
 * - Match content layout (rect, circle, text)
 * - Accessible (announces loading state)
 * - Performance-optimized (native driver)
 *
 * @example
 * ```typescript
 * // Weather card skeleton
 * <Skeleton>
 *   <Skeleton.Rect width="100%" height={200} borderRadius={20} />
 *   <Skeleton.Text width="60%" height={24} />
 *   <Skeleton.Text width="40%" height={16} />
 * </Skeleton>
 * ```
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  withRepeat,
  withTiming,
  useAnimatedStyle,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { useColors } from '@/src/theme/theme';
import { tokens } from '@/src/theme/tokens';
import { LinearGradient } from 'expo-linear-gradient';

const { spacing, borderRadius } = tokens;

interface SkeletonContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

/**
 * Skeleton Container
 * Wraps skeleton elements and provides shimmer animation
 */
export function Skeleton({ children, style }: SkeletonContainerProps) {
  return (
    <View
      style={[styles.container, style]}
      accessibilityLabel="Loading content"
      accessible
    >
      {children}
    </View>
  );
}

interface SkeletonRectProps {
  width: number | string;
  height: number;
  borderRadius?: number;
  style?: ViewStyle;
}

/**
 * Skeleton Rectangle
 * Rectangular placeholder with shimmer
 */
function SkeletonRect({
  width,
  height,
  borderRadius: customBorderRadius = borderRadius.md,
  style,
}: SkeletonRectProps) {
  const colors = useColors();
  const shimmerAnim = useSharedValue(-1);

  useEffect(() => {
    shimmerAnim.value = withRepeat(
      withTiming(1, {
        duration: 1500,
        easing: Easing.linear,
      }),
      -1,  // Infinite loop
      false
    );
  }, []);

  const shimmerStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      shimmerAnim.value,
      [-1, 1],
      [-200, 200]
    );

    return {
      transform: [{ translateX }],
    };
  });

  return (
    <View
      style={[
        styles.rect,
        {
          width,
          height,
          borderRadius: customBorderRadius,
          backgroundColor: colors.surfaceVariant,
        },
        style,
      ]}
    >
      <Animated.View style={[styles.shimmerOverlay, shimmerStyle]}>
        <LinearGradient
          colors={[
            'transparent',
            'rgba(255, 255, 255, 0.3)',
            'transparent',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.shimmerGradient}
        />
      </Animated.View>
    </View>
  );
}

interface SkeletonCircleProps {
  size: number;
  style?: ViewStyle;
}

/**
 * Skeleton Circle
 * Circular placeholder (for avatars, icons)
 */
function SkeletonCircle({ size, style }: SkeletonCircleProps) {
  return (
    <SkeletonRect
      width={size}
      height={size}
      borderRadius={size / 2}
      style={style}
    />
  );
}

interface SkeletonTextProps {
  width: number | string;
  height?: number;
  style?: ViewStyle;
}

/**
 * Skeleton Text
 * Text line placeholder
 */
function SkeletonText({ width, height = 16, style }: SkeletonTextProps) {
  return (
    <SkeletonRect
      width={width}
      height={height}
      borderRadius={borderRadius.sm}
      style={style}
    />
  );
}

// Attach sub-components to Skeleton
Skeleton.Rect = SkeletonRect;
Skeleton.Circle = SkeletonCircle;
Skeleton.Text = SkeletonText;

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  rect: {
    overflow: 'hidden',
    marginVertical: spacing.xxs,
  },
  shimmerOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  shimmerGradient: {
    flex: 1,
  },
});
