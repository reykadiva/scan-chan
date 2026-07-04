export interface MissionState {
  readonly id: string;
  readonly type: 'daily' | 'weekly';
  readonly name: string;
  readonly description: string;
  readonly objective: string;
  readonly target: number;
  readonly progress: number;
  readonly rewardXp: number;
  readonly completed: boolean;
  readonly startedAt: number;
  readonly expiresAt: number;
}

export interface MissionGenerationInput {
  readonly now: number;
  readonly dailyCount: number;
  readonly weeklyCount: number;
  readonly existingMissions: readonly MissionState[];
}

export interface MissionProgressInput {
  readonly scanCount: number;
  readonly registerCount: number;
  readonly scannedCategories: readonly string[];
  readonly visitedToday: boolean;
}
