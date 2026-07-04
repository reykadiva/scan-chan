import type { AchievementDefinition, MissionDefinition, FoodCategoryDefinition } from '@/types/content';

export interface ContentRegistry {
  readonly achievements: ReadonlyMap<string, AchievementDefinition>;
  readonly missions: ReadonlyMap<string, MissionDefinition>;
  readonly foodCategories: ReadonlyMap<string, FoodCategoryDefinition>;
}

export function createContentRegistry(
  achievements: readonly AchievementDefinition[],
  missions: readonly MissionDefinition[],
  foodCategories: readonly FoodCategoryDefinition[]
): ContentRegistry {
  return {
    achievements: new Map(achievements.map(a => [a.key, a])),
    missions: new Map(missions.map(m => [m.id, m])),
    foodCategories: new Map(foodCategories.map(f => [f.category, f])),
  };
}

export function getAchievement(registry: ContentRegistry, key: string): AchievementDefinition | undefined {
  return registry.achievements.get(key);
}

export function getMission(registry: ContentRegistry, id: string): MissionDefinition | undefined {
  return registry.missions.get(id);
}

export function getFoodCategory(registry: ContentRegistry, category: string): FoodCategoryDefinition | undefined {
  return registry.foodCategories.get(category);
}

export function getAllAchievements(registry: ContentRegistry): readonly AchievementDefinition[] {
  return Array.from(registry.achievements.values());
}

export function getAllMissions(registry: ContentRegistry): readonly MissionDefinition[] {
  return Array.from(registry.missions.values());
}

export function getAllFoodCategories(registry: ContentRegistry): readonly FoodCategoryDefinition[] {
  return Array.from(registry.foodCategories.values());
}
