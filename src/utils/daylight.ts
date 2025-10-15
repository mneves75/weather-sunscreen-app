/**
 * Daylight calculation utilities
 *
 * Provides helper functions for sunrise/sunset formatting and daylight arc math.
 */

/**
 * Calculate daylight duration in minutes between sunrise and sunset.
 */
export function calculateDaylightDuration(sunriseIso: string, sunsetIso: string): number {
  const sunrise = new Date(sunriseIso).getTime();
  const sunset = new Date(sunsetIso).getTime();

  if (Number.isNaN(sunrise) || Number.isNaN(sunset) || sunset <= sunrise) {
    return 0;
  }

  const diffMs = sunset - sunrise;
  return Math.round(diffMs / (1000 * 60));
}

/**
 * Calculate solar noon ISO timestamp by averaging sunrise and sunset times.
 */
export function calculateSolarNoon(sunriseIso: string, sunsetIso: string): string {
  const sunrise = new Date(sunriseIso);
  const sunset = new Date(sunsetIso);

  if (Number.isNaN(sunrise.getTime()) || Number.isNaN(sunset.getTime()) || sunset <= sunrise) {
    return sunriseIso;
  }

  const midpoint = new Date((sunrise.getTime() + sunset.getTime()) / 2);
  return midpoint.toISOString();
}

/**
 * Format daylight duration (in minutes) to "12h 26m" style string.
 */
export function formatDaylightTime(minutes: number): string {
  if (!Number.isFinite(minutes) || minutes <= 0) {
    return '0m';
  }

  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);

  if (hours <= 0) {
    return `${mins}m`;
  }

  if (mins === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${mins}m`;
}

/**
 * Format an ISO timestamp into a short "5:45am" style string.
 */
export function formatTimeShort(isoString: string, locale: string = 'en-US'): string {
  const date = new Date(isoString);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const formatted = date.toLocaleTimeString(locale, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  return formatted.replace(/\s/g, '').toLowerCase();
}

/**
 * Get the progress (0-1) of the current time between sunrise and sunset.
 */
export function getCurrentDaylightProgress(
  sunriseIso: string,
  sunsetIso: string,
  now: Date | string = new Date()
): number {
  const sunrise = new Date(sunriseIso).getTime();
  const sunset = new Date(sunsetIso).getTime();
  const nowTime = typeof now === 'string' ? new Date(now).getTime() : now.getTime();

  if (
    Number.isNaN(sunrise) ||
    Number.isNaN(sunset) ||
    Number.isNaN(nowTime) ||
    sunset <= sunrise
  ) {
    return 0;
  }

  const total = sunset - sunrise;
  const elapsed = nowTime - sunrise;
  const progress = elapsed / total;

  if (progress <= 0) return 0;
  if (progress >= 1) return 1;
  return progress;
}

/**
 * Calculate the sun angle (degrees) for daylight arc visualization.
 * Returns angle in range [0, 180], where 0 = sunrise, 90 = solar noon, 180 = sunset.
 */
export function getSunAngle(
  time: Date | string,
  sunriseIso: string,
  sunsetIso: string
): number {
  const reference =
    typeof time === 'string' ? new Date(time).getTime() : time instanceof Date ? time.getTime() : NaN;

  if (Number.isNaN(reference)) {
    return 0;
  }

  const progress = getCurrentDaylightProgress(sunriseIso, sunsetIso, new Date(reference));
  return Math.max(0, Math.min(180, progress * 180));
}
