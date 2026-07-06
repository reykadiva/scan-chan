import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GameMode, GAME_CONFIG } from '@/lib/game-config';
import type { MissionProgress } from '@/types';
import { generateDailyMissions, evaluateMissions, checkNewAchievements } from '@/lib/legacy/game-engine';

// ─── State shape ─────────────────────────────────────────────────────────────

export interface PlayerState {
  mode: GameMode | null;
  nickname: string | null;
  avatar: string | null;
  creatorId: string;
  xp: number;
  level: number;
  streak: number;
  lastActiveDate: string | null;
  registeredBarcodes: string[];
  dailyMissions: MissionProgress[];
  unlockedAchievements: string[];
  scanHistory: string[];            // Full history, UI slices to 5
  lastScanTime: Record<string, number>;
  lastRegisterTime: number;
  lastDeleteTime: number;
  // XP popup trigger — set to xpAmount when XP is awarded, then cleared by UI
  pendingXpGain: number;
  pendingAchievementUnlocks: string[];
  // ponytail: virtual pet states
  petName: string;
  petStage: 'KITTEN' | 'YOUNG_CAT' | 'ADULT_CAT' | 'WISE_CAT' | 'LEGENDARY_CAT';
  petHunger: number;
  petAffection: number;
  foodInventory: Record<string, number>; // ponytail: tracks quantity of available food items
  selectedBorder: 'none' | 'bronze' | 'silver' | 'gold' | 'holographic';
  selectedTheme: 'default' | 'kawaii' | 'cyberpunk';
}

// ─── Actions ─────────────────────────────────────────────────────────────────

export interface PlayerActions {
  initializePlayer: (nickname: string, avatar: string) => void;
  setMode: (mode: GameMode | null) => void;
  addXP: (amount: number) => void;
  recordScan: (barcode: string, isNewProduct: boolean, category: string) => void;
  registerProduct: (barcode: string, category: string) => void;
  unregisterProduct: (barcode: string) => void;
  checkDailyReset: (localDateString: string) => void;
  clearPendingXpGain: () => void;
  clearPendingAchievementUnlocks: () => void;
  resetPlayer: () => void;
  // ponytail: virtual pet actions
  feedPet: (barcode: string, category: string) => void;
  renamePet: (name: string) => void;
  selectBorder: (border: 'none' | 'bronze' | 'silver' | 'gold' | 'holographic') => void;
  selectTheme: (theme: 'default' | 'kawaii' | 'cyberpunk') => void;
}

export type PlayerStore = PlayerState & PlayerActions;

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Total XP required to reach a given level from level 1. */
export function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  let total = 0;
  for (let l = 2; l <= level; l++) {
    total += GAME_CONFIG.levelFormula(l);
  }
  return total;
}

/** Derive level from cumulative XP. */
export function levelFromXp(totalXp: number): number {
  let level = 1;
  while (totalXp >= xpForLevel(level + 1)) {
    level++;
    // Safety cap — prevents infinite loop if config is miscalibrated
    if (level >= 100) break;
  }
  return level;
}

