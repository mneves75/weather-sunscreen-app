import {
  calculateDaylightDuration,
  calculateSolarNoon,
  formatDaylightTime,
  formatTimeShort,
  getCurrentDaylightProgress,
  getSunAngle,
} from '../daylight';

describe('daylight utilities', () => {
  const sunrise = '2025-07-01T05:30:00-04:00';
  const sunset = '2025-07-01T20:15:00-04:00';

  it('calculates daylight duration in minutes', () => {
    expect(calculateDaylightDuration(sunrise, sunset)).toBe(885);
  });

  it('returns 0 duration for invalid ranges', () => {
    expect(calculateDaylightDuration(sunset, sunrise)).toBe(0);
  });

  it('calculates solar noon as midpoint ISO string', () => {
    const solarNoon = calculateSolarNoon(sunrise, sunset);
    const solarDate = new Date(solarNoon);
    expect(solarDate.toISOString()).toBe(solarNoon);
    expect(solarDate.getUTCHours()).toBeGreaterThan(14); // ~12:52 local -> ~16:52 UTC
  });

  it('formats daylight duration to human-readable string', () => {
    expect(formatDaylightTime(885)).toBe('14h 45m');
    expect(formatDaylightTime(60)).toBe('1h');
    expect(formatDaylightTime(45)).toBe('45m');
    expect(formatDaylightTime(-10)).toBe('0m');
  });

  it('formats ISO time to short string', () => {
    const expected = new Date(sunrise)
      .toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
      .replace(/\s/g, '')
      .toLowerCase();
    expect(formatTimeShort(sunrise)).toBe(expected);
  });

  it('calculates daylight progress clamped between 0 and 1', () => {
    const mid = new Date((new Date(sunrise).getTime() + new Date(sunset).getTime()) / 2);
    expect(getCurrentDaylightProgress(sunrise, sunset, mid)).toBeCloseTo(0.5, 2);
    expect(getCurrentDaylightProgress(sunrise, sunset, new Date(sunrise))).toBe(0);
    expect(getCurrentDaylightProgress(sunrise, sunset, new Date(sunset))).toBe(1);
  });

  it('computes sun angle in degrees', () => {
    const mid = new Date((new Date(sunrise).getTime() + new Date(sunset).getTime()) / 2);
    expect(getSunAngle(sunrise, sunrise, sunset)).toBe(0);
    expect(getSunAngle(sunset, sunrise, sunset)).toBe(180);
    expect(getSunAngle(mid, sunrise, sunset)).toBeCloseTo(90, 1);
  });
});
