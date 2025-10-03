/**
 * Skeleton Loader components with shimmer animation
 * Replaces LoadingSpinner with content-aware skeletons
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { MotiView } from 'moti';
import { Skeleton } from 'moti/skeleton';
import { useColors, useThemeTokens } from '@/src/theme';

interface SkeletonBoxProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function SkeletonBox({ width = '100%', height = 20, borderRadius = 8, style }: SkeletonBoxProps) {
  const colors = useColors();

  return (
    <Skeleton
      width={width}
      height={height}
      radius={borderRadius}
      colorMode={colors.text === '#F9FAFB' ? 'dark' : 'light'}
    />
  );
}

interface SkeletonCircleProps {
  size?: number;
  style?: ViewStyle;
}

export function SkeletonCircle({ size = 40, style }: SkeletonCircleProps) {
  const colors = useColors();

  return (
    <Skeleton
      width={size}
      height={size}
      radius="round"
      colorMode={colors.text === '#F9FAFB' ? 'dark' : 'light'}
    />
  );
}

// Weather Card Skeleton
export function WeatherCardSkeleton() {
  const { spacing } = useThemeTokens();

  return (
    <View style={[styles.card, { padding: spacing.lg, gap: spacing.md }]}>
      {/* Location */}
      <SkeletonBox width={150} height={24} />

      {/* Temperature and icon */}
      <View style={[styles.row, { gap: spacing.md }]}>
        <SkeletonCircle size={80} />
        <View style={{ flex: 1, gap: spacing.xs }}>
          <SkeletonBox width="60%" height={48} />
          <SkeletonBox width="80%" height={20} />
        </View>
      </View>

      {/* Metrics */}
      <View style={[styles.row, { gap: spacing.sm }]}>
        <SkeletonBox width="30%" height={60} />
        <SkeletonBox width="30%" height={60} />
        <SkeletonBox width="30%" height={60} />
      </View>
    </View>
  );
}

// UV Index Skeleton
export function UVCardSkeleton() {
  const { spacing } = useThemeTokens();

  return (
    <View style={[styles.card, { padding: spacing.lg, gap: spacing.md, alignItems: 'center' }]}>
      <SkeletonBox width={120} height={24} />
      <SkeletonCircle size={120} />
      <SkeletonBox width={180} height={20} />
      <SkeletonBox width="100%" height={12} borderRadius={6} />
    </View>
  );
}

// Message List Item Skeleton
export function MessageSkeleton() {
  const { spacing } = useThemeTokens();

  return (
    <View style={[styles.messageItem, { padding: spacing.md, gap: spacing.xs }]}>
      <View style={[styles.row, { gap: spacing.sm }]}>
        <SkeletonCircle size={40} />
        <View style={{ flex: 1, gap: spacing.xxs }}>
          <SkeletonBox width="70%" height={18} />
          <SkeletonBox width="50%" height={14} />
        </View>
      </View>
      <SkeletonBox width="90%" height={16} />
    </View>
  );
}

// Forecast List Item Skeleton
export function ForecastSkeleton() {
  const { spacing } = useThemeTokens();

  return (
    <View style={[styles.forecastItem, { padding: spacing.md, gap: spacing.xs }]}>
      <View style={[styles.row, { justifyContent: 'space-between' }]}>
        <SkeletonBox width={80} height={20} />
        <SkeletonBox width={60} height={20} />
      </View>
      <View style={[styles.row, { gap: spacing.md }]}>
        <SkeletonCircle size={32} />
        <View style={{ flex: 1, gap: spacing.xxs }}>
          <SkeletonBox width="60%" height={16} />
          <SkeletonBox width="40%" height={12} />
        </View>
      </View>
    </View>
  );
}

// Generic Card Content Skeleton
export function CardContentSkeleton({ lines = 3 }: { lines?: number }) {
  const { spacing } = useThemeTokens();

  return (
    <View style={{ gap: spacing.sm }}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonBox
          key={i}
          width={i === lines - 1 ? '70%' : '100%'}
          height={16}
        />
      ))}
    </View>
  );
}

// Full Screen Loading Skeleton
export function ScreenLoadingSkeleton({ variant = 'weather' }: { variant?: 'weather' | 'uv' | 'messages' | 'forecast' }) {
  const { spacing } = useThemeTokens();

  return (
    <View style={[styles.screenContainer, { padding: spacing.lg, gap: spacing.lg }]}>
      {variant === 'weather' && (
        <>
          <WeatherCardSkeleton />
          <UVCardSkeleton />
          <View style={[styles.row, { gap: spacing.sm }]}>
            <SkeletonBox width="48%" height={48} borderRadius={24} />
            <SkeletonBox width="48%" height={48} borderRadius={24} />
          </View>
        </>
      )}

      {variant === 'uv' && (
        <>
          <UVCardSkeleton />
          <CardContentSkeleton lines={4} />
        </>
      )}

      {variant === 'messages' && (
        <>
          {Array.from({ length: 5 }).map((_, i) => (
            <MessageSkeleton key={i} />
          ))}
        </>
      )}

      {variant === 'forecast' && (
        <>
          {Array.from({ length: 7 }).map((_, i) => (
            <ForecastSkeleton key={i} />
          ))}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  messageItem: {
    borderRadius: 16,
  },
  forecastItem: {
    borderRadius: 16,
  },
  screenContainer: {
    flex: 1,
  },
});
