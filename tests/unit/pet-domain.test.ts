import { describe, expect, it } from 'vitest';
import {
  applyPetInteraction,
  applyPassivePetDecay,
  applyPersonalitySignal,
  applyPetStatUpdate,
  calculatePetLifecycle,
  calculatePetStatus,
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
  });
});
