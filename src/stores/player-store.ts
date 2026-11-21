import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GameMode, GAME_CONFIG } from '@/lib/game-config';
import { applyStreakMultiplier } from '@/lib/streak-multiplier';
import { getStreakStatus, calculateNewStreak, recordScanStreak, getTodayString, getLocalDateKey } from '@/lib/streak-helpers';

// ─── State shape ─────────────────────────────────────────────────────────────

export interface PlayerState {
  mode: GameMode | null;
  isProfileLoaded: boolean;
  nickname: string | null;
  userEmail: string | null;
  avatar: string | null;
  creatorId: string;
  xp: number;
  level: number;
  streak: number;
  lastActiveDate: string | null;
  registeredBarcodes: string[];
  scanHistory: string[];
  lastScanTime: Record<string, number>;
  lastRegisterTime: number;
  lastDeleteTime: number;
  pendingXpGain: number;
  petName: string;
  petStage: 'KITTEN' | 'YOUNG_CAT' | 'ADULT_CAT' | 'WISE_CAT' | 'LEGENDARY_CAT';
  petHunger: number;
  petAffection: number;
  foodInventory: Record<string, number>;
  lastPetTime: number;
  dailyPetCount: number;
  lastPetDate: string | null;
  lastFedBarcode: string;
  lastFedAt: number;
  lastHungerDecayAt: number;
  lastAffectionDecayAt: number;
  selectedBorder: 'none' | 'bronze' | 'silver' | 'gold' | 'holographic';
  selectedTheme: string;
  selectedAccessory: 'none' | 'cowboy' | 'wizard' | 'shades';
  selectedTitle: string;
  selectedRoom: 'cozy' | 'kawaii-garden';
  isLoading: boolean;
  error: string | null;
  lastLocalMutationAt: number;
  isSaving: boolean;
}

// ─── Actions ─────────────────────────────────────────────────────────────────

export interface PlayerActions {
  initializePlayer: (nickname: string, avatar: string) => void;
  setMode: (mode: GameMode | null) => void;
  addXP: (amount: number) => void;
  recordScan: (barcode: string, isNewProduct: boolean, category: string) => void;
  registerProduct: (barcode: string, category: string) => void;
  unregisterProduct: (barcode: string) => void;
  checkDailyReset: (localDateString?: string) => void;
  clearPendingXpGain: () => void;
  resetPlayer: () => void;
  feedPet: (barcode: string, category: string) => void;
  applyHungerDecay: () => void;
  applyAffectionDecay: () => void;
  petCat: () => {
    success: boolean;
    reason?: 'cooldown' | 'daily_limit';
    dailyCount?: number;
    newAffection?: number;
    isMaxedJustNow?: boolean;
  };
  renamePet: (name: string) => void;
  selectBorder: (border: 'none' | 'bronze' | 'silver' | 'gold' | 'holographic') => void;
  selectTheme: (theme: string) => void;
  selectAccessory: (accessory: 'none' | 'cowboy' | 'wizard' | 'shades') => void;
  selectTitle: (title: string) => void;
  loadProfile: () => Promise<void>;
  saveProfileToServer: () => Promise<void>;
  selectRoom: (room: 'cozy' | 'kawaii-garden') => void;
}

export type PlayerStore = PlayerState & PlayerActions;

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  let total = 0;
  for (let l = 2; l <= level; l++) {
    total += GAME_CONFIG.levelFormula(l);
  }
  return total;
}

export function levelFromXp(totalXp: number): number {
  let level = 1;
  while (totalXp >= xpForLevel(level + 1)) {
    level++;
    if (level >= 100) break;
  }
  return level;
}

export function getPetStageFromLevel(
  level: number
): 'KITTEN' | 'YOUNG_CAT' | 'ADULT_CAT' | 'WISE_CAT' | 'LEGENDARY_CAT' {
  const lvl = Math.max(1, Math.floor(level || 1));
  if (lvl >= 30) return 'LEGENDARY_CAT';
  if (lvl >= 20) return 'WISE_CAT';
  if (lvl >= 10) return 'ADULT_CAT';
  if (lvl >= 5) return 'YOUNG_CAT';
  return 'KITTEN';
}

