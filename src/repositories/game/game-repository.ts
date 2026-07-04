import type { AchievementProgress } from '@/types/achievement';

export interface GameRepository {
  readonly domain: 'game';
  getAchievementProgress(userId: string): Promise<Record<string, AchievementProgress>>;
  saveAchievementProgress(userId: string, progress: Record<string, AchievementProgress>): Promise<void>;
}
