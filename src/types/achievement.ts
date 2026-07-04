export interface AchievementProgress {
  readonly key: string;
  readonly unlockedAt: number | null;
  readonly progress: number;
}

export interface AchievementUnlockInput {
  readonly scanCount: number;
  readonly registerCount: number;
  readonly level: number;
  readonly streak: number;
}

export interface AchievementUnlockResult {
  readonly unlocked: readonly string[];
  readonly progress: ReadonlyMap<string, number>;
}