function generateCreatorId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `guest_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export const initialStoreState: PlayerState = {
  mode: null,
  isProfileLoaded: false,
  nickname: null,
  userEmail: null,
  avatar: null,
  creatorId: '',
  xp: 0,
  level: 1,
  streak: 0,
  lastActiveDate: null,
  registeredBarcodes: [],
  scanHistory: [],
  lastScanTime: {},
  lastRegisterTime: 0,
  lastDeleteTime: 0,
  pendingXpGain: 0,
  petName: 'Scan-chan Jr.',
  petStage: 'KITTEN',
  petHunger: 80,
  petAffection: 80,
  foodInventory: {},
  lastPetTime: 0,
  dailyPetCount: 0,
  lastPetDate: null,
  lastFedBarcode: '',
  lastFedAt: 0,
  lastHungerDecayAt: 0,
  lastAffectionDecayAt: 0,
  selectedBorder: 'none',
  selectedTheme: 'default',
  selectedAccessory: 'none',
  selectedTitle: '',
  selectedRoom: 'cozy',
  isLoading: false,
  error: null,
  lastLocalMutationAt: 0,
  isSaving: false,
};

// ─── Store ───────────────────────────────────────────────────────────────────

export const usePlayerStore = create<PlayerStore>()(
  persist(
    (set, get) => ({
      ...initialStoreState,

      initializePlayer: (nickname: string, avatar: string) => {
        const state = get();

        if (state.xp > 0 || state.petAffection > 10) {
          set({
            nickname,
            avatar,
            mode: state.mode || GameMode.GUEST,
            isProfileLoaded: true,
          });
          return;
        }

        set({
          ...initialStoreState,
          nickname,
          avatar,
          mode: GameMode.GUEST,
          isProfileLoaded: true,
          creatorId: generateCreatorId(),
          streak: 0,
          lastActiveDate: null,
          petHunger: 80,
          petAffection: 80,
          lastFedAt: Date.now(),
          lastHungerDecayAt: Date.now(),
          lastAffectionDecayAt: Date.now(),
        });
      },

      setMode: (mode: GameMode | null) => {
        set((state) => ({
          mode,
          ...(mode === GameMode.GUEST && { isProfileLoaded: true }),
        }));
      },

      addXP: (amount: number) => {
        const currentTotalXp = Math.max(0, Number(get().xp) || 0);
        const newTotalXp = currentTotalXp + amount;
        const newLevel = levelFromXp(newTotalXp);
        const newStage = getPetStageFromLevel(newLevel);
        set({
          xp: newTotalXp,
          level: newLevel,
          petStage: newStage,
          pendingXpGain: amount,
          lastLocalMutationAt: Date.now(),
        });
      },

      recordScan: (barcode: string, isNewProduct: boolean, category: string) => {
        const now = Date.now();
        const lastScanTime = get().lastScanTime;
        const lastScan = lastScanTime[barcode] ?? 0;
        const cooldownMs = GAME_CONFIG.cooldowns.scanSameBarcodeSeconds * 1000;

        const isOnCooldown = now - lastScan < cooldownMs;

        set((state) => {
          const scanHistory = [barcode, ...state.scanHistory];

          if (isOnCooldown) {
            return { scanHistory };
          }

          const todayStr = getLocalDateKey();
          const { newStreak } = recordScanStreak(state.streak, state.lastActiveDate, todayStr);

          const baseXpGain = isNewProduct
            ? GAME_CONFIG.xp.scanNew
            : GAME_CONFIG.xp.scanExisting;

          const streakMultipliedXp = applyStreakMultiplier(baseXpGain, newStreak);
          const currentTotalXp = Math.max(0, Number(state.xp) || 0);
          const newTotalXp = currentTotalXp + streakMultipliedXp;
          const newLevel = levelFromXp(newTotalXp);
          const newStage = getPetStageFromLevel(newLevel);

          const foodCategories = ['snack', 'drink', 'candy', 'biscuit', 'dairy', 'instant', 'food'];
          const isFood = !category || foodCategories.some((c) => (category || '').toLowerCase().includes(c));
          const updatedFoodInventory = isFood
            ? { ...state.foodInventory, [barcode]: (state.foodInventory[barcode] || 0) + 1 }
            : state.foodInventory;

          return {
            scanHistory,
            lastScanTime: { ...state.lastScanTime, [barcode]: now },
            streak: newStreak,
            lastActiveDate: todayStr,
            xp: newTotalXp,
            level: newLevel,
            petStage: newStage,
            pendingXpGain: streakMultipliedXp,
            foodInventory: updatedFoodInventory,
            lastLocalMutationAt: now,
          };
        });

        if (get().mode === GameMode.ARASHU && get().isProfileLoaded) {
          get().saveProfileToServer().catch(() => {});
        }
      },

      registerProduct: (barcode: string, category: string) => {
        const cleanBarcode = String(barcode || '').trim();
        if (!cleanBarcode) return;
        const now = Date.now();
        set((state) => {
          if (state.registeredBarcodes.includes(cleanBarcode)) {
            return {};
          }

          const todayStr = getLocalDateKey();
          const { newStreak } = recordScanStreak(state.streak, state.lastActiveDate, todayStr);

          // +10 XP scan + 50 XP discovery bonus = 60 XP total
          const totalXpGain = GAME_CONFIG.xp.registerProduct + GAME_CONFIG.xp.scanExisting;
          const streakMultipliedXp = applyStreakMultiplier(totalXpGain, newStreak);
          const currentTotalXp = Math.max(0, Number(state.xp) || 0);
          const newTotalXp = currentTotalXp + streakMultipliedXp;
          const newLevel = levelFromXp(newTotalXp);
          const newStage = getPetStageFromLevel(newLevel);

          const foodCategories = ['snack', 'drink', 'candy', 'biscuit', 'dairy', 'instant', 'food'];
          const isFood = !category || foodCategories.some((c) => (category || '').toLowerCase().includes(c));
          const updatedFoodInventory = isFood
            ? { ...state.foodInventory, [cleanBarcode]: (state.foodInventory[cleanBarcode] || 0) + 1 }
            : state.foodInventory;

          const updatedScanHistory = state.scanHistory.includes(cleanBarcode)
            ? state.scanHistory
            : [cleanBarcode, ...state.scanHistory];

          return {
            registeredBarcodes: [...state.registeredBarcodes, cleanBarcode],
            scanHistory: updatedScanHistory,
            lastScanTime: { ...state.lastScanTime, [cleanBarcode]: now },
            lastRegisterTime: now,
            streak: newStreak,
            lastActiveDate: todayStr,
            xp: newTotalXp,
            level: newLevel,
            petStage: newStage,
            pendingXpGain: streakMultipliedXp,
            foodInventory: updatedFoodInventory,
            lastLocalMutationAt: now,
          };
        });

        if (get().mode === GameMode.ARASHU && get().isProfileLoaded) {
          get().saveProfileToServer().catch(() => {});
        }
      },

      unregisterProduct: (barcode: string) => {
        set((state) => ({
          registeredBarcodes: state.registeredBarcodes.filter((b) => b !== barcode),
          lastDeleteTime: Date.now(),
          lastLocalMutationAt: Date.now(),
        }));
      },

      checkDailyReset: (localDateString?: string) => {
        const state = get();
        const todayStr = localDateString || getLocalDateKey();
        const { lastActiveDate, streak } = state;

        let newStreak = streak;
        if (lastActiveDate) {
          if (lastActiveDate === todayStr) {
            newStreak = Math.max(1, streak);
          } else {
            const lastDateParts = lastActiveDate.split('-').map(Number);
            const todayParts = todayStr.split('-').map(Number);
            const last = new Date(lastDateParts[0], lastDateParts[1] - 1, lastDateParts[2]);
            const today = new Date(todayParts[0], todayParts[1] - 1, todayParts[2]);
            const diffDays = Math.round((today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));

            // Real-time daily streak: if user missed 1 full calendar day without scanning, streak drops to 0
            if (diffDays > 1) {
              newStreak = 0;
            }
          }
        } else {
          newStreak = 0;
        }

        const isNewPetDay = state.lastPetDate !== todayStr;
        const newDailyPetCount = isNewPetDay ? 0 : (state.dailyPetCount || 0);

        set({
          streak: newStreak,
          dailyPetCount: newDailyPetCount,
          ...(isNewPetDay && { lastPetDate: todayStr }),
        });

        // Apply time-based real-time hunger and affection decay accurately
        get().applyHungerDecay();
        get().applyAffectionDecay();

        if (isNewPetDay && get().mode === GameMode.ARASHU && get().isProfileLoaded) {
          get().saveProfileToServer().catch(() => {});
        }
      },

      clearPendingXpGain: () => {
        set({ pendingXpGain: 0 });
      },

      resetPlayer: () => {
        set({ ...initialStoreState, isProfileLoaded: false });
      },

      feedPet: (barcode: string, category: string) => {
        const cleanBarcode = String(barcode || '').trim();
        if (!cleanBarcode) return;

        const now = Date.now();
        set((state) => {
          const rawQty = state.foodInventory[cleanBarcode];
          const currentQty = typeof rawQty === 'number' ? rawQty : Number(rawQty) || 0;
          if (currentQty <= 0) return {};

          const updatedFoodInventory = { ...state.foodInventory };
          const newQty = currentQty - 1;
          if (newQty <= 0) {
            delete updatedFoodInventory[cleanBarcode];
          } else {
            updatedFoodInventory[cleanBarcode] = newQty;
          }

          const cat = (category || '').toLowerCase();
          let hungerGain = 15;
          if (cat.includes('dairy') || cat.includes('milk') || cat.includes('cheese') || cat.includes('yogurt')) {
            hungerGain = 20;
          } else if (cat.includes('drink') || cat.includes('beverage') || cat.includes('juice') || cat.includes('water')) {
            hungerGain = 12;
          } else if (cat.includes('instant') || cat.includes('noodle') || cat.includes('ramen') || cat.includes('meal')) {
            hungerGain = 25;
          } else if (cat.includes('snack') || cat.includes('candy') || cat.includes('biscuit') || cat.includes('cookie') || cat.includes('food')) {
            hungerGain = 15;
          }

          const currentHunger = Math.max(0, Math.min(100, Number(state.petHunger) || 0));
          const currentAffection = Math.max(0, Math.min(100, Number(state.petAffection) || 0));
          const currentTotalXp = Math.max(0, Number(state.xp) || 0);

          const wasDead = currentHunger === 0;
          const isSpecialFood = cat.includes('snack') || cat.includes('candy') || cat.includes('biscuit')
            || cat.includes('treat') || cat.includes('cookie') || cat.includes('cake') || cat.includes('dessert');
          const baseAffection = isSpecialFood ? 10 : 3;
          const varietyBonus = cleanBarcode !== state.lastFedBarcode ? 5 : 0;
          const revivalBonus = wasDead ? 6 : 0;
          const affectionGain = baseAffection + varietyBonus + revivalBonus;
          const xpGain = 10;

          const newHunger = Math.min(100, currentHunger + hungerGain);
          const newAffection = Math.min(100, currentAffection + affectionGain);
          const newTotalXp = currentTotalXp + xpGain;
          const newLevel = levelFromXp(newTotalXp);
          const newStage = getPetStageFromLevel(newLevel);

          return {
            foodInventory: updatedFoodInventory,
            petHunger: newHunger,
            petAffection: newAffection,
            petStage: newStage,
            lastFedBarcode: cleanBarcode,
            lastFedAt: now,
            lastHungerDecayAt: now,
            lastAffectionDecayAt: now,
            xp: newTotalXp,
            level: newLevel,
            lastLocalMutationAt: now,
          };
        });

        // Instant cloud sync for Hunter Mode (anti-rollback)
        if (get().mode === GameMode.ARASHU && get().isProfileLoaded) {
          get().saveProfileToServer().catch(() => {});
        }
      },

      applyHungerDecay: () => {
        const state = get();
        const now = Date.now();

        // If no timestamp exists yet or unmigrated (<= 0), initialize to now without deducting hunger
        if (!state.lastHungerDecayAt || state.lastHungerDecayAt <= 0) {
          set({
            lastHungerDecayAt: now,
            lastFedAt: state.lastFedAt > 0 ? state.lastFedAt : now,
          });
          return;
        }

        const lastDecay = state.lastHungerDecayAt;
        const elapsedMs = now - lastDecay;
        if (elapsedMs <= 0) return;

        // Proportional hunger decay: 1 point every 15 minutes (= 4 points / hour, ~25 hours from 100 to 0)
        const intervalMs = 15 * 60 * 1000;
        const decayPerInterval = 1;

        const intervalsPassed = Math.floor(elapsedMs / intervalMs);
        if (intervalsPassed <= 0) return;

        // Sanity cap: never deduct more than 15 hunger points in a single calculation cycle
        const rawDecay = intervalsPassed * decayPerInterval;
        const totalDecay = Math.min(15, rawDecay);

        const currentHunger = Math.max(0, Math.min(100, Number(state.petHunger) || 0));
        const newHunger = Math.max(0, currentHunger - totalDecay);

        // If elapsed time was exceptionally long (> 48h), reset anchor to now
        const newLastDecayAt = elapsedMs > 48 * 60 * 60 * 1000
          ? now
          : lastDecay + intervalsPassed * intervalMs;

        set({
          petHunger: newHunger,
          lastHungerDecayAt: newLastDecayAt,
          lastLocalMutationAt: now,
        });

        if (get().mode === GameMode.ARASHU && get().isProfileLoaded) {
          get().saveProfileToServer().catch(() => {});
        }
      },

      applyAffectionDecay: () => {
        const state = get();
        const now = Date.now();

        // If no timestamp exists yet or unmigrated (<= 0), initialize to now without deducting happiness
        if (!state.lastAffectionDecayAt || state.lastAffectionDecayAt <= 0) {
          set({ lastAffectionDecayAt: now });
          return;
        }

        const lastDecay = state.lastAffectionDecayAt;
        const elapsedMs = now - lastDecay;
        if (elapsedMs <= 0) return;

        const hunger = Number(state.petHunger) || 0;
        let intervalMs: number;
        let decayPerInterval: number;

        if (hunger === 0) {
          // Fainted condition: -5 Happiness every 1 hour
          intervalMs = 60 * 60 * 1000;
          decayPerInterval = 5;
        } else if (hunger < 30) {
          // Hungry condition: -2 Happiness every 1 hour
          intervalMs = 60 * 60 * 1000;
          decayPerInterval = 2;
        } else {
          // Normal condition (hunger >= 30): -1 Happiness every 2 hours
          intervalMs = 2 * 60 * 60 * 1000;
          decayPerInterval = 1;
        }

        const intervalsPassed = Math.floor(elapsedMs / intervalMs);
        if (intervalsPassed <= 0) return;

        // Sanity cap: never deduct more than 15 happiness points in a single calculation cycle
        const rawDecay = intervalsPassed * decayPerInterval;
        const totalDecay = Math.min(15, rawDecay);

        const currentAffection = Math.max(0, Math.min(100, Number(state.petAffection) || 0));
        const newAffection = Math.max(0, currentAffection - totalDecay);

        // If elapsed time was exceptionally long (> 48h, e.g. unmigrated old account), reset anchor to now
        const newLastDecayAt = elapsedMs > 48 * 60 * 60 * 1000
          ? now
          : lastDecay + intervalsPassed * intervalMs;

        const currentStage = getPetStageFromLevel(state.level);

        set({
          petAffection: newAffection,
          petStage: currentStage,
          lastAffectionDecayAt: newLastDecayAt,
          lastLocalMutationAt: now,
        });

        if (get().mode === GameMode.ARASHU && get().isProfileLoaded) {
          get().saveProfileToServer().catch(() => {});
        }
      },

      petCat: () => {
        const state = get();
        const now = Date.now();
        const todayStr = getLocalDateKey();

        // Auto-detect new day transition on interaction
        const isNewDay = state.lastPetDate !== todayStr;
        const currentDailyPets = isNewDay ? 0 : (state.dailyPetCount || 0);

        // 10s cooldown check
        if (now - (state.lastPetTime || 0) < 10000) {
          return {
            success: false,
            reason: 'cooldown' as const,
            dailyCount: currentDailyPets,
          };
        }

        // Daily limit check: max 3 pets per day
        if (currentDailyPets >= 3) {
          return {
            success: false,
            reason: 'daily_limit' as const,
            dailyCount: currentDailyPets,
          };
        }

        const newDailyPets = currentDailyPets + 1;
        const currentAffection = Math.max(0, Math.min(100, Number(state.petAffection) || 0));
        const newAffection = Math.min(100, currentAffection + 5);

        const currentStage = getPetStageFromLevel(state.level);

        set({
          petAffection: newAffection,
          petStage: currentStage,
          lastPetTime: now,
          dailyPetCount: newDailyPets,
          lastPetDate: todayStr,
          lastAffectionDecayAt: now,
          lastLocalMutationAt: now,
        });

        if (get().mode === GameMode.ARASHU && get().isProfileLoaded) {
          get().saveProfileToServer().catch(() => {});
        }

        return {
          success: true,
          dailyCount: newDailyPets,
          newAffection,
          isMaxedJustNow: newDailyPets === 3,
        };
      },

      renamePet: (name: string) => {
        set({ petName: name, lastLocalMutationAt: Date.now() });
        get().saveProfileToServer().catch(() => {});
      },

      selectBorder: (border) => {
        set({ selectedBorder: border });
      },

      selectTheme: (theme) => {
        set({ selectedTheme: theme });
      },

      selectAccessory: (accessory) => {
        set({ selectedAccessory: accessory });
      },

      selectTitle: (title: string) => {
        set({ selectedTitle: title });
      },

      selectRoom: (room) => {
        set({ selectedRoom: room });
      },

      loadProfile: async () => {
        set({ isLoading: true, error: null });
        try {
          const res = await fetch('/api/profile');
          if (!res.ok) {
            throw new Error(`Failed to load profile (${res.status})`);
          }
          const json = await res.json();
          if (json.success && json.data) {
            const d = json.data;
            const currentState = get();
            const todayStr = getTodayString();
            let streak = typeof d.streak === 'number' ? d.streak : 0;
            const lastActiveDate = d.lastActiveDate ?? currentState.lastActiveDate;

            // Audit streak upon loading: if user missed more than 1 day, reset to 0
            if (lastActiveDate && streak > 0) {
              const lastParts = lastActiveDate.split('-').map(Number);
              const todayParts = todayStr.split('-').map(Number);
              const last = new Date(lastParts[0], lastParts[1] - 1, lastParts[2]);
              const today = new Date(todayParts[0], todayParts[1] - 1, todayParts[2]);
              const diffDays = Math.round((today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
              if (diffDays > 1) {
                streak = 0;
              }
            }

            const localPetName = currentState.petName;
            let finalPetName = d.petName || 'Scan-chan Jr.';
            if (currentState.isProfileLoaded && (!d.petName || d.petName === 'Scan-chan Jr.') && localPetName && localPetName !== 'Scan-chan Jr.') {
              finalPetName = localPetName;
              setTimeout(() => {
                get().saveProfileToServer().catch(() => {});
              }, 500);
            }

            // ANTI-ROLLBACK GUARD:
            // If local state was mutated recently (< 6 seconds) while already loaded,
            // or if a save is currently in-flight, preserve fresh local inventory & pet vitals!
            const timeSinceLastMutation = Date.now() - (currentState.lastLocalMutationAt || 0);
            const isRecentMutation = currentState.isProfileLoaded && timeSinceLastMutation < 6000;
            const isSaving = currentState.isSaving;
            const protectLocalVitals = isRecentMutation || isSaving;

            const finalHunger = protectLocalVitals
              ? currentState.petHunger
              : (typeof d.petHunger === 'number' ? d.petHunger : 80);

            const finalAffection = protectLocalVitals
              ? currentState.petAffection
              : (typeof d.petAffection === 'number' ? d.petAffection : 80);

            const finalFoodInventory = protectLocalVitals
              ? currentState.foodInventory
              : (d.foodInventory && typeof d.foodInventory === 'object' ? d.foodInventory : {});

            const finalLastFedBarcode = protectLocalVitals
              ? currentState.lastFedBarcode
              : (d.lastFedBarcode || '');

            const todayKey = getLocalDateKey();
            const serverPetDate = d.lastPetDate || null;
            const finalLastPetDate = protectLocalVitals
              ? currentState.lastPetDate
              : serverPetDate;

            const finalDailyPetCount = protectLocalVitals
              ? currentState.dailyPetCount
              : (serverPetDate === todayKey && typeof d.dailyPetCount === 'number' ? d.dailyPetCount : 0);

            const finalLastFedAt = protectLocalVitals
              ? (currentState.lastFedAt || Date.now())
              : (typeof d.lastFedAt === 'number' && d.lastFedAt > 0
                  ? d.lastFedAt
                  : (currentState.lastFedAt || Date.now()));

            const finalLastHungerDecayAt = protectLocalVitals
              ? (currentState.lastHungerDecayAt || Date.now())
              : (typeof d.lastHungerDecayAt === 'number' && d.lastHungerDecayAt > 0
                  ? d.lastHungerDecayAt
                  : (currentState.lastHungerDecayAt || Date.now()));

            const finalLastAffectionDecayAt = protectLocalVitals
              ? (currentState.lastAffectionDecayAt || Date.now())
              : (typeof d.lastAffectionDecayAt === 'number' && d.lastAffectionDecayAt > 0
                  ? d.lastAffectionDecayAt
                  : (currentState.lastAffectionDecayAt || Date.now()));

            const serverXp = typeof d.xp === 'number' ? d.xp : 0;
            const finalXp = Math.max(currentState.xp, serverXp);
            const finalLevel = levelFromXp(finalXp);
            const finalStage = getPetStageFromLevel(finalLevel);

            const mergedRegisteredBarcodes = Array.from(new Set([
              ...currentState.registeredBarcodes,
              ...(Array.isArray(d.registeredBarcodes) ? d.registeredBarcodes : []),
            ]));

            const mergedScanHistory = Array.from(new Set([
              ...currentState.scanHistory,
              ...(Array.isArray(d.scanHistory) ? d.scanHistory : []),
            ]));

            set({
              isProfileLoaded: true,
              mode: GameMode.ARASHU,
              nickname: d.nickname || 'Hunter',
              userEmail: d.email || currentState.userEmail || null,
              avatar: d.avatar || 'calico',
              xp: finalXp,
              level: finalLevel,
              streak,
              lastActiveDate,
              petName: finalPetName,
              petStage: finalStage,
              petHunger: finalHunger,
              petAffection: finalAffection,
              foodInventory: finalFoodInventory,
              lastFedBarcode: finalLastFedBarcode,
              lastFedAt: finalLastFedAt,
              lastHungerDecayAt: finalLastHungerDecayAt,
              dailyPetCount: finalDailyPetCount,
              lastPetDate: finalLastPetDate,
              lastAffectionDecayAt: finalLastAffectionDecayAt,
              selectedTheme: d.selectedTheme || currentState.selectedTheme || 'default',
              selectedBorder: d.selectedBorder || currentState.selectedBorder || 'none',
              selectedAccessory: d.selectedAccessory || currentState.selectedAccessory || 'none',
              selectedTitle: d.selectedTitle || currentState.selectedTitle || '',
              selectedRoom: d.selectedRoom || currentState.selectedRoom || 'cozy',
              registeredBarcodes: mergedRegisteredBarcodes,
              scanHistory: mergedScanHistory,
              isLoading: false,
            });

            // Calculate and apply accurate time-based hunger and affection decay
            get().applyHungerDecay();
            get().applyAffectionDecay();

            // If we protected local vitals against stale server data, trigger an instant save
            if (protectLocalVitals) {
              get().saveProfileToServer().catch(() => {});
            }
          }
        } catch (err: any) {
          console.warn('Profile load skipped or offline:', err);
          set({ isLoading: false, error: err.message });
        }
      },

      saveProfileToServer: async () => {
        const state = get();
        // CRITICAL GUARD: Never save if not in Hunter Mode or if cloud profile has not been hydrated yet
        if (state.mode !== GameMode.ARASHU || !state.isProfileLoaded) {
          return;
        }

        set({ isSaving: true });
        try {
          await fetch('/api/profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              xp: state.xp,
              streak: state.streak,
              lastActiveDate: state.lastActiveDate,
              petName: state.petName,
              petStage: state.petStage,
              petHunger: state.petHunger,
              petAffection: state.petAffection,
              foodInventory: state.foodInventory,
              lastFedBarcode: state.lastFedBarcode,
              lastFedAt: state.lastFedAt,
              lastHungerDecayAt: state.lastHungerDecayAt,
              dailyPetCount: state.dailyPetCount,
              lastPetDate: state.lastPetDate,
              lastAffectionDecayAt: state.lastAffectionDecayAt,
              selectedTheme: state.selectedTheme,
              selectedBorder: state.selectedBorder,
              selectedAccessory: state.selectedAccessory,
              selectedTitle: state.selectedTitle,
              selectedRoom: state.selectedRoom,
              registeredBarcodes: state.registeredBarcodes,
              scanHistory: state.scanHistory,
            }),
          });
        } catch (err) {
          console.error('Failed to sync profile to server:', err);
        } finally {
          set({ isSaving: false });
        }
      },
    }),
    {
      name: 'scan-chan-player-state',
      version: 3,
      migrate: (persistedState: any, version: number) => {
        // Migration to version 3: wipe corrupt/stale legacy storage for clean testing
        if (!persistedState || typeof persistedState !== 'object' || version < 3) {
          return initialStoreState;
        }
        return {
          ...initialStoreState,
          ...persistedState,
        };
      },
      // Persist only essential offline state for guest mode
      partialize: (state) => ({
        mode: state.mode,
        nickname: state.nickname,
        avatar: state.avatar,
        creatorId: state.creatorId,
        xp: state.xp,
        level: state.level,
        streak: state.streak,
        lastActiveDate: state.lastActiveDate,
        registeredBarcodes: state.registeredBarcodes,
        scanHistory: state.scanHistory,
        petName: state.petName,
        petStage: state.petStage,
        petHunger: state.petHunger,
        petAffection: state.petAffection,
        foodInventory: state.foodInventory,
        lastPetTime: state.lastPetTime,
        dailyPetCount: state.dailyPetCount,
        lastPetDate: state.lastPetDate,
        lastFedBarcode: state.lastFedBarcode,
        lastFedAt: state.lastFedAt,
        lastHungerDecayAt: state.lastHungerDecayAt,
        lastAffectionDecayAt: state.lastAffectionDecayAt,
        selectedBorder: state.selectedBorder,
        selectedTheme: state.selectedTheme,
        selectedAccessory: state.selectedAccessory,
        selectedTitle: state.selectedTitle,
        selectedRoom: state.selectedRoom,
        lastLocalMutationAt: state.lastLocalMutationAt,
      }),
    }
  )
);

// Auto-sync for ARASHU mode
if (typeof window !== 'undefined') {
  let saveTimeout: any = null;
  usePlayerStore.subscribe((state) => {
    if (state.mode !== GameMode.ARASHU) return;
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      state.saveProfileToServer();
    }, 1000);
  });
}
