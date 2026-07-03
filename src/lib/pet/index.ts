import type {
  FeedingRecord,
  FoodCategory,
  FoodModel,
  FoodNutritionProfile,
  PetLifecycleState,
  PetInteractionType,
  PetMemory,
  PetMemoryType,
  PetPersonalityState,
  PetPersonalityTrait,
  PetStateModel,
  PetStatName,
  PetStatsState,
  PetStatus,
} from '@/types/pet';

export const PET_STAT_LIMITS: Readonly<Record<PetStatName, { min: number; max: number }>> = {
  hunger: { min: 0, max: 100 },
  mood: { min: 0, max: 100 },
  energy: { min: 0, max: 100 },
  affection: { min: 0, max: 100 },
  curiosity: { min: 0, max: 100 },
};

export const PET_PASSIVE_FLOORS: Readonly<PetStatsState> = {
  hunger: 1,
  mood: 1,
  energy: 1,
  affection: 25,
  curiosity: 1,
};

export const PET_DECAY_PER_HOUR: Readonly<PetStatsState> = {
  hunger: 5,
  mood: 3,
  energy: 2,
  affection: 1 / 24,
  curiosity: 4,
};

export const initialPetPersonality: PetPersonalityState = {
  dominantTrait: 'gentle',
  traits: {
    gentle: 1,
    foodie: 0,
    adventurous: 0,
    'routine-loving': 0,
    independent: 0,
    social: 0,
    nocturnal: 0,
  },
};

export const initialPetStats: PetStatsState = {
  hunger: 100,
  mood: 100,
  energy: 100,
  affection: 25,
  curiosity: 50,
};

export const FOOD_NUTRITION_PROFILES: Readonly<Record<FoodCategory, FoodNutritionProfile>> = {
  meal: { hunger: 30, mood: 8, energy: 6, affection: 5, curiosity: 2 },
  snack: { hunger: 20, mood: 10, energy: 5, affection: 5, curiosity: 4 },
  treat: { hunger: 15, mood: 15, energy: 3, affection: 5, curiosity: 6 },
  drink: { hunger: 15, mood: 5, energy: 8, affection: 5, curiosity: 5 },
  fresh: { hunger: 25, mood: 8, energy: 10, affection: 5, curiosity: 10 },
  unknown: { hunger: 15, mood: 5, energy: 0, affection: 5, curiosity: 12 },
};

const PET_INTERACTION_COOLDOWNS: Readonly<Record<PetInteractionType, number>> = {
  pet: 10_000,
  greet: 60_000,
  observe: 15_000,
  comfort: 45_000,
  praise: 45_000,
  play: 120_000,
};

const PET_INTERACTION_RULES: Readonly<
  Record<PetInteractionType, { stats: Partial<PetStatsState>; trait: PetPersonalityTrait; memory?: string }>
> = {
  pet: { stats: { affection: 1, mood: 1 }, trait: 'social' },
  greet: { stats: { affection: 2, mood: 1 }, trait: 'social', memory: 'A warm greeting' },
  observe: { stats: { curiosity: 2 }, trait: 'independent' },
  comfort: { stats: { mood: 5, affection: 3 }, trait: 'gentle', memory: 'A quiet comfort' },
  praise: { stats: { mood: 3, affection: 2, curiosity: 1 }, trait: 'routine-loving', memory: 'A proud little moment' },
  play: { stats: { mood: 4, curiosity: 4, energy: -3 }, trait: 'adventurous', memory: 'A playful moment' },
};

const FOOD_PERSONALITY_TRAITS: Readonly<Record<FoodCategory, PetPersonalityTrait>> = {
  meal: 'foodie',
  snack: 'foodie',
  treat: 'foodie',
  drink: 'routine-loving',
  fresh: 'adventurous',
  unknown: 'adventurous',
};

export function clampPetStat(stat: PetStatName, value: number): number {
  const limit = PET_STAT_LIMITS[stat];
  return Math.min(limit.max, Math.max(limit.min, Math.round(value)));
}

export function clampPetStats(stats: Partial<PetStatsState>): Partial<PetStatsState> {
  return Object.fromEntries(
    Object.entries(stats)
      .filter((entry): entry is [string, number] => entry[1] !== undefined)
      .map(([stat, value]) => [stat, clampPetStat(stat as PetStatName, value)]),
  ) as Partial<PetStatsState>;
}

