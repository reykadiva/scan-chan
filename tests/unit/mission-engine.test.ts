import { describe, expect, it } from 'vitest';
import { generateMissions, updateMissionProgress, updateAllMissions, pruneExpiredMissions, BASE_DAILY_MISSIONS, BASE_WEEKLY_MISSIONS } from '@/lib/game';
import type { MissionState } from '@/types/mission';

const DAY_MS = 86400000;

describe('Mission Engine', () => {
  it('generates daily missions when none exist', () => {
    const now = Date.parse('2026-07-04T12:00:00.000Z');
    const result = generateMissions(BASE_DAILY_MISSIONS, BASE_WEEKLY_MISSIONS, { now, dailyCount: 2, weeklyCount: 1, existingMissions: [] });
    
    const dailies = result.filter(m => m.type === 'daily');
    const weeklies = result.filter(m => m.type === 'weekly');
    
    expect(dailies.length).toBe(2);
    expect(weeklies.length).toBe(1);
  });

  it('does not generate new missions when limit reached', () => {
    const now = Date.parse('2026-07-04T12:00:00.000Z');
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    
    const existing: MissionState[] = [
      { id: 'daily-1', type: 'daily', name: 'Test', description: 'Test', objective: 'scan_any', target: 3, progress: 0, rewardXp: 50, completed: false, startedAt: startOfDay.getTime(), expiresAt: startOfDay.getTime() + DAY_MS },
      { id: 'daily-2', type: 'daily', name: 'Test', description: 'Test', objective: 'scan_any', target: 5, progress: 0, rewardXp: 75, completed: false, startedAt: startOfDay.getTime(), expiresAt: startOfDay.getTime() + DAY_MS },
    ];
    
    const result = generateMissions(BASE_DAILY_MISSIONS, BASE_WEEKLY_MISSIONS, { now, dailyCount: 2, weeklyCount: 0, existingMissions: existing });
    
    expect(result.length).toBe(2);
  });

  it('updates mission progress for scan_any objective', () => {
    const mission: MissionState = { id: 'mission-1', type: 'daily', name: 'Scan 3', description: 'Test', objective: 'scan_any', target: 3, progress: 0, rewardXp: 50, completed: false, startedAt: 0, expiresAt: DAY_MS };
    const result = updateMissionProgress(mission, { scanCount: 2, registerCount: 0, scannedCategories: [], visitedToday: false });
    
    expect(result.progress).toBe(2);
    expect(result.completed).toBe(false);
  });

  it('completes mission when target reached', () => {
    const mission: MissionState = { id: 'mission-1', type: 'daily', name: 'Scan 3', description: 'Test', objective: 'scan_any', target: 3, progress: 0, rewardXp: 50, completed: false, startedAt: 0, expiresAt: DAY_MS };
    const result = updateMissionProgress(mission, { scanCount: 3, registerCount: 0, scannedCategories: [], visitedToday: false });
    
    expect(result.progress).toBe(3);
    expect(result.completed).toBe(true);
  });

  it('does not update already completed mission', () => {
    const mission: MissionState = { id: 'mission-1', type: 'daily', name: 'Scan 3', description: 'Test', objective: 'scan_any', target: 3, progress: 3, rewardXp: 50, completed: true, startedAt: 0, expiresAt: DAY_MS };
    const result = updateMissionProgress(mission, { scanCount: 5, registerCount: 0, scannedCategories: [], visitedToday: false });
    
    expect(result.progress).toBe(3);
    expect(result.completed).toBe(true);
  });

  it('updates mission progress for register_any objective', () => {
    const mission: MissionState = { id: 'mission-1', type: 'daily', name: 'Register', description: 'Test', objective: 'register_any', target: 1, progress: 0, rewardXp: 100, completed: false, startedAt: 0, expiresAt: DAY_MS };
    const result = updateMissionProgress(mission, { scanCount: 0, registerCount: 1, scannedCategories: [], visitedToday: false });
    
    expect(result.progress).toBe(1);
    expect(result.completed).toBe(true);
  });

  it('updates mission progress for scan_category objective', () => {
    const mission: MissionState = { id: 'mission-1', type: 'daily', name: 'Variety', description: 'Test', objective: 'scan_category', target: 3, progress: 0, rewardXp: 75, completed: false, startedAt: 0, expiresAt: DAY_MS };
    const result = updateMissionProgress(mission, { scanCount: 0, registerCount: 0, scannedCategories: ['snack', 'drink'], visitedToday: false });
    
    expect(result.progress).toBe(2);
    expect(result.completed).toBe(false);
  });

  it('updates all missions in batch', () => {
    const missions: MissionState[] = [
      { id: 'mission-1', type: 'daily', name: 'Scan 3', description: 'Test', objective: 'scan_any', target: 3, progress: 0, rewardXp: 50, completed: false, startedAt: 0, expiresAt: DAY_MS },
      { id: 'mission-2', type: 'daily', name: 'Register', description: 'Test', objective: 'register_any', target: 1, progress: 0, rewardXp: 100, completed: false, startedAt: 0, expiresAt: DAY_MS },
    ];
    
    const result = updateAllMissions(missions, { scanCount: 3, registerCount: 1, scannedCategories: [], visitedToday: false });
    
    expect(result[0].completed).toBe(true);
    expect(result[1].completed).toBe(true);
  });

  it('prunes expired missions', () => {
    const now = Date.parse('2026-07-04T12:00:00.000Z');
    const missions: MissionState[] = [
      { id: 'mission-1', type: 'daily', name: 'Active', description: 'Test', objective: 'scan_any', target: 3, progress: 0, rewardXp: 50, completed: false, startedAt: now - DAY_MS, expiresAt: now + DAY_MS },
      { id: 'mission-2', type: 'daily', name: 'Expired', description: 'Test', objective: 'scan_any', target: 3, progress: 0, rewardXp: 50, completed: false, startedAt: now - DAY_MS * 2, expiresAt: now - DAY_MS },
    ];
    
    const result = pruneExpiredMissions(missions, now);
    
    expect(result.length).toBe(1);
    expect(result[0].id).toBe('mission-1');
  });
});
