/**
 * Regression test for useDaylight's getTodayKey.
 *
 * Bug: the key was built from date.toISOString() (UTC). For users west of UTC in the
 * evening this rolled the date forward a day, so the forecast-day lookup missed and
 * silently fell back to days[0] — showing sunrise/sunset/peak-UV for the wrong day.
 *
 * TZ is forced to a negative-offset zone so the UTC vs local difference is deterministic
 * regardless of where the test runs.
 */
process.env.TZ = 'America/New_York';

import { getTodayKey } from '../useDaylight';

describe('getTodayKey', () => {
  it('uses the LOCAL calendar day, not UTC', () => {
    // 23:30 local on Jan 15 in America/New_York is 04:30 UTC on Jan 16.
    // The old toISOString()-based implementation returned "2025-01-16" here.
    const lateEvening = new Date(2025, 0, 15, 23, 30, 0);
    expect(getTodayKey(lateEvening)).toBe('2025-01-15');
  });

  it('zero-pads month and day', () => {
    const early = new Date(2025, 2, 5, 9, 0, 0); // March 5
    expect(getTodayKey(early)).toBe('2025-03-05');
  });

  it('matches the local date components of the given date', () => {
    const d = new Date(2024, 11, 31, 12, 0, 0);
    const expected = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
      d.getDate(),
    ).padStart(2, '0')}`;
    expect(getTodayKey(d)).toBe(expected);
  });
});