export function normalizePetStats(stats: Partial<PetStatsState>): PetStatsState {
  return {
    hunger: clampPetStat('hunger', stats.hunger ?? initialPetStats.hunger),
    mood: clampPetStat('mood', stats.mood ?? initialPetStats.mood),
    energy: clampPetStat('energy', stats.energy ?? initialPetStats.energy),
    affection: clampPetStat('affection', stats.affection ?? initialPetStats.affection),
    curiosity: clampPetStat('curiosity', stats.curiosity ?? initialPetStats.curiosity),
  };
}

export function applyPetStatUpdate(stats: PetStatsState, update: Partial<PetStatsState>): PetStatsState {
  return normalizePetStats({ ...stats, ...clampPetStats(update) });
}

export function applyPassivePetDecay(stats: PetStatsState, elapsedHours: number): PetStatsState {
  const safeHours = Math.max(0, elapsedHours);

  return {
    hunger: Math.max(PET_PASSIVE_FLOORS.hunger, clampPetStat('hunger', stats.hunger - PET_DECAY_PER_HOUR.hunger * safeHours)),
    mood: Math.max(PET_PASSIVE_FLOORS.mood, clampPetStat('mood', stats.mood - PET_DECAY_PER_HOUR.mood * safeHours)),
    energy: Math.max(PET_PASSIVE_FLOORS.energy, clampPetStat('energy', stats.energy - PET_DECAY_PER_HOUR.energy * safeHours)),
    affection: Math.max(PET_PASSIVE_FLOORS.affection, clampPetStat('affection', stats.affection - PET_DECAY_PER_HOUR.affection * safeHours)),
    curiosity: Math.max(PET_PASSIVE_FLOORS.curiosity, clampPetStat('curiosity', stats.curiosity - PET_DECAY_PER_HOUR.curiosity * safeHours)),
  };
}

export function calculatePetStatus(stats: PetStatsState): PetStatus {
  if (stats.energy < 25) return 'resting';
  if (stats.hunger < 25) return 'hungry';
  if (stats.mood < 25) return 'bored';
  if (stats.curiosity >= 80 && stats.energy >= 50) return 'curious';
  if (stats.affection >= 80) return 'bonded';
  if (stats.energy < 50) return 'tired';
  return 'content';
}

export function calculatePetLifecycle(stats: PetStatsState, returning = false): PetLifecycleState {
  if (returning) return 'greeting';
  if (stats.energy < 25) return 'sleeping';
  if (stats.energy < 50) return 'resting';
  return 'awake';
}

export function applyPersonalitySignal(
  personality: PetPersonalityState,
  trait: PetPersonalityTrait,
  amount = 1,
): PetPersonalityState {
  const traits = { ...personality.traits, [trait]: Math.max(0, personality.traits[trait] + amount) };
  const dominantTrait = (Object.entries(traits).sort(([, a], [, b]) => b - a)[0]?.[0] ?? 'gentle') as PetPersonalityTrait;

  return { dominantTrait, traits };
}

export function createPetMemory(input: {
  id: string;
  type: PetMemoryType;
  title: string;
  createdAt: string;
  productBarcode?: string;
  reaction?: string;
}): PetMemory {
  return {
    id: input.id,
    type: input.type,
    title: input.title.trim(),
    createdAt: input.createdAt,
    productBarcode: input.productBarcode,
    reaction: input.reaction,
  };
}

export function createFood(input: {
  id: string;
  name: string;
  category: FoodCategory;
  nutrition?: Partial<FoodNutritionProfile>;
  isFavorite?: boolean;
  isNew?: boolean;
}): FoodModel {
  return {
    id: input.id.trim(),
    name: input.name.trim(),
    category: input.category,
    nutrition: normalizePetStats({ ...FOOD_NUTRITION_PROFILES[input.category], ...input.nutrition }),
    isFavorite: input.isFavorite,
    isNew: input.isNew,
  };
}

