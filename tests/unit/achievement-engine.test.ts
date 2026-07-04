import { describe, expect, it } from 'vitest';
import { checkAchievementUnlock, checkAllAchievements, BASE_ACHIEVEMENTS } from '@/lib/game';
import type { AchievementProgress } from '@/types/achievement';

describe('Achievement Engine', () => {
  it('unlocks achievement when threshold reached', () => {
    const achievement = BASE_ACHIEVEMENTS[0];
    const result = checkAchievementUnlock(achievement, { scanCount: 1, registerCount: 0, level: 1, streak: 0 }, null);
    
    expect(result.unlocked).toBe(true);
    expect(result.progress).toBe(1);
  });

  it('does not unlock achievement when threshold not reached', () => {
    const achievement = BASE_ACHIEVEMENTS[1];
    const result = checkAchievementUnlock(achievement, { scanCount: 5, registerCount: 0, level: 1, streak: 0 }, null);
    
    expect(result.unlocked).toBe(false);
    expect(result.progress).toBe(5);
  });

  it('does not unlock already unlocked achievement', () => {
    const achievement = BASE_ACHIEVEMENTS[0];
    const current: AchievementProgress = { key: 'first_scan', unlockedAt: 1000, progress: 1 };
    const result = checkAchievementUnlock(achievement, { scanCount: 10, registerCount: 0, level: 1, streak: 0 }, current);
    
    expect(result.unlocked).toBe(false);
  });

  it('tracks progress for scan_count achievements', () => {
    const achievement = BASE_ACHIEVEMENTS[1];
    const result = checkAchievementUnlock(achievement, { scanCount: 7, registerCount: 0, level: 1, streak: 0 }, null);
    
    expect(result.progress).toBe(7);
    expect(result.unlocked).toBe(false);
  });

  it('tracks progress for register_count achievements', () => {
    const achievement = BASE_ACHIEVEMENTS[5];
    const result = checkAchievementUnlock(achievement, { scanCount: 0, registerCount: 1, level: 1, streak: 0 }, null);
    
    expect(result.progress).toBe(1);
    expect(result.unlocked).toBe(true);
  });

  it('tracks progress for level achievements', () => {
    const achievement = BASE_ACHIEVEMENTS[7];
    const result = checkAchievementUnlock(achievement, { scanCount: 0, registerCount: 0, level: 5, streak: 0 }, null);
    
    expect(result.progress).toBe(5);
    expect(result.unlocked).toBe(true);
  });

  it('tracks progress for streak achievements', () => {
    const achievement = BASE_ACHIEVEMENTS[10];
    const result = checkAchievementUnlock(achievement, { scanCount: 0, registerCount: 0, level: 1, streak: 3 }, null);
    
    expect(result.progress).toBe(3);
    expect(result.unlocked).toBe(true);
  });

  it('checks all achievements and returns unlocked keys', () => {
    const input = { scanCount: 10, registerCount: 1, level: 5, streak: 3 };
    const currentProgress = new Map<string, AchievementProgress>();
    
    const result = checkAllAchievements(BASE_ACHIEVEMENTS, input, currentProgress);
    
    expect(result.unlocked).toContain('first_scan');
    expect(result.unlocked).toContain('explorer');
    expect(result.unlocked).toContain('first_register');
    expect(result.unlocked).toContain('level_5');
    expect(result.unlocked).toContain('streak_3');
    expect(result.unlocked).not.toContain('collector');
  });

  it('does not return already unlocked achievements', () => {
    const input = { scanCount: 10, registerCount: 1, level: 5, streak: 3 };
    const currentProgress = new Map<string, AchievementProgress>([
      ['first_scan', { key: 'first_scan', unlockedAt: 1000, progress: 1 }],
      ['explorer', { key: 'explorer', unlockedAt: 2000, progress: 10 }],
    ]);
    
    const result = checkAllAchievements(BASE_ACHIEVEMENTS, input, currentProgress);
    
    expect(result.unlocked).not.toContain('first_scan');
    expect(result.unlocked).not.toContain('explorer');
    expect(result.unlocked).toContain('first_register');
  });

  it('updates progress for all achievements', () => {
    const input = { scanCount: 15, registerCount: 2, level: 7, streak: 5 };
    const currentProgress = new Map<string, AchievementProgress>();
    
    const result = checkAllAchievements(BASE_ACHIEVEMENTS, input, currentProgress);
    
    expect(result.progress.get('first_scan')).toBe(15);
    expect(result.progress.get('explorer')).toBe(15);
    expect(result.progress.get('collector')).toBe(15);
    expect(result.progress.get('first_register')).toBe(2);
    expect(result.progress.get('level_5')).toBe(7);
    expect(result.progress.get('streak_3')).toBe(5);
  });
});
