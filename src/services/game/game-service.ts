import type { GameRepository } from '@/repositories';
import type { AchievementDefinition, MissionDefinition } from '@/types/content';
import type { AchievementProgress, AchievementUnlockInput } from '@/types/achievement';
import type { MissionState, MissionGenerationInput, MissionProgressInput } from '@/types/mission';
import { checkAllAchievements } from '@/lib/game/achievement-engine';
import { generateMissions, updateAllMissions, pruneExpiredMissions } from '@/lib/game/mission-engine';
import { deferred, ok, type FutureOrchestrationPoint, type ServiceResult } from '../service-result';

export interface AchievementCheckResult {
  readonly unlocked: readonly string[];
  readonly progress: Record<string, number>;
}

export interface MissionGenerationResult {
  readonly missions: readonly MissionState[];
}

export interface MissionUpdateResult {
  readonly missions: readonly MissionState[];
  readonly completed: readonly string[];
}

export interface GameService {
  readonly domain: 'game';
  generateMissions: (
    dailyPool: readonly MissionDefinition[],
    weeklyPool: readonly MissionDefinition[],
    input: MissionGenerationInput
  ) => ServiceResult<MissionGenerationResult>;
  updateMissions: (
    missions: readonly MissionState[],
    input: MissionProgressInput
  ) => ServiceResult<MissionUpdateResult>;
  pruneMissions: (missions: readonly MissionState[], now: number) => ServiceResult<MissionGenerationResult>;
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

  generateMissions(
    dailyPool: readonly MissionDefinition[],
    weeklyPool: readonly MissionDefinition[],
    input: MissionGenerationInput
  ) {
    const missions = generateMissions(dailyPool, weeklyPool, input);
    return ok({ missions });
  }

  updateMissions(missions: readonly MissionState[], input: MissionProgressInput) {
    const updated = updateAllMissions(missions, input);
    const completed = updated.filter(m => m.completed && !missions.find(old => old.id === m.id && old.completed)).map(m => m.id);
    return ok({ missions: updated, completed });
  }

  pruneMissions(missions: readonly MissionState[], now: number) {
    const pruned = pruneExpiredMissions(missions, now);
    return ok({ missions: pruned });
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