export function applyPetFeeding(
  pet: PetStateModel,
  input: { food: FoodModel; now: number; memoryId?: string },
): { pet: PetStateModel; applied: boolean; reason?: 'invalid-food' | 'overfed'; memory?: PetMemory; feeding?: FeedingRecord } {
  const food = input.food;
  const values = Object.values(food.nutrition);

  if (!food.id || !food.name || values.some((value) => !Number.isFinite(value))) {
    return { pet, applied: false, reason: 'invalid-food' };
  }

  if (pet.stats.hunger >= 95) {
    return { pet, applied: false, reason: 'overfed' };
  }

  const trait = FOOD_PERSONALITY_TRAITS[food.category];
  const traitWeight = pet.personality.dominantTrait === trait || food.isFavorite ? 2 : 1;
  const nextStats = applyPetStatUpdate(
    pet.stats,
    Object.fromEntries(
      Object.entries(food.nutrition).map(([stat, value]) => [
        stat,
        pet.stats[stat as PetStatName] + value * traitWeight,
      ]),
    ) as Partial<PetStatsState>,
  );
  const memoryType: PetMemoryType | null = pet.feedings.length === 0 ? 'first-feed' : food.isFavorite ? 'favorite' : food.isNew ? 'rare-find' : null;
  const memory = memoryType
    ? createPetMemory({
        id: input.memoryId ?? `feeding-${food.id}-${input.now}`,
        type: memoryType,
        title: memoryType === 'first-feed' ? 'First Feed' : `${food.name} shared`,
        createdAt: new Date(input.now).toISOString(),
        reaction: food.category,
      })
    : undefined;
  const feeding = { foodId: food.id, category: food.category, fedAt: input.now };

  return {
    applied: true,
    feeding,
    memory,
    pet: {
      ...pet,
      stats: nextStats,
      personality: applyPersonalitySignal(pet.personality, trait, 1),
      memories: memory ? [...pet.memories, memory] : pet.memories,
      lifecycle: calculatePetLifecycle(nextStats),
      feedings: [...pet.feedings, feeding],
    },
  };
}

export function applyPetInteraction(
  pet: PetStateModel,
  input: { type: PetInteractionType; now: number; memoryId?: string },
): { pet: PetStateModel; applied: boolean; cooldownRemainingMs: number; memory?: PetMemory } {
  const previous = pet.interactions[input.type]?.lastAt;
  const cooldownRemainingMs = previous === undefined ? 0 : Math.max(0, PET_INTERACTION_COOLDOWNS[input.type] - (input.now - previous));

  if (cooldownRemainingMs > 0) {
    return { pet, applied: false, cooldownRemainingMs };
  }

  const rule = PET_INTERACTION_RULES[input.type];
  const traitWeight = pet.personality.dominantTrait === rule.trait ? 2 : 1;
  const nextStats = applyPetStatUpdate(
    pet.stats,
    Object.fromEntries(
      Object.entries(rule.stats).map(([stat, value]) => [
        stat,
        pet.stats[stat as PetStatName] + (value ?? 0) * traitWeight,
      ]),
    ) as Partial<PetStatsState>,
  );
  const memory = rule.memory
    ? createPetMemory({
        id: input.memoryId ?? `${input.type}-${input.now}`,
        type: 'special-moment',
        title: rule.memory,
        createdAt: new Date(input.now).toISOString(),
        reaction: input.type,
      })
    : undefined;

  return {
    applied: true,
    cooldownRemainingMs: 0,
    memory,
    pet: {
      ...pet,
      stats: nextStats,
      personality: applyPersonalitySignal(pet.personality, rule.trait, 1),
      memories: memory ? [...pet.memories, memory] : pet.memories,
      lifecycle: input.type === 'greet' ? 'greeting' : calculatePetLifecycle(nextStats),
      interactions: { ...pet.interactions, [input.type]: { type: input.type, lastAt: input.now } },
    },
  };
}

export function normalizePetState(pet: Partial<PetStateModel>): PetStateModel {
  const stats = normalizePetStats(pet.stats ?? {});

  return {
    name: pet.name?.trim() || 'Scan Chan',
    stage: pet.stage ?? 'kitten',
    stats,
    personality: pet.personality ?? initialPetPersonality,
    memories: pet.memories ?? [],
    lifecycle: pet.lifecycle ?? calculatePetLifecycle(stats),
    lastDecayTimestamp: pet.lastDecayTimestamp ?? null,
    interactions: pet.interactions ?? {},
    feedings: pet.feedings ?? [],
  };
}
