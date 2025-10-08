/**
 * Color Blending Utilities
 * For Material Design 3 tonal elevation system
 *
 * @see https://m3.material.io/styles/elevation/overview
 */

/**
 * Parse hex color to RGB components
 * Supports #RGB, #RRGGBB, #RRGGBBAA formats
 */
function parseHexColor(hex: string): { r: number; g: number; b: number; a: number } {
  let cleaned = hex.replace('#', '');

  // Handle 3-digit hex (#RGB)
  if (cleaned.length === 3) {
    cleaned = cleaned.split('').map(c => c + c).join('');
  }

  // Handle 8-digit hex with alpha (#RRGGBBAA)
  let r: number, g: number, b: number, a = 1;

  if (cleaned.length === 8) {
    r = parseInt(cleaned.substring(0, 2), 16);
    g = parseInt(cleaned.substring(2, 4), 16);
    b = parseInt(cleaned.substring(4, 6), 16);
    a = parseInt(cleaned.substring(6, 8), 16) / 255;
  } else {
    r = parseInt(cleaned.substring(0, 2), 16);
    g = parseInt(cleaned.substring(2, 4), 16);
    b = parseInt(cleaned.substring(4, 6), 16);
  }

  return { r, g, b, a };
}

/**
 * Parse rgba/rgb color string to components
 */
function parseRgbaColor(rgba: string): { r: number; g: number; b: number; a: number } {
  const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);

  if (!match) {
    return { r: 0, g: 0, b: 0, a: 1 };
  }

  return {
    r: parseInt(match[1], 10),
    g: parseInt(match[2], 10),
    b: parseInt(match[3], 10),
    a: match[4] ? parseFloat(match[4]) : 1,
  };
}

/**
 * Blend two colors together
 *
 * Used for Material Design 3 tonal elevation:
 * Surface colors are blended with primary color at varying opacities
 * to create elevation without shadows
 *
 * @param baseColor - Base color (e.g., surface color)
 * @param overlayColor - Overlay color (e.g., primary color)
 * @param amount - Blend amount (0-1, where 0 = base only, 1 = overlay only)
 * @returns Blended color in rgba format
 *
 * @example
 * ```typescript
 * // Create tonal elevation for Material Design 3
 * const level1 = blend('#1C1C1E', '#0A84FF', 0.05); // +1dp elevation
 * const level2 = blend('#1C1C1E', '#0A84FF', 0.08); // +2dp elevation
 * ```
 */
export function blend(
  baseColor: string,
  overlayColor: string,
  amount: number
): string {
  // Clamp amount to 0-1 range
  const blendAmount = Math.max(0, Math.min(1, amount));

  // Parse colors
  let base: { r: number; g: number; b: number; a: number };
  let overlay: { r: number; g: number; b: number; a: number };

  if (baseColor.startsWith('#')) {
    base = parseHexColor(baseColor);
  } else if (baseColor.startsWith('rgb')) {
    base = parseRgbaColor(baseColor);
  } else {
    // Fallback for named colors or invalid input
    base = { r: 0, g: 0, b: 0, a: 1 };
  }

  if (overlayColor.startsWith('#')) {
    overlay = parseHexColor(overlayColor);
  } else if (overlayColor.startsWith('rgb')) {
    overlay = parseRgbaColor(overlayColor);
  } else {
    overlay = { r: 0, g: 0, b: 0, a: 1 };
  }

  // Linear interpolation for each channel
  const r = Math.round(base.r + (overlay.r - base.r) * blendAmount);
  const g = Math.round(base.g + (overlay.g - base.g) * blendAmount);
  const b = Math.round(base.b + (overlay.b - base.b) * blendAmount);
  const a = base.a + (overlay.a - base.a) * blendAmount;

  return `rgba(${r}, ${g}, ${b}, ${a.toFixed(2)})`;
}

/**
 * Get Material Design 3 tonal surface color for a given elevation level
 *
 * @param baseColor - Base surface color
 * @param primaryColor - Primary color to blend
 * @param elevation - Elevation level (0-5)
 * @returns Tonal surface color
 *
 * @example
 * ```typescript
 * const card = getTonalSurface('#1C1C1E', '#0A84FF', 2); // Level 2 elevation
 * ```
 */
export function getTonalSurface(
  baseColor: string,
  primaryColor: string,
  elevation: 0 | 1 | 2 | 3 | 4 | 5
): string {
  // Material Design 3 elevation overlay opacity values
  const opacityMap = {
    0: 0.00,   // Surface (no elevation)
    1: 0.05,   // +1dp
    2: 0.08,   // +2dp
    3: 0.11,   // +3dp
    4: 0.12,   // +4dp
    5: 0.14,   // +5dp
  };

  return blend(baseColor, primaryColor, opacityMap[elevation]);
}

/**
 * Lighten a color by a given amount
 *
 * @param color - Color to lighten
 * @param amount - Amount to lighten (0-1)
 * @returns Lightened color
 */
export function lighten(color: string, amount: number): string {
  return blend(color, '#FFFFFF', amount);
}

/**
 * Darken a color by a given amount
 *
 * @param color - Color to darken
 * @param amount - Amount to darken (0-1)
 * @returns Darkened color
 */
export function darken(color: string, amount: number): string {
  return blend(color, '#000000', amount);
}

/**
 * Add alpha transparency to a color
 *
 * @param color - Color to add transparency to
 * @param alpha - Alpha value (0-1)
 * @returns Color with alpha
 */
export function withAlpha(color: string, alpha: number): string {
  const clampedAlpha = Math.max(0, Math.min(1, alpha));

  if (color.startsWith('#')) {
    const parsed = parseHexColor(color);
    return `rgba(${parsed.r}, ${parsed.g}, ${parsed.b}, ${clampedAlpha.toFixed(2)})`;
  }

  if (color.startsWith('rgba')) {
    return color.replace(/[\d.]+\)$/g, `${clampedAlpha.toFixed(2)})`);
  }

  if (color.startsWith('rgb')) {
    const parsed = parseRgbaColor(color);
    return `rgba(${parsed.r}, ${parsed.g}, ${parsed.b}, ${clampedAlpha.toFixed(2)})`;
  }

  return color;
}
