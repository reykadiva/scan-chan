import type { FoodCategory, PetStatsState } from './pet';

export type UnlockConditionType = 'scan_count' | 'register_count' | 'level' | 'streak' | 'custom';

export interface AchievementDefinition {
  readonly id: string;
  readonly key: string;
  readonly name: string;
  readonly description: string;
  readonly emoji: string;
  readonly unlockCondition: UnlockConditionType;
  readonly threshold: number;
  readonly rewardXp: number;
}

export type ObjectiveType = 'scan_any' | 'register_any' | 'scan_category' | 'time_based';

export interface MissionDefinition {
  readonly id: string;
  readonly type: 'daily' | 'weekly';
  readonly name: string;
  readonly description: string;
  readonly objective: ObjectiveType;
  readonly target: number;
  readonly rewardXp: number;
  readonly categoryFilter?: string[];
}

export interface FoodCategoryDefinition {
  readonly category: FoodCategory;
  readonly statBoosts: Partial<PetStatsState>;
  readonly reactionMessages: readonly string[];
}
