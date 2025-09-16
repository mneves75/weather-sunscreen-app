const HEX_SHORT_LENGTH = 3;
const HEX_LONG_LENGTH = 6;

function normalizeHex(hex: string): string {
  const value = hex.trim().replace(/^#/, '');
  if (value.length === HEX_SHORT_LENGTH) {
    return value
      .split('')
      .map((char) => char + char)
      .join('');
  }
  if (value.length === HEX_LONG_LENGTH) {
    return value;
  }
  throw new Error(`Unsupported hex color: ${hex}`);
}

export function applyOpacity(hex: string, alpha: number): string {
  const normalized = normalizeHex(hex);
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  const clampedAlpha = Math.min(1, Math.max(0, alpha));
  return `rgba(${r}, ${g}, ${b}, ${clampedAlpha})`;
}

export type HexColor = string;
