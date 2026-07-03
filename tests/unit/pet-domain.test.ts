import { describe, expect, it } from 'vitest';
import {
  applyPetFeeding,
  applyPetInteraction,
  applyPassivePetDecay,
  applyPersonalitySignal,
  applyPetStatUpdate,
  calculatePetLifecycle,
  calculatePetStatus,
  createFood,
  createPetMemory,
  initialPetPersonality,
  initialPetStats,
  normalizePetState,
} from '@/lib/pet';
import { DefaultPetService } from '@/services/pet';
import { createMockRepositories } from '@tests/mocks';

describe('pet domain', () => {
  it('clamps direct stat updates to safe boundaries', () => {
    expect(applyPetStatUpdate(initialPetStats, { hunger: 130, mood: -10 })).toMatchObject({
      hunger: 100,
      mood: 0,
    });
  });

  it('applies passive decay without creating absence punishment states', () => {
    const decayed = applyPassivePetDecay(initialPetStats, 100);

    expect(decayed.hunger).toBeGreaterThan(0);
    expect(decayed.mood).toBeGreaterThan(0);
    expect(decayed.energy).toBeGreaterThan(0);
    expect(decayed.curiosity).toBeGreaterThan(0);
    expect(decayed.affection).toBeGreaterThanOrEqual(25);
  });

  it('derives lifecycle and status deterministically from stats', () => {
    expect(calculatePetLifecycle({ ...initialPetStats, energy: 20 })).toBe('sleeping');
    expect(calculatePetStatus({ ...initialPetStats, hunger: 10 })).toBe('hungry');
    expect(calculatePetStatus({ ...initialPetStats, curiosity: 90 })).toBe('curious');
  });

  it('tracks personality signals without replacing the full personality model', () => {
    const personality = applyPersonalitySignal(initialPetPersonality, 'adventurous', 3);

    expect(personality.dominantTrait).toBe('adventurous');
    expect(personality.traits.adventurous).toBe(3);
  });

  it('creates normalized memory records', () => {
    expect(
      createPetMemory({
        id: 'memory-1',
        type: 'first-feed',
        title: ' First Feed ',
        createdAt: '2026-07-03T00:00:00.000Z',
      }),
    ).toMatchObject({ id: 'memory-1', title: 'First Feed' });
  });

  it('normalizes partial pet state for service and store boundaries', () => {
    expect(normalizePetState({ name: '  ' })).toMatchObject({
      name: 'Scan Chan',
      stage: 'kitten',
      lifecycle: 'awake',
    });
  });

  it('applies interactions with cooldowns, memories, and personality influence', () => {
    const pet = normalizePetState({});
    const first = applyPetInteraction(pet, { type: 'comfort', now: 1_000, memoryId: 'comfort-1' });
    const second = applyPetInteraction(first.pet, { type: 'comfort', now: 2_000 });

    expect(first.applied).toBe(true);
    expect(first.pet.stats.mood).toBe(100);
    expect(first.pet.personality.dominantTrait).toBe('gentle');
    expect(first.memory).toMatchObject({ id: 'comfort-1', type: 'special-moment' });
    expect(second.applied).toBe(false);
    expect(second.cooldownRemainingMs).toBeGreaterThan(0);
  });

  it('lets dominant personality traits amplify matching interactions', () => {
    const pet = normalizePetState({
      stats: { ...initialPetStats, mood: 50, curiosity: 50 },
      personality: applyPersonalitySignal(initialPetPersonality, 'adventurous', 3),
    });
    const result = applyPetInteraction(pet, { type: 'play', now: 1_000 });

    expect(result.pet.stats.mood).toBe(58);
    expect(result.pet.stats.curiosity).toBe(58);
    expect(result.pet.stats.energy).toBe(94);
  });

  it('feeds valid food into all five pet stats and feeding history', () => {
    const pet = normalizePetState({ stats: { hunger: 40, mood: 40, energy: 40, affection: 25, curiosity: 40 } });
    const food = createFood({ id: 'snack-1', name: 'Snack', category: 'snack' });
    const result = applyPetFeeding(pet, { food, now: 1_000, memoryId: 'first-feed-1' });

    expect(result.applied).toBe(true);
    expect(result.pet.stats).toMatchObject({ hunger: 60, mood: 50, energy: 45, affection: 30, curiosity: 44 });
    expect(result.pet.feedings).toHaveLength(1);
    expect(result.memory).toMatchObject({ id: 'first-feed-1', type: 'first-feed' });
  });

  it('prevents overfeeding and invalid feeding without mutating pet state', () => {
    const pet = normalizePetState({ stats: { hunger: 99, mood: 40, energy: 40, affection: 25, curiosity: 40 } });
    const validFood = createFood({ id: 'meal-1', name: 'Meal', category: 'meal' });
    const invalidFood = createFood({ id: ' ', name: ' ', category: 'meal' });

    expect(applyPetFeeding(pet, { food: validFood, now: 1_000 })).toMatchObject({ applied: false, reason: 'overfed' });
    expect(applyPetFeeding({ ...pet, stats: { ...pet.stats, hunger: 40 } }, { food: invalidFood, now: 1_000 })).toMatchObject({
      applied: false,
      reason: 'invalid-food',
    });
  });

  it('lets food personality and favorites influence feeding outcome', () => {
    const pet = normalizePetState({
      stats: { hunger: 40, mood: 40, energy: 40, affection: 25, curiosity: 40 },
      personality: applyPersonalitySignal(initialPetPersonality, 'foodie', 3),
      feedings: [{ foodId: 'old', category: 'meal', fedAt: 1 }],
    });
    const food = createFood({ id: 'treat-1', name: 'Favorite Treat', category: 'treat', isFavorite: true });
    const result = applyPetFeeding(pet, { food, now: 2_000 });

    expect(result.pet.stats).toMatchObject({ hunger: 70, mood: 70, energy: 46, affection: 35, curiosity: 52 });
    expect(result.memory?.type).toBe('favorite');
  });
});

describe('pet service', () => {
  it('wraps pet domain business rules without reaching across layers', () => {
    const service = new DefaultPetService(createMockRepositories().pet);
    const pet = service.normalizePet({}).data!;

    expect(service.updateStats(pet, { energy: 20 }).data).toMatchObject({
      lifecycle: 'sleeping',
      stats: { energy: 20 },
    });
    expect(service.createMemory({ id: 'memory-1', type: 'first-feed', title: 'First Feed', createdAt: '2026-07-03T00:00:00.000Z' }).data?.title).toBe('First Feed');
    expect(service.interact(pet, { type: 'greet', now: 1_000 }).data?.pet.lifecycle).toBe('greeting');
    expect(service.feed(pet, { food: createFood({ id: 'meal-1', name: 'Meal', category: 'meal' }), now: 1_000 }).data?.applied).toBe(false);
  });
});
