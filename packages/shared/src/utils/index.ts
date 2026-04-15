import { DAYS_OF_WEEK } from '../constants';

/**
 * Format a date string to a readable format
 */
export function formatDate(date: string | Date, format: 'short' | 'long' | 'time' = 'short'): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Invalid date';

  switch (format) {
    case 'long':
      return d.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    case 'time':
      return d.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    default:
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
  }
}

/**
 * Format a date range (e.g., "Sep 1 - 5, 2024" or "Sep 1 - Oct 5, 2024")
 */
export function formatDateRange(
  start: string | Date,
  end: string | Date,
  format: 'short' | 'long' = 'short'
): string {
  const startDate = new Date(start);
  const endDate = new Date(end);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return 'Invalid date range';
  }

  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric'
  };

  if (format === 'long' || startDate.getFullYear() !== endDate.getFullYear()) {
    options.year = 'numeric';
  }

  const startStr = startDate.toLocaleDateString('en-US', options);
  const endStr = endDate.toLocaleDateString('en-US', options);

  return `${startStr} - ${endStr}`;
}

/**
 * Format a time range (e.g., "09:00 AM - 10:30 AM")
 */
export function formatTimeRange(start: string | Date, end: string | Date): string {
  const startDate = new Date(start);
  const endDate = new Date(end);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return 'Invalid time range';
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return `${formatTime(startDate)} - ${formatTime(endDate)}`;
}

/**
 * Convert ISO date string to date only (YYYY-MM-DD)
 */
export function toDateOnly(date: string | Date): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  return d.toISOString().split('T')[0];
}

/**
 * Parse time string (HH:MM) to minutes since midnight
 */
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Convert minutes since midnight to time string (HH:MM)
 */
export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/**
 * Check if two time ranges overlap
 * @param start1 Start time of first range in minutes
 * @param end1 End time of first range in minutes
 * @param start2 Start time of second range in minutes
 * @param end2 End time of second range in minutes
 */
export function timesOverlap(
  start1: number,
  end1: number,
  start2: number,
  end2: number
): boolean {
  return start1 < end2 && start2 < end1;
}

/**
 * Check if a date falls on a specific day of week
 * @param date Date to check
 * @param dayOfWeek Day of week (0=Sunday, 1=Monday, ..., 6=Saturday)
 */
export function isDateOnDay(date: string | Date, dayOfWeek: number): boolean {
  const d = new Date(date);
  return d.getDay() === dayOfWeek;
}

/**
 * Get all dates between two dates (inclusive)
 */
export function getDatesInRange(startDate: string | Date, endDate: string | Date): string[] {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const dates: string[] = [];

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return dates;
  }

  const current = new Date(start);
  current.setHours(0, 0, 0, 0);

  while (current <= end) {
    dates.push(current.toISOString().split('T')[0]!);
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

/**
 * Get occurrences of a recurring schedule based on rrule
 * Simple implementation for common patterns
 */
export function getRecurringOccurrences(
  startDate: string,
  endDate: string,
  recurrenceRule?: string
): string[] {
  // For now, return all dates in range if recurring
  // Full implementation would parse RRULE
  if (!recurrenceRule) {
    return getDatesInRange(startDate, endDate);
  }

  // Parse simple weekly recurrence: "FREQ=WEEKLY;INTERVAL=1;BYDAY=MO,WE,FR"
  const occurrences: string[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (recurrenceRule.includes('FREQ=WEEKLY')) {
    const dayMatch = recurrenceRule.match(/BYDAY=([A-Z,]+)/);
    if (dayMatch) {
      const days = dayMatch[1].split(',').map(day => {
        const dayMap: Record<string, number> = {
          SU: 0, MO: 1, TU: 2, WE: 3, TH: 4, FR: 5, SA: 6
        };
        return dayMap[day] ?? 0;
      });

      const current = new Date(start);
      current.setHours(0, 0, 0, 0);

      while (current <= end) {
        if (days.includes(current.getDay())) {
          occurrences.push(current.toISOString().split('T')[0]!);
        }
        current.setDate(current.getDate() + 1);
      }
    }
  }

  return occurrences;
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) +
         Math.random().toString(36).substring(2, 15);
}

/**
 * Debounce a function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Slugify a string (lowercase, hyphens, alphanumeric only)
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number, suffix: string = '...'): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * Convert file size to human readable
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
