export function appendAlpha(hexColor: string, alpha01: number): string {
  const hex = hexColor.replace('#', '');
  const base = hex.length === 8 ? hex.slice(0, 6) : hex.slice(0, 6);
  const clamped = Math.max(0, Math.min(1, alpha01));
  const aa = Math.round(255 * clamped)
    .toString(16)
    .padStart(2, '0')
    .toUpperCase();
  return `#${base}${aa}`;
}
