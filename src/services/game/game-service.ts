import type { GameRepository } from '@/repositories';
import type { AchievementDefinition } from '@/types/content';
import type { AchievementProgress, AchievementUnlockInput } from '@/types/achievement';
import { checkAllAchievements } from '@/lib/game/achievement-engine';
import { deferred, ok, type FutureOrchestrationPoint, type ServiceResult } from '../service-result';

export interface AchievementCheckResult {
  readonly unlocked: readonly string[];
  readonly progress: Record<string, number>;
}

export interface GameService {
  readonly domain: 'game';
  prepareMissionPipeline: () => ServiceResult<FutureOrchestrationPoint>;
  checkAchievements: (
    achievements: readonly AchievementDefinition[],
    input: AchievementUnlockInput,
    currentProgress: Record<string, AchievementProgress>
  ) => ServiceResult<AchievementCheckResult>;
  prepareRewardPipeline: () => ServiceResult<FutureOrchestrationPoint>;
}

export class DefaultGameService implements GameService {
  readonly domain = 'game' as const;

  constructor(readonly repository: GameRepository) {}

  prepareMissionPipeline() {
    return deferred('missions');
  }

  checkAchievements(
    achievements: readonly AchievementDefinition[],
    input: AchievementUnlockInput,
    currentProgress: Record<string, AchievementProgress>
  ) {
    const progressMap = new Map(Object.entries(currentProgress));
    const result = checkAllAchievements(achievements, input, progressMap);
    return ok({ unlocked: result.unlocked, progress: Object.fromEntries(result.progress) });
  }

  prepareRewardPipeline() {
    return deferred('rewards');
  }
}
