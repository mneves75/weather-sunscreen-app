/**
 * Helpers for UV Index bar coloring and gradients.
 *
 * Aligns to Apple system colors defined in theme tokens.
 */

import { tokens } from '@/src/theme/tokens';

type UVColorKey = 'uvLow' | 'uvModerate' | 'uvHigh' | 'uvVeryHigh' | 'uvExtreme';

const UV_THRESHOLDS: Array<{ max: number; key: UVColorKey }> = [
  { max: 2, key: 'uvLow' },
  { max: 5, key: 'uvModerate' },
  { max: 7, key: 'uvHigh' },
  { max: 10, key: 'uvVeryHigh' },
  { max: Number.POSITIVE_INFINITY, key: 'uvExtreme' },
];

/**
 * Determine the UV color bucket for a given value.
 */
function resolveColorKey(value: number): UVColorKey {
  for (const threshold of UV_THRESHOLDS) {
    if (value <= threshold.max) {
      return threshold.key;
    }
  }
  return 'uvExtreme';
}

/**
 * Get Apple system color for the UV bar (light & dark themes).
 */
export function getUVBarColor(value: number): { light: string; dark: string } {
  const colorKey = resolveColorKey(value);
  return {
    light: tokens.colors.light[colorKey],
    dark: tokens.colors.dark[colorKey],
  };
}

/**
 * Get gradient stops up to the current UV value for smooth transitions.
 */
export function getUVBarGradient(value: number): { light: string[]; dark: string[] } {
  const colorKeys: UVColorKey[] = [];

  for (const threshold of UV_THRESHOLDS) {
    colorKeys.push(threshold.key);
    if (value <= threshold.max) {
      break;
    }
  }

  if (colorKeys.length === 0) {
    colorKeys.push('uvLow');
  }

  return {
    light: colorKeys.map(key => tokens.colors.light[key]),
    dark: colorKeys.map(key => tokens.colors.dark[key]),
  };
}
