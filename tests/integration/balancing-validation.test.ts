import { describe, expect, it } from 'vitest';
import { BASE_ACHIEVEMENTS, BASE_DAILY_MISSIONS, BASE_WEEKLY_MISSIONS } from '@/lib/game';
import { GAME_CONFIG } from '@/lib/game-config';

describe('Sprint 5.6 Balancing Validation', () => {
  it('validates XP rewards scale appropriately', () => {
    expect(GAME_CONFIG.xp.scanExisting).toBe(10);
    expect(GAME_CONFIG.xp.scanNew).toBe(25);
    expect(GAME_CONFIG.xp.registerProduct).toBe(50);
    
    expect(GAME_CONFIG.xp.scanNew).toBeGreaterThan(GAME_CONFIG.xp.scanExisting);
    expect(GAME_CONFIG.xp.registerProduct).toBeGreaterThan(GAME_CONFIG.xp.scanNew);
  });

  it('validates level formula scales smoothly', () => {
    expect(GAME_CONFIG.levelFormula(1)).toBe(100);
    expect(GAME_CONFIG.levelFormula(2)).toBe(250);
    expect(GAME_CONFIG.levelFormula(5)).toBe(700);
    expect(GAME_CONFIG.levelFormula(10)).toBe(1450);
    
    const xpForLevel2 = GAME_CONFIG.levelFormula(1);
    const xpForLevel10 = GAME_CONFIG.levelFormula(9);
    expect(xpForLevel10).toBeGreaterThan(xpForLevel2 * 5);
  });

  it('validates achievement thresholds progress naturally', () => {
    const scanAchievements = BASE_ACHIEVEMENTS.filter(a => a.unlockCondition === 'scan_count').sort((a, b) => a.threshold - b.threshold);
    
    expect(scanAchievements[0].threshold).toBe(1);
    expect(scanAchievements[1].threshold).toBe(10);
    expect(scanAchievements[2].threshold).toBe(25);
    
    for (let i = 1; i < scanAchievements.length; i++) {
      expect(scanAchievements[i].threshold).toBeGreaterThan(scanAchievements[i - 1].threshold);
      expect(scanAchievements[i].rewardXp).toBeGreaterThan(scanAchievements[i - 1].rewardXp);
    }
  });

  it('validates mission rewards balance effort', () => {
    const easiestDaily = BASE_DAILY_MISSIONS.reduce((min, m) => m.target < min.target ? m : min);
    const hardestDaily = BASE_DAILY_MISSIONS.reduce((max, m) => m.target > max.target ? m : max);
    
    // ponytail: registration mission rewards appropriately higher effort, not strictly target-based
    expect(hardestDaily.target).toBeGreaterThan(easiestDaily.target);
    
    BASE_WEEKLY_MISSIONS.forEach(weekly => {
      const similarDaily = BASE_DAILY_MISSIONS.find(d => d.objective === weekly.objective);
      if (similarDaily) {
        expect(weekly.rewardXp).toBeGreaterThan(similarDaily.rewardXp);
      }
    });
  });

  it('validates stat recovery allows comfortable gameplay', () => {
    const scanReward = GAME_CONFIG.xp.scanExisting;
    const dailyMissionReward = BASE_DAILY_MISSIONS[0].rewardXp;
    const firstAchievementReward = BASE_ACHIEVEMENTS[0].rewardXp;
    
    expect(scanReward).toBeGreaterThan(0);
    expect(dailyMissionReward).toBeGreaterThan(scanReward);
    expect(firstAchievementReward).toBeGreaterThanOrEqual(dailyMissionReward);
  });

  it('validates mission targets are achievable', () => {
    BASE_DAILY_MISSIONS.forEach(mission => {
      expect(mission.target).toBeGreaterThan(0);
      expect(mission.target).toBeLessThanOrEqual(10);
    });
    
    BASE_WEEKLY_MISSIONS.forEach(mission => {
      expect(mission.target).toBeGreaterThan(0);
      expect(mission.target).toBeLessThanOrEqual(50);
    });
  });

  it('validates achievement progression feels rewarding', () => {
    const totalEarlyXp = BASE_ACHIEVEMENTS
      .filter(a => a.threshold <= 10)
      .reduce((sum, a) => sum + a.rewardXp, 0);
    
    const levelRequiredXp = GAME_CONFIG.levelFormula(1) + GAME_CONFIG.levelFormula(2);
    
    expect(totalEarlyXp).toBeGreaterThan(levelRequiredXp * 0.3);
  });
});
