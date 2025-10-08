/**
 * useDynamicFontSize Hook
 *
 * Provides Dynamic Type support for iOS, scaling fonts based on
 * user's accessibility settings (Settings → Display & Brightness → Text Size)
 *
 * @see https://developer.apple.com/design/human-interface-guidelines/typography
 */

import { useWindowDimensions } from 'react-native';

/**
 * Scale a base font size according to iOS accessibility settings
 *
 * @param baseSize - Base font size in pixels
 * @returns Scaled font size based on user's Dynamic Type settings
 *
 * @example
 * ```typescript
 * function MyComponent() {
 *   const fontSize = useDynamicFontSize(17);
 *
 *   return (
 *     <Text style={{ fontSize }}>
 *       This text scales with iOS accessibility settings
 *     </Text>
 *   );
 * }
 * ```
 */
export function useDynamicFontSize(baseSize: number): number {
  const { fontScale } = useWindowDimensions();

  // Apply font scale from accessibility settings
  // fontScale: 1.0 = default, 1.5 = larger text enabled, etc.
  const scaledSize = Math.round(baseSize * fontScale);

  // Cap at reasonable maximum to prevent layout issues
  // Apple recommends supporting up to 2x scaling (200%)
  const maxSize = baseSize * 2;
  return Math.min(scaledSize, maxSize);
}

/**
 * Scale multiple font sizes at once
 *
 * @param sizes - Object with named font sizes
 * @returns Object with scaled font sizes
 *
 * @example
 * ```typescript
 * const sizes = useDynamicFontSizes({
 *   title: 28,
 *   body: 17,
 *   caption: 13,
 * });
 * // sizes = { title: 42, body: 25.5, caption: 19.5 } (if user has 1.5x scale)
 * ```
 */
export function useDynamicFontSizes<T extends Record<string, number>>(
  sizes: T
): T {
  const { fontScale } = useWindowDimensions();

  const scaled = Object.entries(sizes).reduce((acc, [key, size]) => {
    const scaledSize = Math.round(size * fontScale);
    const maxSize = size * 2;
    acc[key as keyof T] = Math.min(scaledSize, maxSize) as T[keyof T];
    return acc;
  }, {} as T);

  return scaled;
}

/**
 * Get recommended line height for a given font size
 * Follows iOS Human Interface Guidelines ratios
 *
 * @param fontSize - Font size in pixels
 * @param tight - Use tighter line height for large display text
 * @returns Recommended line height
 */
export function getRecommendedLineHeight(
  fontSize: number,
  tight: boolean = false
): number {
  // iOS recommendations:
  // - Body text (15-17px): 1.4 ratio
  // - Large text (20-28px): 1.2 ratio
  // - Display text (34-76px): 1.1 ratio (tight)

  if (fontSize >= 34) {
    return Math.round(fontSize * (tight ? 1.1 : 1.2));
  }

  if (fontSize >= 20) {
    return Math.round(fontSize * 1.2);
  }

  return Math.round(fontSize * 1.4);
}
