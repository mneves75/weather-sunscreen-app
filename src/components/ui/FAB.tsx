/**
 * Floating Action Button (FAB) - Material Design 3
 *
 * Supports all M3 FAB variants:
 * - Small FAB (40dp, compact spaces)
 * - Standard FAB (56dp, default)
 * - Large FAB (96dp, hero actions)
 * - Extended FAB (with label, variable width)
 *
 * @see https://m3.material.io/components/floating-action-button/overview
 *
 * @example
 * ```typescript
 * // Standard FAB
 * <FAB
 *   icon="add"
 *   onPress={handleCreate}
 * />
 *
 * // Extended FAB with label
 * <FAB
 *   icon="compose"
 *   label="New Message"
 *   onPress={handleCompose}
 *   extended
 * />
 * ```
 */

import React from 'react';
import { Pressable, StyleSheet, Platform } from 'react-native';
import { Text } from './Text';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/src/theme/theme';
import Animated, {
  useSharedValue,
  withSpring,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { useHaptics } from '@/src/hooks/useHaptics';
import { tokens } from '@/src/theme/tokens';

const { spacing, shadow } = tokens;

type FABSize = 'small' | 'medium' | 'large';

export interface FABProps {
  /** Icon name (Ionicons) */
  icon: keyof typeof Ionicons.glyphMap;
  /** Optional label (makes it an extended FAB) */
  label?: string;
  /** Press handler */
  onPress: () => void;
  /** FAB size (small, medium, large) */
  size?: FABSize;
  /** Extended FAB (shows label) */
  extended?: boolean;
  /** Disabled state */
  disabled?: boolean;
}

export function FAB({
  icon,
  label,
  onPress,
  size = 'medium',
  extended = false,
  disabled = false,
}: FABProps) {
  const colors = useColors();
  const { trigger } = useHaptics();
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: withSpring(scale.value, { damping: 12, stiffness: 150 }) },
      { rotate: `${withSpring(rotation.value)}deg` },
    ],
  }));

  const handlePressIn = () => {
    scale.value = 0.9;
    rotation.value = 15;
    if (!disabled) {
      trigger('medium');
    }
  };

  const handlePressOut = () => {
    scale.value = 1.0;
    rotation.value = 0;
  };

  const handlePress = () => {
    if (!disabled) {
      onPress();
    }
  };

  const isExtended = extended || !!label;
  const sizeStyles = getFABSizeStyles(size, isExtended);
  const iconSize = size === 'small' ? 20 : size === 'large' ? 32 : 24;

  return (
    <Animated.View style={[styles.fabContainer, animatedStyle]}>
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={({ pressed }) => [
          styles.fab,
          sizeStyles.container,
          {
            backgroundColor: colors.primary,
            ...shadow.lg,
          },
          pressed && styles.pressed,
          disabled && styles.disabled,
        ]}
        accessibilityRole="button"
        accessibilityLabel={label || `Action button with ${icon} icon`}
        accessibilityState={{ disabled }}
      >
        <Ionicons
          name={icon}
          size={iconSize}
          color={colors.onPrimary}
        />

        {isExtended && label && (
          <Text
            variant="body2"
            style={{
              color: colors.onPrimary,
              fontWeight: '600',
              marginLeft: spacing.sm,
            }}
          >
            {label}
          </Text>
        )}
      </Pressable>
    </Animated.View>
  );
}

/**
 * Get FAB size-specific styles
 */
function getFABSizeStyles(size: FABSize, extended: boolean) {
  const sizeMap = {
    small: {
      container: {
        width: extended ? undefined : 40,
        height: 40,
        paddingHorizontal: extended ? spacing.md : 0,
        borderRadius: extended ? 12 : 12,
      },
    },
    medium: {
      container: {
        width: extended ? undefined : 56,
        height: 56,
        paddingHorizontal: extended ? spacing.lg : 0,
        borderRadius: extended ? 16 : 16,
      },
    },
    large: {
      container: {
        width: extended ? undefined : 96,
        height: 96,
        paddingHorizontal: extended ? spacing.xl : 0,
        borderRadius: extended ? 28 : 28,
      },
    },
  };

  return sizeMap[size];
}

const styles = StyleSheet.create({
  fabContainer: {
    // Container for animation
  },
  fab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    // Size, padding, borderRadius set dynamically
    // Background color, shadow set dynamically
  },
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.38,
  },
});
