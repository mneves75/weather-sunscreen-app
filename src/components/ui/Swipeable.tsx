/**
 * Swipeable component for Messages with swipe-to-delete and swipe-to-action
 * Uses react-native-gesture-handler
 */

import React, { useMemo, useRef } from 'react';
import { View, StyleSheet, Animated, TouchableOpacity, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Icon } from './Icon';
import { Text } from './Text';
import { useColors, useThemeTokens } from '@/src/theme';
import { hasGestureHandlerModule } from '@/src/utils/nativeAvailability';

type GestureSwipeableType = typeof import('react-native-gesture-handler').Swipeable | null;

let cachedSwipeable: GestureSwipeableType | undefined;
let hasLoggedGestureWarning = false;

function getGestureSwipeable(): GestureSwipeableType {
  if (cachedSwipeable !== undefined) {
    return cachedSwipeable;
  }

  if (!hasGestureHandlerModule()) {
    cachedSwipeable = null;
    return cachedSwipeable;
  }

  try {
    const { Swipeable } = require('react-native-gesture-handler');
    cachedSwipeable = Swipeable as GestureSwipeableType;
  } catch (error) {
    if (__DEV__ && !hasLoggedGestureWarning) {
      console.warn('[Swipeable] react-native-gesture-handler unavailable, using static fallback.', error);
      hasLoggedGestureWarning = true;
    }
    cachedSwipeable = null;
  }

  return cachedSwipeable;
}

interface SwipeAction {
  label: string;
  icon?: 'check' | 'delete' | 'edit' | 'share' | 'bell';
  backgroundColor: string;
  onPress: () => void;
}

interface SwipeableProps {
  children: React.ReactNode;
  rightActions?: SwipeAction[];
  leftActions?: SwipeAction[];
  haptic?: boolean;
}

export function Swipeable({
  children,
  rightActions = [],
  leftActions = [],
  haptic = true,
}: SwipeableProps) {
  const GestureSwipeable = useMemo(() => getGestureSwipeable(), []);
  const swipeableRef = useRef<any>(null);
  const colors = useColors();
  const { spacing } = useThemeTokens();

  const handleActionPress = (action: SwipeAction) => {
    if (haptic && Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    action.onPress();
    if (GestureSwipeable) {
      swipeableRef.current?.close();
    }
  };

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    if (rightActions.length === 0) return null;

    return (
      <View style={styles.actionsContainer}>
        {rightActions.map((action, index) => {
          const trans = dragX.interpolate({
            inputRange: [-80 * (rightActions.length - index), -80 * (rightActions.length - index - 1)],
            outputRange: [0, 80],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              key={index}
              style={[
                styles.action,
                {
                  transform: [{ translateX: trans }],
                },
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  { backgroundColor: action.backgroundColor },
                ]}
                onPress={() => handleActionPress(action)}
              >
                {action.icon && (
                  <Icon
                    name={action.icon}
                    size={24}
                    color="#FFFFFF"
                  />
                )}
                <Text variant="caption" style={styles.actionText}>
                  {action.label}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>
    );
  };

  const renderLeftActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    if (leftActions.length === 0) return null;

    return (
      <View style={styles.actionsContainer}>
        {leftActions.map((action, index) => {
          const trans = dragX.interpolate({
            inputRange: [80 * index, 80 * (index + 1)],
            outputRange: [-80, 0],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              key={index}
              style={[
                styles.action,
                {
                  transform: [{ translateX: trans }],
                },
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  { backgroundColor: action.backgroundColor },
                ]}
                onPress={() => handleActionPress(action)}
              >
                {action.icon && (
                  <Icon
                    name={action.icon}
                    size={24}
                    color="#FFFFFF"
                  />
                )}
                <Text variant="caption" style={styles.actionText}>
                  {action.label}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>
    );
  };

  if (!GestureSwipeable) {
    const fallbackActions = [...leftActions, ...rightActions];
    const hasFallbackActions = fallbackActions.length > 0;

    if (__DEV__ && !hasLoggedGestureWarning) {
      console.warn('[Swipeable] Gesture handler module not detected, rendering fallback actions.');
      hasLoggedGestureWarning = true;
    }

    return (
      <View style={styles.fallbackContainer}>
        <View>{children}</View>
        {hasFallbackActions && (
          <View
            style={[
              styles.fallbackActionsContainer,
              {
                paddingHorizontal: spacing.sm,
                paddingVertical: spacing.xs,
                gap: spacing.xs,
              },
            ]}
          >
            {fallbackActions.map((action, index) => (
              <TouchableOpacity
                key={`${action.label}-${index}`}
                style={[
                  styles.fallbackActionButton,
                  { backgroundColor: action.backgroundColor },
                ]}
                onPress={() => handleActionPress(action)}
                accessibilityRole="button"
                accessibilityLabel={action.label}
              >
                {action.icon && (
                  <Icon
                    name={action.icon}
                    size={18}
                    color="#FFFFFF"
                  />
                )}
                <Text variant="caption" style={styles.fallbackActionText}>
                  {action.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  }

  return (
    <GestureSwipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      renderLeftActions={renderLeftActions}
      overshootRight={false}
      overshootLeft={false}
      friction={2}
      rightThreshold={40}
      leftThreshold={40}
    >
      {children}
    </GestureSwipeable>
  );
}

const styles = StyleSheet.create({
  actionsContainer: {
    flexDirection: 'row',
  },
  action: {
    width: 80,
    justifyContent: 'center',
  },
  actionButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  actionText: {
    color: '#FFFFFF',
    marginTop: 4,
    fontSize: 12,
  },
  fallbackContainer: {
    overflow: 'hidden',
  },
  fallbackActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
  },
  fallbackActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  fallbackActionText: {
    color: '#FFFFFF',
    marginLeft: 6,
    fontWeight: '600',
  },
});
