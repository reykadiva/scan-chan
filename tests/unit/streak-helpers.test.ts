import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  hasScannedToday,
  getStreakStatus,
  calculateNewStreak,
  getStreakWarningMessage,
  getHoursUntilMidnight,
  getTodayString,
} from '@/lib/streak-helpers';
import { applyStreakMultiplier } from '@/lib/streak-multiplier';

describe('Streak Helper Functions', () => {
  describe('hasScannedToday', () => {
    it('should return false if lastActiveDate is null', () => {
      expect(hasScannedToday(null, '2026-07-07')).toBe(false);
    });

    it('should return true if lastActiveDate matches today', () => {
      expect(hasScannedToday('2026-07-07', '2026-07-07')).toBe(true);
    });

    it('should return false if lastActiveDate is different', () => {
      expect(hasScannedToday('2026-07-06', '2026-07-07')).toBe(false);
      expect(hasScannedToday('2026-07-08', '2026-07-07')).toBe(false);
    });
  });

  describe('getStreakStatus', () => {
    it('should return "new" if lastActiveDate is null', () => {
      expect(getStreakStatus(null, '2026-07-07', 0)).toBe('new');
    });

    it('should return "continue" if lastActiveDate is today', () => {
      expect(getStreakStatus('2026-07-07', '2026-07-07', 5)).toBe('continue');
    });

    it('should return "continue" if user scanned yesterday', () => {
      expect(getStreakStatus('2026-07-06', '2026-07-07', 5)).toBe('continue');
    });

    it('should return "broke" if user missed 1 day', () => {
      expect(getStreakStatus('2026-07-05', '2026-07-07', 5)).toBe('broke');
    });

    it('should return "broke" if user missed multiple days', () => {
      expect(getStreakStatus('2026-07-01', '2026-07-07', 5)).toBe('broke');
    });

    it('should handle year boundaries', () => {
      // Dec 31 to Jan 1 = 1 day gap
      expect(getStreakStatus('2025-12-31', '2026-01-01', 5)).toBe('continue');
      // Dec 30 to Jan 1 = 2 day gap
      expect(getStreakStatus('2025-12-30', '2026-01-01', 5)).toBe('broke');
    });
  });

  describe('calculateNewStreak', () => {
    it('should return 1 for "new" status', () => {
      expect(calculateNewStreak(0, 'new')).toBe(1);
      expect(calculateNewStreak(5, 'new')).toBe(1);
    });

    it('should increment streak for "continue" status', () => {
      expect(calculateNewStreak(1, 'continue')).toBe(2);
      expect(calculateNewStreak(5, 'continue')).toBe(6);
      expect(calculateNewStreak(100, 'continue')).toBe(101);
    });

    it('should reset to 1 for "broke" status', () => {
      expect(calculateNewStreak(5, 'broke')).toBe(1);
      expect(calculateNewStreak(100, 'broke')).toBe(1);
    });
  });

  describe('getStreakWarningMessage', () => {
    it('should return warning for less than 1 hour left', () => {
      const message = getStreakWarningMessage(0.5);
      expect(message).toContain('⚠️ Streak at risk!');
      expect(message).toContain('minutes');
    });

    it('should return warning for 1 hour left', () => {
      const message = getStreakWarningMessage(1);
      expect(message).toContain('⚠️ Streak at risk!');
    });

    it('should return warning for 2 hours left', () => {
      const message = getStreakWarningMessage(2);
      expect(message).toContain("Don't forget to scan today");
      expect(message).toContain('hours left');
    });

    it('should return warning for 3 hours left', () => {
      const message = getStreakWarningMessage(3);
      expect(message).toContain("Don't forget to scan today");
      expect(message).toContain('hours left');
    });

    it('should return empty string for 4+ hours left', () => {
      expect(getStreakWarningMessage(4)).toBe('');
      expect(getStreakWarningMessage(10)).toBe('');
      expect(getStreakWarningMessage(24)).toBe('');
    });
  });

  describe('getHoursUntilMidnight', () => {
    beforeEach(() => {
      // Mock current time to 10 AM on July 7, 2026
      const mockDate = new Date('2026-07-07T10:00:00');
      vi.useFakeTimers();
      vi.setSystemTime(mockDate);
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should return positive hours remaining', () => {
      const hours = getHoursUntilMidnight();
      expect(hours).toBeGreaterThan(0);
      expect(hours).toBeLessThanOrEqual(24);
    });

    it('should return approximately 14 hours at 10 AM', () => {
      const hours = getHoursUntilMidnight();
      // 10 AM to midnight = 14 hours
      expect(hours).toBeCloseTo(14, 0);
    });
  });

  describe('getTodayString', () => {
    beforeEach(() => {
      // Mock current time to July 7, 2026
      const mockDate = new Date('2026-07-07T15:30:45');
      vi.useFakeTimers();
      vi.setSystemTime(mockDate);
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should return today in YYYY-MM-DD format', () => {
      const today = getTodayString();
      expect(today).toBe('2026-07-07');
    });

    it('should pad month and day with zeros', () => {
      const today = getTodayString();
      const parts = today.split('-');
      expect(parts).toHaveLength(3);
      expect(parts[0]).toHaveLength(4); // year
      expect(parts[1]).toHaveLength(2); // month
      expect(parts[2]).toHaveLength(2); // day
    });

    it('should return consistent value for same date', () => {
      const today1 = getTodayString();
      const today2 = getTodayString();
      expect(today1).toBe(today2);
    });
  });

  describe('Streak lifecycle integration', () => {
    it('should handle complete streak lifecycle', () => {
      // Day 1: First scan
      expect(getStreakStatus(null, '2026-07-07', 0)).toBe('new');
      expect(calculateNewStreak(0, 'new')).toBe(1);

      // Day 2: Continue streak
      expect(getStreakStatus('2026-07-07', '2026-07-08', 1)).toBe('continue');
      expect(calculateNewStreak(1, 'continue')).toBe(2);

      // Day 3: Missed a day - streak breaks
      expect(getStreakStatus('2026-07-07', '2026-07-09', 2)).toBe('broke');
      expect(calculateNewStreak(2, 'broke')).toBe(1);

      // Day 4: Restart streak
      expect(getStreakStatus('2026-07-09', '2026-07-10', 1)).toBe('continue');
      expect(calculateNewStreak(1, 'continue')).toBe(2);
    });

    it('should calculate correct XP with multiplier through streak', () => {
      const baseXp = 100;
      const streaks = [0, 1, 5, 10, 15, 20];

      const results = streaks.map((s) => applyStreakMultiplier(baseXp, s));

      // Verify ascending XP with cap at 2.5x
      expect(results[0]).toBe(100); // 1.0x
      expect(results[1]).toBe(110); // 1.1x
      expect(results[2]).toBe(150); // 1.5x
      expect(results[3]).toBe(200); // 2.0x
      expect(results[4]).toBe(250); // 2.5x (capped)
      expect(results[5]).toBe(250); // 2.5x (capped)
    });
  });
});
