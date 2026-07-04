import { describe, it, expect } from 'vitest';
import {
  createContentRegistry,
  getAchievement,
  getMission,
  getFoodCategory,
  getAllAchievements,
  getAllMissions,
  getAllFoodCategories,
  BASE_ACHIEVEMENTS,
  BASE_DAILY_MISSIONS,
  BASE_WEEKLY_MISSIONS,
  FOOD_CATEGORY_DEFINITIONS,
  validateAchievement,
  validateMission,
  validateFoodCategory,
  validateContentRegistry,
} from '@/lib/game';
import { FoodCategory } from '@/types/pet';

describe('Content Registry', () => {
  it('creates a content registry from definitions', () => {
    const registry = createContentRegistry(
      BASE_ACHIEVEMENTS,
      [...BASE_DAILY_MISSIONS, ...BASE_WEEKLY_MISSIONS],
      FOOD_CATEGORY_DEFINITIONS
    );

    expect(registry.achievements.size).toBe(BASE_ACHIEVEMENTS.length);
    expect(registry.missions.size).toBe(BASE_DAILY_MISSIONS.length + BASE_WEEKLY_MISSIONS.length);
    expect(registry.foodCategories.size).toBe(FOOD_CATEGORY_DEFINITIONS.length);
  });

  it('retrieves achievement by key', () => {
    const registry = createContentRegistry(BASE_ACHIEVEMENTS, [], []);
    const achievement = getAchievement(registry, 'first_scan');

    expect(achievement).toBeDefined();
    expect(achievement?.name).toBe('First Discovery');
  });

  it('retrieves mission by id', () => {
    const registry = createContentRegistry([], BASE_DAILY_MISSIONS, []);
    const mission = getMission(registry, 'daily_scan_3');

    expect(mission).toBeDefined();
    expect(mission?.name).toBe('Morning Discoveries');
  });

  it('retrieves food category by category', () => {
    const registry = createContentRegistry([], [], FOOD_CATEGORY_DEFINITIONS);
    const food = getFoodCategory(registry, FoodCategory.SNACK);

    expect(food).toBeDefined();
    expect(food?.statBoosts.hunger).toBe(10);
  });

  it('returns undefined for missing achievement', () => {
    const registry = createContentRegistry(BASE_ACHIEVEMENTS, [], []);
    const achievement = getAchievement(registry, 'nonexistent');

    expect(achievement).toBeUndefined();
  });

  it('returns all achievements', () => {
    const registry = createContentRegistry(BASE_ACHIEVEMENTS, [], []);
    const achievements = getAllAchievements(registry);

    expect(achievements.length).toBe(BASE_ACHIEVEMENTS.length);
  });

  it('returns all missions', () => {
    const registry = createContentRegistry([], [...BASE_DAILY_MISSIONS, ...BASE_WEEKLY_MISSIONS], []);
    const missions = getAllMissions(registry);

    expect(missions.length).toBe(BASE_DAILY_MISSIONS.length + BASE_WEEKLY_MISSIONS.length);
  });

  it('returns all food categories', () => {
    const registry = createContentRegistry([], [], FOOD_CATEGORY_DEFINITIONS);
    const categories = getAllFoodCategories(registry);

    expect(categories.length).toBe(FOOD_CATEGORY_DEFINITIONS.length);
  });
});

describe('Achievement Validation', () => {
  it('validates valid achievement', () => {
    const achievement = BASE_ACHIEVEMENTS[0];
    const result = validateAchievement(achievement);

    expect(result.valid).toBe(true);
    expect(result.errors.length).toBe(0);
  });

  it('rejects achievement with empty id', () => {
    const achievement = { ...BASE_ACHIEVEMENTS[0], id: '' };
    const result = validateAchievement(achievement);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Achievement id is required');
  });

  it('rejects achievement with negative threshold', () => {
    const achievement = { ...BASE_ACHIEVEMENTS[0], threshold: -1 };
    const result = validateAchievement(achievement);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Achievement threshold must be positive');
  });

  it('rejects achievement with negative rewardXp', () => {
    const achievement = { ...BASE_ACHIEVEMENTS[0], rewardXp: -10 };
    const result = validateAchievement(achievement);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Achievement rewardXp cannot be negative');
  });
});

describe('Mission Validation', () => {
  it('validates valid mission', () => {
    const mission = BASE_DAILY_MISSIONS[0];
    const result = validateMission(mission);

    expect(result.valid).toBe(true);
    expect(result.errors.length).toBe(0);
  });

  it('rejects mission with empty name', () => {
    const mission = { ...BASE_DAILY_MISSIONS[0], name: '' };
    const result = validateMission(mission);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Mission name is required');
  });

  it('rejects mission with zero target', () => {
    const mission = { ...BASE_DAILY_MISSIONS[0], target: 0 };
    const result = validateMission(mission);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Mission target must be positive');
  });
});

