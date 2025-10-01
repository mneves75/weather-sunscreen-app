/**
 * Date formatting and manipulation utilities
 */

/**
 * Format timestamp to time string (e.g., "2:30 PM")
 */
export function formatTime(timestamp: number, use24Hour: boolean = false): string {
  const date = new Date(timestamp);
  
  if (use24Hour) {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  }
  
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Format date to short date string (e.g., "Mon, Jan 15")
 */
export function formatShortDate(date: Date | string | number, locale: string = 'en'): string {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  
  return d.toLocaleDateString(locale, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format date to long date string (e.g., "Monday, January 15, 2024")
 */
export function formatLongDate(date: Date | string | number, locale: string = 'en'): string {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  
  return d.toLocaleDateString(locale, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Get day of week name
 */
export function getDayName(date: Date | string | number, locale: string = 'en', short: boolean = false): string {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  
  return d.toLocaleDateString(locale, {
    weekday: short ? 'short' : 'long',
  });
}

/**
 * Check if date is today
 */
export function isToday(date: Date | string | number): boolean {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  const today = new Date();
  
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  );
}

/**
 * Check if date is tomorrow
 */
export function isTomorrow(date: Date | string | number): boolean {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return (
    d.getDate() === tomorrow.getDate() &&
    d.getMonth() === tomorrow.getMonth() &&
    d.getFullYear() === tomorrow.getFullYear()
  );
}

/**
 * Get relative day label (Today, Tomorrow, or day name)
 */
export function getRelativeDayLabel(date: Date | string | number, locale: string = 'en'): string {
  if (isToday(date)) {
    return locale === 'pt-BR' ? 'Hoje' : 'Today';
  }
  
  if (isTomorrow(date)) {
    return locale === 'pt-BR' ? 'Amanhã' : 'Tomorrow';
  }
  
  return getDayName(date, locale, false);
}

/**
 * Format relative time (e.g., "5 minutes ago")
 */
export function formatRelativeTime(timestamp: number, locale: string = 'en'): string {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (locale === 'pt-BR') {
    if (seconds < 60) return 'agora mesmo';
    if (minutes < 60) return `${minutes} ${minutes === 1 ? 'minuto' : 'minutos'} atrás`;
    if (hours < 24) return `${hours} ${hours === 1 ? 'hora' : 'horas'} atrás`;
    return `${days} ${days === 1 ? 'dia' : 'dias'} atrás`;
  }
  
  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  if (hours < 24) return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  return `${days} ${days === 1 ? 'day' : 'days'} ago`;
}

/**
 * Parse ISO date string to Date
 */
export function parseISODate(dateString: string): Date {
  return new Date(dateString);
}

/**
 * Add days to date
 */
export function addDays(date: Date | string | number, days: number): Date {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/**
 * Get start of day
 */
export function startOfDay(date: Date | string | number): Date {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Get end of day
 */
export function endOfDay(date: Date | string | number): Date {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

