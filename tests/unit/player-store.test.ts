import { describe, it, expect, beforeEach } from 'vitest';
import { usePlayerStore } from '@/stores/legacy/player-store';

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

    // Add food to inventory first
    usePlayerStore.setState({
      foodInventory: {
        '12345678': 1,
        'dairy-bar': 5,
      }
    });

    // Initial state: hunger = 50, affection = 10, stage = KITTEN
    store.feedPet('12345678', 'Snack'); // Snack feeds +15 hunger, +3 affection, +10 XP

    let state = usePlayerStore.getState();
    expect(state.petHunger).toBe(65);
    expect(state.petAffection).toBe(13);
    expect(state.xp).toBe(10);
    expect(state.petStage).toBe('KITTEN');
    expect(state.foodInventory['12345678']).toBeUndefined(); // consumed!

    // Feed multiple times to trigger evolution
    // Affection increases by 3 per feed. To get past 25 (stage YOUNG_CAT), we feed 5 more times.
    for (let i = 0; i < 5; i++) {
      usePlayerStore.getState().feedPet('dairy-bar', 'Dairy'); // Dairy feeds +20 hunger, +3 affection
    }

    state = usePlayerStore.getState();
    expect(state.petHunger).toBe(100); // capped at 100
    expect(state.petAffection).toBe(28); // 13 + 15 = 28
    expect(state.petStage).toBe('YOUNG_CAT'); // Evolved!
    expect(state.foodInventory['dairy-bar']).toBeUndefined(); // all 5 consumed!
  });

  it('should decay hunger on daily reset', () => {
    const store = usePlayerStore.getState();
    store.initializePlayer('TestPlayer', 'calico');

    // Set hunger and affection
    usePlayerStore.setState({ petHunger: 40, petAffection: 30, lastActiveDate: '2026-07-05' });

    // Daily reset to a new day
    usePlayerStore.getState().checkDailyReset('2026-07-06');

    const state = usePlayerStore.getState();
    expect(state.petHunger).toBe(15); // 40 - 25 = 15
    expect(state.petAffection).toBe(30); // hunger not 0, affection stays same
  });

  it('should handle customized titles and pet accessories', () => {
    const store = usePlayerStore.getState();
    expect(store.selectedTitle).toBe('');
    expect(store.selectedAccessory).toBe('none');

    store.selectTitle('Soda King');
    store.selectAccessory('wizard');

    const state = usePlayerStore.getState();
    expect(state.selectedTitle).toBe('Soda King');
    expect(state.selectedAccessory).toBe('wizard');
  });

  it('should increase affection and xp when petting the cat', () => {
    const store = usePlayerStore.getState();
    store.initializePlayer('TestPlayer', 'calico');

    const initialAffection = store.petAffection; // 10
    const initialXp = store.xp; // 0

    // Pet the cat
    store.petCat();

    const state = usePlayerStore.getState();
    expect(state.petAffection).toBe(initialAffection + 5); // 15
    expect(state.xp).toBe(initialXp + 5); // 5
    expect(state.lastPetTime).toBeGreaterThan(0);

    // Petting again immediately during 3s cooldown should not change affection
    store.petCat();
    expect(usePlayerStore.getState().petAffection).toBe(initialAffection + 5);
  });

  it('should claim daily login rewards and increment calendar', () => {
    const store = usePlayerStore.getState();
    store.initializePlayer('TestPlayer', 'calico');

    const todayStr = new Date().toLocaleDateString('en-CA');
    const reward = store.claimLoginReward(todayStr);

    const state = usePlayerStore.getState();
    expect(state.loginCalendar).toContain(todayStr);
    expect(reward.xp).toBeGreaterThan(0);
    expect(reward.food).toBe(true); // Day 1-3 gives food reward

    // Claiming again today should yield no rewards
    const secondReward = store.claimLoginReward(todayStr);
    expect(secondReward.xp).toBe(0);
  });

  it('should select room backgrounds', () => {
    const store = usePlayerStore.getState();
    store.initializePlayer('TestPlayer', 'calico');
    expect(store.selectedRoom).toBe('cozy');

    store.selectRoom('cyberpunk-cafe');
    expect(usePlayerStore.getState().selectedRoom).toBe('cyberpunk-cafe');
  });

  it('should generate and complete bounty hunts on recordScan', () => {
    const store = usePlayerStore.getState();
    store.initializePlayer('TestPlayer', 'calico');
    expect(store.activeBounty).toBeNull();

    // Generate bounty
    store.generateBounty();
    const activeBounty = usePlayerStore.getState().activeBounty;
    expect(activeBounty).not.toBeNull();
    const category = activeBounty!.category;

    // Scan a product matching the category
    store.recordScan('barcode123', true, category);

    // Bounty should be completed and rewards given
    const state = usePlayerStore.getState();
    expect(state.activeBounty).toBeNull();
    expect(state.xp).toBeGreaterThan(0);
  });

  it('should track category scans', () => {
    const store = usePlayerStore.getState();
    store.initializePlayer('TestPlayer', 'calico');

    store.recordScan('barcode1', true, 'Snack');
    store.recordScan('barcode2', true, 'Snack');
    store.recordScan('barcode3', true, 'Drink');

    const state = usePlayerStore.getState();
    expect(state.categoryScans['Snack']).toBe(2);
    expect(state.categoryScans['Drink']).toBe(1);
  });
});