describe('Food Category Validation', () => {
  it('validates valid food category', () => {
    const food = FOOD_CATEGORY_DEFINITIONS[0];
    const result = validateFoodCategory(food);

    expect(result.valid).toBe(true);
    expect(result.errors.length).toBe(0);
  });

  it('rejects food category with empty category', () => {
    const food = { ...FOOD_CATEGORY_DEFINITIONS[0], category: '' as FoodCategory };
    const result = validateFoodCategory(food);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Food category is required');
  });

  it('rejects food category without reaction messages', () => {
    const food = { ...FOOD_CATEGORY_DEFINITIONS[0], reactionMessages: [] };
    const result = validateFoodCategory(food);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Food reactionMessages must have at least one message');
  });
});

describe('Content Registry Validation', () => {
  it('validates complete content registry', () => {
    const result = validateContentRegistry(
      BASE_ACHIEVEMENTS,
      [...BASE_DAILY_MISSIONS, ...BASE_WEEKLY_MISSIONS],
      FOOD_CATEGORY_DEFINITIONS
    );

    expect(result.valid).toBe(true);
    expect(result.errors.length).toBe(0);
  });

  it('detects duplicate achievement keys', () => {
    const duplicate = { ...BASE_ACHIEVEMENTS[0], id: 'ach_duplicate' };
    const result = validateContentRegistry([BASE_ACHIEVEMENTS[0], duplicate], [], []);

    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('Duplicate achievement keys'))).toBe(true);
  });

  it('detects duplicate mission ids', () => {
    const duplicate = { ...BASE_DAILY_MISSIONS[0] };
    const result = validateContentRegistry([], [BASE_DAILY_MISSIONS[0], duplicate], []);

    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('Duplicate mission ids'))).toBe(true);
  });
});

describe('Base Achievement Definitions', () => {
  it('has valid achievement structure', () => {
    BASE_ACHIEVEMENTS.forEach(achievement => {
      expect(achievement.id).toBeTruthy();
      expect(achievement.key).toBeTruthy();
      expect(achievement.name).toBeTruthy();
      expect(achievement.description).toBeTruthy();
      expect(achievement.threshold).toBeGreaterThan(0);
      expect(achievement.rewardXp).toBeGreaterThan(0);
    });
  });

  it('has unique achievement keys', () => {
    const keys = BASE_ACHIEVEMENTS.map(a => a.key);
    const uniqueKeys = new Set(keys);
    expect(uniqueKeys.size).toBe(keys.length);
  });
});

describe('Base Mission Definitions', () => {
  it('has valid daily mission structure', () => {
    BASE_DAILY_MISSIONS.forEach(mission => {
      expect(mission.id).toBeTruthy();
      expect(mission.type).toBe('daily');
      expect(mission.name).toBeTruthy();
      expect(mission.description).toBeTruthy();
      expect(mission.target).toBeGreaterThan(0);
      expect(mission.rewardXp).toBeGreaterThan(0);
    });
  });

  it('has valid weekly mission structure', () => {
    BASE_WEEKLY_MISSIONS.forEach(mission => {
      expect(mission.id).toBeTruthy();
      expect(mission.type).toBe('weekly');
      expect(mission.name).toBeTruthy();
      expect(mission.description).toBeTruthy();
      expect(mission.target).toBeGreaterThan(0);
      expect(mission.rewardXp).toBeGreaterThan(0);
    });
  });

  it('has unique mission ids', () => {
    const allMissions = [...BASE_DAILY_MISSIONS, ...BASE_WEEKLY_MISSIONS];
    const ids = allMissions.map(m => m.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });
});

describe('Food Category Definitions', () => {
  it('has definition for all food categories', () => {
    const categories = FOOD_CATEGORY_DEFINITIONS.map(f => f.category);
    expect(categories).toContain(FoodCategory.SNACK);
    expect(categories).toContain(FoodCategory.MEAL);
    expect(categories).toContain(FoodCategory.BEVERAGE);
    expect(categories).toContain(FoodCategory.TREAT);
    expect(categories).toContain(FoodCategory.INGREDIENT);
    expect(categories).toContain(FoodCategory.UNKNOWN);
  });

  it('has stat boosts for each category', () => {
    FOOD_CATEGORY_DEFINITIONS.forEach(food => {
      expect(food.statBoosts).toBeDefined();
      expect(Object.keys(food.statBoosts).length).toBeGreaterThan(0);
    });
  });

  it('has reaction messages for each category', () => {
    FOOD_CATEGORY_DEFINITIONS.forEach(food => {
      expect(food.reactionMessages.length).toBeGreaterThan(0);
    });
  });
});
