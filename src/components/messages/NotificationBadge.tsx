/**
 * Notification Badge Component
 * Displays unread message count with animations
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Text } from '@/src/components/ui';
import { useColors } from '@/src/theme/theme';

interface NotificationBadgeProps {
  count: number;
  maxCount?: number; // Show "99+" for counts over this
  size?: 'small' | 'medium' | 'large';
  showZero?: boolean; // Whether to show badge when count is 0
}

/**
 * Get badge size styles
 */
function getBadgeSize(size: 'small' | 'medium' | 'large') {
  switch (size) {
    case 'small':
      return { width: 16, height: 16, minWidth: 16 };
    case 'large':
      return { width: 24, height: 24, minWidth: 24 };
    case 'medium':
    default:
      return { width: 20, height: 20, minWidth: 20 };
  }
}

/**
 * Format count for display
 */
function formatCount(count: number, maxCount?: number): string {
  if (maxCount && count > maxCount) {
    return `${maxCount}+`;
  }
  return String(count);
}

export function NotificationBadge({
  count,
  maxCount = 99,
  size = 'medium',
  showZero = false,
}: NotificationBadgeProps) {
  const colors = useColors();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  // Animate badge appearance
  useEffect(() => {
    if (count > 0 || showZero) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [count, showZero, scaleAnim, opacityAnim]);

  // Don't render if count is 0 and showZero is false
  if (count === 0 && !showZero) {
    return null;
  }

  const badgeSize = getBadgeSize(size);
  const displayCount = formatCount(count, maxCount);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          ...badgeSize,
          backgroundColor: colors.error,
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        },
      ]}
      accessibilityRole="text"
      accessibilityLabel={`${count} unread messages`}
    >
      <Text
        variant="caption"
        style={[
          styles.text,
          {
            color: colors.onErrorContainer,
            fontSize: size === 'small' ? 10 : size === 'large' ? 14 : 12,
          },
        ]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.8}
      >
        {displayCount}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: -8,
    right: -8,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
    zIndex: 1,
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
});
