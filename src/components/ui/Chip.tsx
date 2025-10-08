/**
 * Material 3 Chip Component
 * Supports all M3 chip variants: assist, filter, input, suggestion
 *
 * Design principles:
 * - Tonal elevation for depth (no shadows)
 * - State layers for interaction feedback
 * - Emphasized easing for motion
 * - Accessibility-first (labels, roles)
 *
 * @see https://m3.material.io/components/chips/overview
 *
 * @example
 * ```typescript
 * // Filter chip
 * <Chip
 *   type="filter"
 *   label="Sunny"
 *   icon="sun"
 *   selected={filter === 'sunny'}
 *   onPress={() => setFilter('sunny')}
 * />
 *
 * // Input chip with delete
 * <Chip
 *   type="input"
 *   label="High UV"
 *   onDelete={() => removeTag('high-uv')}
 * />
 * ```
 */

import React from 'react';
import { Pressable, StyleSheet, View, Platform } from 'react-native';
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

const { spacing, borderRadius } = tokens;

type ChipType = 'assist' | 'filter' | 'input' | 'suggestion';
type ChipSize = 'small' | 'medium';

export interface ChipProps {
  /** Chip variant */
  type: ChipType;
  /** Chip label text */
  label: string;
  /** Icon name (Ionicons) */
  icon?: keyof typeof Ionicons.glyphMap;
  /** Selected state (for filter/assist chips) */
  selected?: boolean;
  /** Chip size */
  size?: ChipSize;
  /** Press handler */
  onPress?: () => void;
  /** Delete handler (for input chips only) */
  onDelete?: () => void;
  /** Disabled state */
  disabled?: boolean;
}

export function Chip({
  type,
  label,
  icon,
  selected = false,
  size = 'medium',
  onPress,
  onDelete,
  disabled = false,
}: ChipProps) {
  const colors = useColors();
  const { trigger } = useHaptics();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(scale.value, { damping: 15, stiffness: 200 }) }],
  }));

  const handlePressIn = () => {
    scale.value = 0.95;
    if (!disabled) {
      trigger('light');
    }
  };

  const handlePressOut = () => {
    scale.value = 1.0;
  };

  const chipStyles = getChipStyles(type, selected, size, colors);
  const iconSize = size === 'small' ? 16 : 18;

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || !onPress}
        style={({ pressed }) => [
          chipStyles.container,
          pressed && chipStyles.pressed,
          disabled && chipStyles.disabled,
        ]}
        accessibilityRole="button"
        accessibilityLabel={`${type} chip: ${label}${selected ? ', selected' : ''}`}
        accessibilityState={{ selected, disabled }}
      >
        {icon && (
          <Ionicons
            name={icon}
            size={iconSize}
            color={chipStyles.iconColor}
            style={styles.icon}
          />
        )}

        <Text
          variant={size === 'small' ? 'caption' : 'body2'}
          style={{ color: chipStyles.textColor, fontWeight: '500' }}
        >
          {label}
        </Text>

        {/* Input chip delete button */}
        {type === 'input' && onDelete && !disabled && (
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              trigger('light');
              onDelete();
            }}
            hitSlop={8}
            accessibilityLabel={`Remove ${label} chip`}
            accessibilityRole="button"
            style={styles.deleteButton}
          >
            <Ionicons
              name="close"
              size={iconSize}
              color={chipStyles.iconColor}
            />
          </Pressable>
        )}
      </Pressable>
    </Animated.View>
  );
}

/**
 * Helper function to get chip styling based on type and state
 */
function getChipStyles(
  type: ChipType,
  selected: boolean,
  size: ChipSize,
  colors: any
) {
  const baseStyles = {
    container: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      paddingHorizontal: size === 'small' ? spacing.sm : spacing.md,
      paddingVertical: size === 'small' ? 6 : 8,
      borderRadius: size === 'small' ? borderRadius.sm : borderRadius.md,
      gap: size === 'small' ? 4 : 6,
    },
    pressed: {
      opacity: 0.8,
    },
    disabled: {
      opacity: 0.38,
    },
  };

  // Type-specific styles following Material Design 3 specifications
  const typeStyles = {
    assist: {
      backgroundColor: selected ? colors.secondaryContainer : colors.surface,
      borderWidth: selected ? 0 : 1,
      borderColor: colors.outline,
      textColor: selected ? colors.onSecondaryContainer : colors.onSurface,
      iconColor: selected ? colors.secondary : colors.onSurfaceVariant,
    },
    filter: {
      backgroundColor: selected ? colors.secondaryContainer : 'transparent',
      borderWidth: 1,
      borderColor: selected ? 'transparent' : colors.outline,
      textColor: selected ? colors.onSecondaryContainer : colors.onSurface,
      iconColor: selected ? colors.secondary : colors.onSurfaceVariant,
    },
    input: {
      backgroundColor: colors.surfaceVariant,
      borderWidth: 0,
      borderColor: undefined as string | undefined,  // No border for input chips
      textColor: colors.onSurfaceVariant,
      iconColor: colors.onSurfaceVariant,
    },
    suggestion: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colors.outline,
      textColor: colors.onSurface,
      iconColor: colors.onSurfaceVariant,
    },
  };

  const typeStyle = typeStyles[type];

  return {
    container: {
      ...baseStyles.container,
      backgroundColor: typeStyle.backgroundColor,
      borderWidth: typeStyle.borderWidth,
      ...(typeStyle.borderColor && { borderColor: typeStyle.borderColor }),  // Only add if defined
    },
    pressed: baseStyles.pressed,
    disabled: baseStyles.disabled,
    textColor: typeStyle.textColor,
    iconColor: typeStyle.iconColor,
  };
}

const styles = StyleSheet.create({
  icon: {
    marginRight: 2,
  },
  deleteButton: {
    marginLeft: 2,
    padding: 2,
  },
});