function generateCreatorId(): string {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// ─── Initial state ────────────────────────────────────────────────────────────

const initialStoreState: PlayerState = {
  mode: null,
  nickname: null,
  avatar: null,
  creatorId: '',
  xp: 0,
  level: 1,
  streak: 0,
  lastActiveDate: null,
  registeredBarcodes: [],
  dailyMissions: [],
  unlockedAchievements: [],
  scanHistory: [],
  lastScanTime: {},
  lastRegisterTime: 0,
  lastDeleteTime: 0,
  pendingXpGain: 0,
  pendingAchievementUnlocks: [],
  // ponytail: pet defaults
  petName: 'Scan-chan Jr.',
  petStage: 'KITTEN',
  petHunger: 50,
  petAffection: 10,
  foodInventory: {},
  selectedBorder: 'none',
  selectedTheme: 'default',
};

// ─── Store ───────────────────────────────────────────────────────────────────

export const usePlayerStore = create<PlayerStore>()(
  persist(
    (set, get) => ({
      ...initialStoreState,

      initializePlayer: (nickname: string, avatar: string) => {
        const todayStr = new Date().toLocaleDateString('en-CA');
        set({
          ...initialStoreState,
          nickname,
          avatar,
          mode: GameMode.GUEST,
          creatorId: generateCreatorId(),
          streak: 1,
          lastActiveDate: todayStr,
          dailyMissions: generateDailyMissions(todayStr),
        });
      },

      setMode: (mode: GameMode | null) => {
        set({ mode });
      },

      addXP: (amount: number) => {
        const newXp = get().xp + amount;
        const newLevel = levelFromXp(newXp);
        set({ xp: newXp, level: newLevel, pendingXpGain: amount });
      },

      recordScan: (barcode: string, isNewProduct: boolean, category: string) => {
        const now = Date.now();
        const lastScanTime = get().lastScanTime;
        const lastScan = lastScanTime[barcode] ?? 0;
        const cooldownMs = GAME_CONFIG.cooldowns.scanSameBarcodeSeconds * 1000;

        const isOnCooldown = now - lastScan < cooldownMs;

        set((state) => {
          // Always record in history
          const scanHistory = [barcode, ...state.scanHistory];

          // Only award XP if not on cooldown
          if (isOnCooldown) {
            return { scanHistory };
          }

          const baseXpGain = isNewProduct
             ? GAME_CONFIG.xp.scanNew
             : GAME_CONFIG.xp.scanExisting;

          // 1. Evaluate daily missions
          const { updatedMissions, xpEarned: missionXp } = evaluateMissions(
            state.dailyMissions,
            'scan',
            { isNewProduct, category }
          );

          const totalXpGain = baseXpGain + missionXp;
          const newXp = state.xp + totalXpGain;
          const newLevel = levelFromXp(newXp);

          // 2. Check achievements
          const newlyUnlocked = checkNewAchievements({
            scanHistory,
            registeredBarcodes: state.registeredBarcodes,
            level: newLevel,
            streak: state.streak,
            unlockedAchievements: state.unlockedAchievements,
          });

          // ponytail: add consumable food item to inventory
          const isConsumable = ['Snack', 'Drink', 'Candy', 'Biscuit', 'Dairy'].includes(category);
          const updatedFoodInventory = { ...state.foodInventory };
          if (isConsumable) {
            updatedFoodInventory[barcode] = (updatedFoodInventory[barcode] || 0) + 1;
          }

          return {
            scanHistory,
            xp: newXp,
            level: newLevel,
            pendingXpGain: totalXpGain,
            pendingAchievementUnlocks: [...state.pendingAchievementUnlocks, ...newlyUnlocked],
            dailyMissions: updatedMissions,
            unlockedAchievements: [...state.unlockedAchievements, ...newlyUnlocked],
            lastScanTime: { ...state.lastScanTime, [barcode]: now },
            foodInventory: updatedFoodInventory,
          };
        });
      },

      registerProduct: (barcode: string, category: string) => {
        const baseXpGain = GAME_CONFIG.xp.registerProduct;

        set((state) => {
          const registeredBarcodes = [...state.registeredBarcodes, barcode];

          // 1. Evaluate daily missions
          const { updatedMissions, xpEarned: missionXp } = evaluateMissions(
            state.dailyMissions,
            'register',
            { barcode }
          );

          const totalXpGain = baseXpGain + missionXp;
          const newXp = state.xp + totalXpGain;
          const newLevel = levelFromXp(newXp);

          // 2. Check achievements
          const newlyUnlocked = checkNewAchievements({
            scanHistory: state.scanHistory,
            registeredBarcodes,
            level: newLevel,
            streak: state.streak,
            unlockedAchievements: state.unlockedAchievements,
          });

          // ponytail: add consumable food item to inventory
          const isConsumable = ['Snack', 'Drink', 'Candy', 'Biscuit', 'Dairy'].includes(category);
          const updatedFoodInventory = { ...state.foodInventory };
          if (isConsumable) {
            updatedFoodInventory[barcode] = (updatedFoodInventory[barcode] || 0) + 1;
          }

          return {
            registeredBarcodes,
            lastRegisterTime: Date.now(),
            xp: newXp,
            level: newLevel,
            pendingXpGain: totalXpGain,
            pendingAchievementUnlocks: [...state.pendingAchievementUnlocks, ...newlyUnlocked],
            dailyMissions: updatedMissions,
            unlockedAchievements: [...state.unlockedAchievements, ...newlyUnlocked],
            foodInventory: updatedFoodInventory,
          };
        });
      },

      unregisterProduct: (barcode: string) => {
        set((state) => ({
          registeredBarcodes: state.registeredBarcodes.filter((b) => b !== barcode),
          lastDeleteTime: Date.now(),
        }));
      },

      checkDailyReset: (localDateString: string) => {
        const lastDate = get().lastActiveDate;
        if (!lastDate) {
          set({
            lastActiveDate: localDateString,
            streak: 1,
            dailyMissions: generateDailyMissions(localDateString),
          });
          return;
        }

        if (lastDate === localDateString) {
          // Already checked/initialized today
          return;
        }

        // Parse date diff to calculate streak status
        const lastDateParts = lastDate.split('-').map(Number);
        const currentDateParts = localDateString.split('-').map(Number);

        // Date objects in local timezone representation
        const last = new Date(lastDateParts[0], lastDateParts[1] - 1, lastDateParts[2]);
        const current = new Date(currentDateParts[0], currentDateParts[1] - 1, currentDateParts[2]);
        
        const diffTime = Math.abs(current.getTime() - last.getTime());
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

        let nextStreak = get().streak;
        if (diffDays === 1) {
          nextStreak += 1;
        } else if (diffDays > 1) {
          nextStreak = 1;
        }

        const newMissions = generateDailyMissions(localDateString);

        // ponytail: daily pet hunger decay (decay by 25 per day)
        // if hunger becomes 0, affection decreases by 5
        const currentHunger = get().petHunger;
        const currentAffection = get().petAffection;
        const nextHunger = Math.max(0, currentHunger - 25);
        const nextAffection = nextHunger === 0 ? Math.max(0, currentAffection - 5) : currentAffection;

        // ponytail: adjust stage based on decay
        let nextStage = get().petStage;
        if (nextAffection < 25) nextStage = 'KITTEN';
        else if (nextAffection < 50) nextStage = 'YOUNG_CAT';
        else if (nextAffection < 75) nextStage = 'ADULT_CAT';
        else if (nextAffection < 95) nextStage = 'WISE_CAT';
        else nextStage = 'LEGENDARY_CAT';

        set({
          lastActiveDate: localDateString,
          streak: nextStreak,
          dailyMissions: newMissions,
          petHunger: nextHunger,
          petAffection: nextAffection,
          petStage: nextStage,
        });
      },

      clearPendingXpGain: () => {
        set({ pendingXpGain: 0 });
      },

      clearPendingAchievementUnlocks: () => {
        set({ pendingAchievementUnlocks: [] });
      },

      resetPlayer: () => {
        set({ ...initialStoreState });
      },

      // ponytail: virtual pet feed actions
      feedPet: (barcode: string, category: string) => {
        set((state) => {
          // Check if food is in inventory and has quantity
          const currentQty = state.foodInventory[barcode] || 0;
          if (currentQty <= 0) return {}; // ponytail: no food left, do nothing

          const updatedFoodInventory = { ...state.foodInventory };
          updatedFoodInventory[barcode] = currentQty - 1;
          if (updatedFoodInventory[barcode] <= 0) {
            delete updatedFoodInventory[barcode];
          }

          // Food values based on category
          let feedValue = 10;
          if (category === 'Snack') feedValue = 15;
          if (category === 'Drink') feedValue = 12;
          if (category === 'Candy') feedValue = 8;
          if (category === 'Biscuit') feedValue = 14;
          if (category === 'Dairy') feedValue = 20;

          const nextHunger = Math.min(100, state.petHunger + feedValue);
          const nextAffection = Math.min(100, state.petAffection + 3);

          // evolution stages based on affection
          let nextStage: typeof state.petStage = 'KITTEN';
          if (nextAffection < 25) nextStage = 'KITTEN';
          else if (nextAffection < 50) nextStage = 'YOUNG_CAT';
          else if (nextAffection < 75) nextStage = 'ADULT_CAT';
          else if (nextAffection < 95) nextStage = 'WISE_CAT';
          else nextStage = 'LEGENDARY_CAT';

          // reward XP for caring
          const xpGain = 10;
          const newXp = state.xp + xpGain;
          const newLevel = levelFromXp(newXp);

          return {
            petHunger: nextHunger,
            petAffection: nextAffection,
            petStage: nextStage,
            xp: newXp,
            level: newLevel,
            pendingXpGain: xpGain,
            foodInventory: updatedFoodInventory,
          };
        });
      },

      selectBorder: (border) => set({ selectedBorder: border }),
      selectTheme: (theme) => set({ selectedTheme: theme }),

      renamePet: (name: string) => {
        set({ petName: name });
      },
    }),
    {
      name: 'scan-chan-player-state',
      version: 1,
      migrate: (persistedState: unknown, _version: number) => {
        void _version; // Reserved for future schema migrations
        return persistedState as PlayerStore;
      },
    }
  )
);
