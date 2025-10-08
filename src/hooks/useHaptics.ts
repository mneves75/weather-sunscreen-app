/**
 * useHaptics Hook
 *
 * Centralized haptic feedback management with platform detection
 * and graceful fallbacks for unsupported platforms
 *
 * @see https://docs.expo.dev/versions/latest/sdk/haptics/
 */

import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Haptic feedback types aligned with iOS/Android guidelines
 */
export type HapticType =
  | 'light'       // Light tap (button press, toggle)
  | 'medium'      // Medium tap (selection change, switch)
  | 'heavy'       // Heavy tap (important action)
  | 'success'     // Success feedback (completion, confirmation)
  | 'warning'     // Warning feedback (destructive action)
  | 'error'       // Error feedback (failure, invalid input)
  | 'selection';  // Selection feedback (picker, segmented control)

/**
 * Centralized haptic feedback hook
 *
 * @returns Object with trigger function
 *
 * @example
 * ```typescript
 * function MyButton() {
 *   const { trigger } = useHaptics();
 *
 *   return (
 *     <Pressable
 *       onPress={() => {
 *         trigger('light');
 *         handlePress();
 *       }}
 *     >
 *       <Text>Press Me</Text>
 *     </Pressable>
 *   );
 * }
 * ```
 */
export function useHaptics() {
  /**
   * Trigger haptic feedback
   *
   * @param type - Type of haptic feedback
   * @returns Promise that resolves when haptic completes
   */
  const trigger = async (type: HapticType): Promise<void> => {
    // Skip on web (no haptic support)
    if (Platform.OS === 'web') {
      return Promise.resolve();
    }

    try {
      switch (type) {
        case 'light':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;

        case 'medium':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;

        case 'heavy':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;

        case 'success':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;

        case 'warning':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          break;

        case 'error':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;

        case 'selection':
          await Haptics.selectionAsync();
          break;

        default:
          // Default to light impact for unknown types
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (error) {
      // Graceful fallback if haptics fail
      // (e.g., device doesn't support haptics)
      console.warn('Haptic feedback failed:', error);
    }
  };

  return { trigger };
}

/**
 * Convenience hook for button press haptics
 *
 * @returns Press handler with haptic feedback
 *
 * @example
 * ```typescript
 * function MyButton({ onPress }: { onPress: () => void }) {
 *   const handlePress = useButtonHaptic(onPress);
 *
 *   return <Pressable onPress={handlePress}><Text>Press</Text></Pressable>;
 * }
 * ```
 */
export function useButtonHaptic(onPress?: () => void) {
  const { trigger } = useHaptics();

  return async () => {
    await trigger('light');
    onPress?.();
  };
}

/**
 * Convenience hook for toggle/switch haptics
 *
 * @returns Toggle handler with haptic feedback
 *
 * @example
 * ```typescript
 * function MySwitch({ value, onChange }: SwitchProps) {
 *   const handleToggle = useToggleHaptic(onChange);
 *
 *   return <Switch value={value} onValueChange={handleToggle} />;
 * }
 * ```
 */
export function useToggleHaptic(onChange?: (value: boolean) => void) {
  const { trigger } = useHaptics();

  return async (value: boolean) => {
    await trigger('medium');
    onChange?.(value);
  };
}

/**
 * Convenience hook for selection haptics (pickers, segmented controls)
 *
 * @returns Selection handler with haptic feedback
 */
export function useSelectionHaptic<T>(onSelect?: (value: T) => void) {
  const { trigger } = useHaptics();

  return async (value: T) => {
    await trigger('selection');
    onSelect?.(value);
  };
}
