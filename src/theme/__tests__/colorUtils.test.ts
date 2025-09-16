import { applyOpacity } from '../colorUtils';

describe('applyOpacity', () => {
  it('converts long hex to rgba with provided alpha', () => {
    expect(applyOpacity('#336699', 0.5)).toBe('rgba(51, 102, 153, 0.5)');
  });

  it('supports short hex values', () => {
    expect(applyOpacity('#abc', 0.25)).toBe('rgba(170, 187, 204, 0.25)');
  });

  it('clamps alpha between 0 and 1', () => {
    expect(applyOpacity('#000000', -1)).toBe('rgba(0, 0, 0, 0)');
    expect(applyOpacity('#ffffff', 2)).toBe('rgba(255, 255, 255, 1)');
  });
});
