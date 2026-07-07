import { describe, it, expect } from 'vitest';
import {
  calculateStreakMultiplier,
  applyStreakMultiplier,
  getStreakMilestone,
  getMilestoneBadgeText,
} from '@/lib/streak-multiplier';

describe('Streak Multiplier System', () => {
  describe('calculateStreakMultiplier', () => {
    it('should return 1.0x for 0 streak', () => {
      expect(calculateStreakMultiplier(0)).toBe(1.0);
    });

    it('should calculate multiplier as 1 + (streak * 0.1)', () => {
      expect(calculateStreakMultiplier(1)).toBe(1.1);
      expect(calculateStreakMultiplier(5)).toBe(1.5);
      expect(calculateStreakMultiplier(10)).toBe(2.0);
    });

    it('should cap multiplier at 2.5x', () => {
      expect(calculateStreakMultiplier(15)).toBe(2.5);
      expect(calculateStreakMultiplier(20)).toBe(2.5);
      expect(calculateStreakMultiplier(100)).toBe(2.5);
    });

    it('should reach 2.5x at streak of 15', () => {
      // 1 + (15 * 0.1) = 2.5
      expect(calculateStreakMultiplier(15)).toBe(2.5);
    });
  });

  describe('applyStreakMultiplier', () => {
    it('should apply 1.0x multiplier for 0 streak', () => {
      expect(applyStreakMultiplier(100, 0)).toBe(100);
    });

    it('should apply multiplier correctly', () => {
      // 100 XP * 1.5x = 150 XP
      expect(applyStreakMultiplier(100, 5)).toBe(150);
    });

    it('should floor the result', () => {
      // 100 XP * 1.1x = 110 XP
      expect(applyStreakMultiplier(100, 1)).toBe(110);

      // 99 XP * 1.1x = 108.9 -> 108
      expect(applyStreakMultiplier(99, 1)).toBe(108);
    });

    it('should apply maximum multiplier of 2.5x', () => {
      expect(applyStreakMultiplier(100, 15)).toBe(250);
      expect(applyStreakMultiplier(100, 100)).toBe(250);
    });

    it('should handle zero XP', () => {
      expect(applyStreakMultiplier(0, 10)).toBe(0);
    });

    it('should handle large XP values', () => {
      // 10000 XP * 2.0x = 20000 XP
      expect(applyStreakMultiplier(10000, 10)).toBe(20000);
    });
  });

  describe('getStreakMilestone', () => {
    it('should return null for streaks below 7', () => {
      expect(getStreakMilestone(0)).toBeNull();
      expect(getStreakMilestone(1)).toBeNull();
      expect(getStreakMilestone(6)).toBeNull();
    });

    it('should identify 7-day milestone', () => {
      expect(getStreakMilestone(7)).toBe(7);
      expect(getStreakMilestone(8)).toBe(7);
      expect(getStreakMilestone(29)).toBe(7);
    });

    it('should identify 30-day milestone', () => {
      expect(getStreakMilestone(30)).toBe(30);
      expect(getStreakMilestone(31)).toBe(30);
      expect(getStreakMilestone(99)).toBe(30);
    });

    it('should identify 100-day milestone', () => {
      expect(getStreakMilestone(100)).toBe(100);
      expect(getStreakMilestone(101)).toBe(100);
      expect(getStreakMilestone(364)).toBe(100);
    });

    it('should identify 365-day milestone', () => {
      expect(getStreakMilestone(365)).toBe(365);
      expect(getStreakMilestone(366)).toBe(365);
      expect(getStreakMilestone(1000)).toBe(365);
    });

    it('should return highest milestone', () => {
      // 7 is highest for 7-10 days
      expect(getStreakMilestone(10)).toBe(7);
      // 30 is highest for 30-99 days
      expect(getStreakMilestone(50)).toBe(30);
      // 100 is highest for 100-364 days
      expect(getStreakMilestone(200)).toBe(100);
      // 365 is highest for 365+ days
      expect(getStreakMilestone(500)).toBe(365);
    });
  });

  describe('getMilestoneBadgeText', () => {
    it('should return empty string for null milestone', () => {
      expect(getMilestoneBadgeText(null)).toBe('');
    });

    it('should return 7-day badge text', () => {
      expect(getMilestoneBadgeText(7)).toBe('🔥 7-Day Streak!');
    });

    it('should return 30-day badge text', () => {
      expect(getMilestoneBadgeText(30)).toBe('🔥🔥 30-Day Streak!');
    });

    it('should return 100-day badge text', () => {
      expect(getMilestoneBadgeText(100)).toBe('🔥🔥🔥 100-Day Streak!');
    });

    it('should return 365-day badge text', () => {
      expect(getMilestoneBadgeText(365)).toBe('👑 365-Day Legend!');
    });

    it('should return empty string for invalid milestone', () => {
      expect(getMilestoneBadgeText(50 as any)).toBe('');
    });
  });
});
