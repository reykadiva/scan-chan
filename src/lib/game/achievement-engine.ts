import type { AchievementDefinition } from '@/types/content';
import type { AchievementProgress, AchievementUnlockInput, AchievementUnlockResult } from '@/types/achievement';

export function checkAchievementUnlock(
  achievement: AchievementDefinition,
  input: AchievementUnlockInput,
  current: AchievementProgress | null
): { unlocked: boolean; progress: number } {
  if (current?.unlockedAt) return { unlocked: false, progress: achievement.threshold };

  let progress = 0;
  switch (achievement.unlockCondition) {
    case 'scan_count':
      progress = input.scanCount;
      break;
    case 'register_count':
      progress = input.registerCount;
      break;
    case 'level':
      progress = input.level;
      break;
    case 'streak':
      progress = input.streak;
      break;
    default:
      return { unlocked: false, progress: 0 };
  }

  return { unlocked: progress >= achievement.threshold, progress };
}

export function checkAllAchievements(
  achievements: readonly AchievementDefinition[],
  input: AchievementUnlockInput,
  currentProgress: ReadonlyMap<string, AchievementProgress>
): AchievementUnlockResult {
  const unlocked: string[] = [];
  const progress = new Map<string, number>();

  for (const achievement of achievements) {
    const current = currentProgress.get(achievement.key) ?? null;
    const result = checkAchievementUnlock(achievement, input, current);
    
    progress.set(achievement.key, result.progress);
    if (result.unlocked && !current?.unlockedAt) {
      unlocked.push(achievement.key);
    }
  }

  return { unlocked, progress };
}
