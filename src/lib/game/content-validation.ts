import type { AchievementDefinition, MissionDefinition, FoodCategoryDefinition } from '@/types/content';

export function validateAchievement(achievement: AchievementDefinition): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!achievement.id || achievement.id.trim() === '') {
    errors.push('Achievement id is required');
  }
  if (!achievement.key || achievement.key.trim() === '') {
    errors.push('Achievement key is required');
  }
  if (!achievement.name || achievement.name.trim() === '') {
    errors.push('Achievement name is required');
  }
  if (!achievement.description || achievement.description.trim() === '') {
    errors.push('Achievement description is required');
  }
  if (achievement.threshold <= 0) {
    errors.push('Achievement threshold must be positive');
  }
  if (achievement.rewardXp < 0) {
    errors.push('Achievement rewardXp cannot be negative');
  }

  return { valid: errors.length === 0, errors };
}

export function validateMission(mission: MissionDefinition): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!mission.id || mission.id.trim() === '') {
    errors.push('Mission id is required');
  }
  if (!mission.name || mission.name.trim() === '') {
    errors.push('Mission name is required');
  }
  if (!mission.description || mission.description.trim() === '') {
    errors.push('Mission description is required');
  }
  if (mission.target <= 0) {
    errors.push('Mission target must be positive');
  }
  if (mission.rewardXp < 0) {
    errors.push('Mission rewardXp cannot be negative');
  }
  if (mission.type !== 'daily' && mission.type !== 'weekly') {
    errors.push('Mission type must be daily or weekly');
  }

  return { valid: errors.length === 0, errors };
}

export function validateFoodCategory(food: FoodCategoryDefinition): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!food.category || food.category.trim() === '') {
    errors.push('Food category is required');
  }
  if (!food.statBoosts) {
    errors.push('Food statBoosts is required');
  }
  if (!food.reactionMessages || food.reactionMessages.length === 0) {
    errors.push('Food reactionMessages must have at least one message');
  }

  return { valid: errors.length === 0, errors };
}

export function validateContentRegistry(
  achievements: readonly AchievementDefinition[],
  missions: readonly MissionDefinition[],
  foodCategories: readonly FoodCategoryDefinition[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  achievements.forEach((achievement, index) => {
    const result = validateAchievement(achievement);
    if (!result.valid) {
      errors.push(`Achievement[${index}]: ${result.errors.join(', ')}`);
    }
  });

  missions.forEach((mission, index) => {
    const result = validateMission(mission);
    if (!result.valid) {
      errors.push(`Mission[${index}]: ${result.errors.join(', ')}`);
    }
  });

  foodCategories.forEach((food, index) => {
    const result = validateFoodCategory(food);
    if (!result.valid) {
      errors.push(`FoodCategory[${index}]: ${result.errors.join(', ')}`);
    }
  });

  const achievementKeys = achievements.map(a => a.key);
  const duplicateKeys = achievementKeys.filter((key, index) => achievementKeys.indexOf(key) !== index);
  if (duplicateKeys.length > 0) {
    errors.push(`Duplicate achievement keys: ${duplicateKeys.join(', ')}`);
  }

  const missionIds = missions.map(m => m.id);
  const duplicateIds = missionIds.filter((id, index) => missionIds.indexOf(id) !== index);
  if (duplicateIds.length > 0) {
    errors.push(`Duplicate mission ids: ${duplicateIds.join(', ')}`);
  }

  return { valid: errors.length === 0, errors };
}
