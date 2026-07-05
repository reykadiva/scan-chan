import { describe, expect, it } from 'vitest';
import { buildHomeHubViewModel } from '@/lib/home-hub';
import { initialPetPersonality, initialPetStats, normalizePetState } from '@/lib/pet';
import { FoodCategory } from '@/types/pet';
import type { HomeHubInput } from '@/types';

const now = Date.parse('2026-07-03T12:00:00.000Z');

const createInput = (overrides: Partial<HomeHubInput> = {}): HomeHubInput => {
  const pet = normalizePetState({
    stats: initialPetStats,
    personality: initialPetPersonality,
    feedings: [{ foodId: 'snack-1', category: FoodCategory.SNACK, fedAt: now }],
    memories: [{ id: 'memory-1', type: 'first-feed', title: 'First Feed', createdAt: new Date(now).toISOString() }],
  });

  return {
    now,
    pet: {
      isInitialized: true,
      hasHydrated: true,
      name: pet.name,
      stage: pet.stage,
      stats: pet.stats,
      personality: pet.personality,
      memories: pet.memories,
      lifecycle: pet.lifecycle,
      status: 'content',
      feedings: pet.feedings,
    },
    scanner: {
      isInitialized: true,
      scanState: 'idle',
      lastBarcode: '123',
      errorMessage: null,
    },
    inventory: {
      isInitialized: true,
      itemCount: 2,
    },
    settings: {
      isInitialized: true,
      hasHydrated: true,
      reducedMotion: false,
    },
    profile: {
      isInitialized: true,
      mode: 'guest',
      nickname: 'Rey',
    },
    ...overrides,
  };
};

describe('home hub view model', () => {
  it('builds a ready pet-first view model from store snapshots', () => {
    const viewModel = buildHomeHubViewModel(createInput());

    expect(viewModel.loadState).toBe('ready');
    expect(viewModel.pet).toMatchObject({ name: 'Scan Chan', status: 'content' });
    expect(viewModel.dailySummary).toMatchObject({ feedingsToday: 1, memoriesToday: 1, lastBarcode: '123' });
    expect(viewModel.statusCards.map((card) => card.id)).toEqual(['pet', 'scanner', 'inventory', 'settings', 'profile']);
  });

  it('exposes empty state without creating UI dependencies', () => {
    const empty = buildHomeHubViewModel(createInput({ pet: { ...createInput().pet, isInitialized: false } }));

    expect(empty).toMatchObject({ loadState: 'empty', isEmpty: true, pet: null, recommendedAction: 'scan' });
  });

  it('derives gentle next actions from existing pet stats only', () => {
    expect(buildHomeHubViewModel(createInput({ pet: { ...createInput().pet, stats: { ...initialPetStats, hunger: 20 } } })).recommendedAction).toBe('scan');
    expect(buildHomeHubViewModel(createInput({ pet: { ...createInput().pet, stats: { ...initialPetStats, mood: 20 } } })).recommendedAction).toBe('comfort');
    expect(buildHomeHubViewModel(createInput({ pet: { ...createInput().pet, stats: { ...initialPetStats, energy: 20 } } })).recommendedAction).toBe('rest');
    expect(buildHomeHubViewModel(createInput({ pet: { ...createInput().pet, stats: { ...initialPetStats, affection: 20 } } })).recommendedAction).toBe('pet');
  });

  it('keeps future mascot runtime data as a typed hint, not rendering logic', () => {
    const viewModel = buildHomeHubViewModel(createInput({ settings: { ...createInput().settings, reducedMotion: true } }));

    expect(viewModel.mascotRuntime).toMatchObject({
      phase: 'idle',
      emotion: 'content',
      animationIntent: { name: 'idle', intensity: 'minimal' },
    });
  });
});
