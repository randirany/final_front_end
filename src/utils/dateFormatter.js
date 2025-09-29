/**
 * Date formatting utilities for consistent English (EN) date display
 * This utility ensures all dates across the application use EN format
 */

// Configuration for consistent EN date formatting
const EN_DATE_CONFIG = {
  locale: 'en-US',
  calendar: 'gregory'
};

// Common date format options
const DATE_FORMAT_OPTIONS = {
  short: {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  },
  medium: {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  },
  long: {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  },
  dateTime: {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  },
  dateTimeWithSeconds: {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }
};

/**
 * Formats a date using English locale with specified format
 * @param {Date|string|number} date - Date to format
 * @param {string} format - Format type ('short', 'medium', 'long', 'dateTime', 'dateTimeWithSeconds')
 * @returns {string} - Formatted date string in EN format
 */
export const formatDateEN = (date, format = 'short') => {
  if (!date) return '';

  try {
    const dateObj = new Date(date);

    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return '';
    }

    const formatOptions = DATE_FORMAT_OPTIONS[format] || DATE_FORMAT_OPTIONS.short;

    return dateObj.toLocaleDateString(EN_DATE_CONFIG.locale, {
      ...formatOptions,
      calendar: EN_DATE_CONFIG.calendar
    });
  } catch (error) {
    console.warn('Date formatting error:', error);
    return '';
  }
};

/**
 * Formats a date to MM/DD/YYYY format (US standard)
 * @param {Date|string|number} date - Date to format
 * @returns {string} - Date in MM/DD/YYYY format
 */
export const formatDateUS = (date) => {
  return formatDateEN(date, 'short');
};

/**
 * Formats a date to ISO date string (YYYY-MM-DD)
 * @param {Date|string|number} date - Date to format
 * @returns {string} - Date in YYYY-MM-DD format
 */
export const formatDateISO = (date) => {
  if (!date) return '';

  try {
    const dateObj = new Date(date);

    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return '';
    }

    return dateObj.toISOString().slice(0, 10);
  } catch (error) {
    console.warn('Date formatting error:', error);
    return '';
  }
};

/**
 * Formats a date to readable medium format (e.g., "Jan 15, 2024")
 * @param {Date|string|number} date - Date to format
 * @returns {string} - Date in medium format
 */
export const formatDateMedium = (date) => {
  return formatDateEN(date, 'medium');
};

/**
 * Formats a date to readable long format (e.g., "January 15, 2024")
 * @param {Date|string|number} date - Date to format
 * @returns {string} - Date in long format
 */
export const formatDateLong = (date) => {
  return formatDateEN(date, 'long');
};

/**
 * Formats a date with time in EN format (e.g., "01/15/2024, 14:30")
 * @param {Date|string|number} date - Date to format
 * @returns {string} - Date with time in EN format
 */
export const formatDateTimeEN = (date) => {
  return formatDateEN(date, 'dateTime');
};

/**
 * Formats a date with time including seconds in EN format (e.g., "01/15/2024, 14:30:25")
 * @param {Date|string|number} date - Date to format
 * @returns {string} - Date with time and seconds in EN format
 */
export const formatDateTimeWithSecondsEN = (date) => {
  return formatDateEN(date, 'dateTimeWithSeconds');
};

/**
 * Legacy function replacement for toLocaleDateString() calls
 * This replaces the inconsistent locale-based formatting throughout the app
 * @param {Date|string|number} date - Date to format
 * @param {string} format - Format type (default: 'short')
 * @returns {string} - Formatted date string in EN format
 */
export const toLocaleDateStringEN = (date, format = 'short') => {
  return formatDateEN(date, format);
};

/**
 * Legacy function replacement for toLocaleString() calls
 * This replaces the inconsistent locale-based datetime formatting throughout the app
 * @param {Date|string|number} date - Date to format
 * @returns {string} - Formatted datetime string in EN format
 */
export const toLocaleStringEN = (date) => {
  return formatDateTimeEN(date);
};

/**
 * Validates if a date string is valid
 * @param {Date|string|number} date - Date to validate
 * @returns {boolean} - True if date is valid, false otherwise
 */
export const isValidDate = (date) => {
  if (!date) return false;

  try {
    const dateObj = new Date(date);
    return !isNaN(dateObj.getTime());
  } catch (error) {
    return false;
  }
};

/**
 * Checks if a date is in the future
 * @param {Date|string|number} date - Date to check
 * @returns {boolean} - True if date is in the future, false otherwise
 */
export const isFutureDate = (date) => {
  if (!isValidDate(date)) return false;

  const dateObj = new Date(date);
  const today = new Date();
  return dateObj > today;
};

/**
 * Checks if a date is in the past
 * @param {Date|string|number} date - Date to check
 * @returns {boolean} - True if date is in the past, false otherwise
 */
export const isPastDate = (date) => {
  if (!isValidDate(date)) return false;

  const dateObj = new Date(date);
  const today = new Date();
  return dateObj < today;
};

/**
 * Gets the current date in ISO format (YYYY-MM-DD)
 * @returns {string} - Current date in ISO format
 */
export const getCurrentDateISO = () => {
  return formatDateISO(new Date());
};

/**
 * Gets the current date in EN format
 * @param {string} format - Format type (default: 'short')
 * @returns {string} - Current date in specified EN format
 */
export const getCurrentDateEN = (format = 'short') => {
  return formatDateEN(new Date(), format);
};

// Export all formatting functions as default
export default {
  formatDateEN,
  formatDateUS,
  formatDateISO,
  formatDateMedium,
  formatDateLong,
  formatDateTimeEN,
  formatDateTimeWithSecondsEN,
  toLocaleDateStringEN,
  toLocaleStringEN,
  isValidDate,
  isFutureDate,
  isPastDate,
  getCurrentDateISO,
  getCurrentDateEN
};