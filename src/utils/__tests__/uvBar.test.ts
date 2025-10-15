import { getUVBarColor, getUVBarGradient } from '../uvBar';
import { tokens } from '@/src/theme/tokens';

describe('uvBar utilities', () => {
  it('returns correct color bucket for low UV values', () => {
    const color = getUVBarColor(2);
    expect(color.light).toBe(tokens.colors.light.uvLow);
    expect(color.dark).toBe(tokens.colors.dark.uvLow);
  });

  it('returns correct color bucket for extreme UV values', () => {
    const color = getUVBarColor(11);
    expect(color.light).toBe(tokens.colors.light.uvExtreme);
    expect(color.dark).toBe(tokens.colors.dark.uvExtreme);
  });

  it('returns gradient stops up to the current UV bucket', () => {
    const gradient = getUVBarGradient(8);
    expect(gradient.light).toEqual([
      tokens.colors.light.uvLow,
      tokens.colors.light.uvModerate,
      tokens.colors.light.uvHigh,
      tokens.colors.light.uvVeryHigh,
    ]);
    expect(gradient.dark).toEqual([
      tokens.colors.dark.uvLow,
      tokens.colors.dark.uvModerate,
      tokens.colors.dark.uvHigh,
      tokens.colors.dark.uvVeryHigh,
    ]);
  });
});
