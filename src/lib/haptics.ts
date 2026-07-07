/**
 * Haptic Feedback Utility
 * Provides tactile feedback for user interactions
 */

export const haptics = {
  /**
   * Light tap - For subtle interactions (button hovers, tab switches)
   */
  light: () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(10);
      } catch (e) {
        // Silently fail if vibration not supported
      }
    }
  },

  /**
   * Medium tap - For important actions (pet clicks, feed actions)
   */
  medium: () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(20);
      } catch (e) {
        // Silently fail
      }
    }
  },

  /**
   * Heavy impact - For major events (level ups, evolutions)
   */
  heavy: () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([30, 10, 30]);
      } catch (e) {
        // Silently fail
      }
    }
  },

  /**
   * Success pattern - For achievements and completions
   */
  success: () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([10, 50, 10, 50, 10]);
      } catch (e) {
        // Silently fail
      }
    }
  },

  /**
   * Error pattern - For failures and warnings
   */
  error: () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([100, 50, 100]);
      } catch (e) {
        // Silently fail
      }
    }
  },

  /**
   * Notification - For alerts and reminders
   */
  notification: () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([30, 20, 30, 20, 30]);
      } catch (e) {
        // Silently fail
      }
    }
  },
};

/**
 * Check if haptics are supported
 */
export const isHapticsSupported = (): boolean => {
  return typeof window !== 'undefined' && 'vibrate' in navigator;
};
