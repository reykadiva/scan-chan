import { describe, it, expect, beforeEach } from 'vitest';
import { usePlayerStore, levelFromXp, xpForLevel } from '@/stores/legacy/player-store';

describe('Player Store & Virtual Pet Mechanics', () => {
  beforeEach(() => {
    // Reset player state before each test
    usePlayerStore.getState().resetPlayer();
  });

  it('should initialize player with default pet stats', () => {
    const store = usePlayerStore.getState();
    store.initializePlayer('TestPlayer', 'calico');

    const updatedState = usePlayerStore.getState();
    expect(updatedState.nickname).toBe('TestPlayer');
    expect(updatedState.petName).toBe('Scan-chan Jr.');
    expect(updatedState.petStage).toBe('KITTEN');
    expect(updatedState.petHunger).toBe(50);
    expect(updatedState.petAffection).toBe(10);
  });

  it('should rename pet correctly', () => {
    const store = usePlayerStore.getState();
    store.initializePlayer('TestPlayer', 'calico');
    
    store.renamePet('Neko');
    expect(usePlayerStore.getState().petName).toBe('Neko');
  });

  it('should feed pet and update stats and evolve', () => {
    const store = usePlayerStore.getState();
    store.initializePlayer('TestPlayer', 'calico');

    // Initial state: hunger = 50, affection = 10, stage = KITTEN
    store.feedPet('12345678', 'Snack'); // Snack feeds +15 hunger, +3 affection, +10 XP

    let state = usePlayerStore.getState();
    expect(state.petHunger).toBe(65);
    expect(state.petAffection).toBe(13);
    expect(state.xp).toBe(10);
    expect(state.petStage).toBe('KITTEN');

    // Feed multiple times to trigger evolution
    // Affection increases by 3 per feed. To get past 25 (stage YOUNG_CAT), we feed 5 more times.
    for (let i = 0; i < 5; i++) {
      usePlayerStore.getState().feedPet('12345678', 'Dairy'); // Dairy feeds +20 hunger, +3 affection
    }

    state = usePlayerStore.getState();
    expect(state.petHunger).toBe(100); // capped at 100
    expect(state.petAffection).toBe(28); // 13 + 15 = 28
    expect(state.petStage).toBe('YOUNG_CAT'); // Evolved!
  });

  it('should decay hunger on daily reset', () => {
    const store = usePlayerStore.getState();
    store.initializePlayer('TestPlayer', 'calico');

    // Set hunger and affection
    usePlayerStore.setState({ petHunger: 40, petAffection: 30, lastActiveDate: '2026-07-05' });

    // Daily reset to a new day
    usePlayerStore.getState().checkDailyReset('2026-07-06');

    const state = usePlayerStore.getState();
    expect(state.petHunger).toBe(25); // 40 - 15 = 25
    expect(state.petAffection).toBe(30); // hunger not 0, affection stays same
  });
});
