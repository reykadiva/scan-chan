import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GameMode, GAME_CONFIG } from '@/lib/game-config';
import type { MissionProgress } from '@/types';
import { generateDailyMissions, evaluateMissions } from '@/lib/legacy/game-engine';
import { applyStreakMultiplier } from '@/lib/streak-multiplier';
import { getStreakStatus, calculateNewStreak } from '@/lib/streak-helpers';

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
  scanHistory: string[];            // Full history, UI slices to 5
  lastScanTime: Record<string, number>;
  lastRegisterTime: number;
  lastDeleteTime: number;
  // XP popup trigger — set to xpAmount when XP is awarded, then cleared by UI
  pendingXpGain: number;
  // ponytail: virtual pet states
  petName: string;
  petStage: 'KITTEN' | 'YOUNG_CAT' | 'ADULT_CAT' | 'WISE_CAT' | 'LEGENDARY_CAT';
  petHunger: number;
  petAffection: number;
  foodInventory: Record<string, number>; // ponytail: tracks quantity of available food items
  selectedBorder: 'none' | 'bronze' | 'silver' | 'gold' | 'holographic';
  selectedTheme: 'default' | 'kawaii' | 'cyberpunk';
  selectedAccessory: 'none' | 'cowboy' | 'wizard' | 'shades';
  selectedTitle: string;
  lastPetTime: number;
  // Feature #1: Daily Login Calendar
  loginCalendar: string[]; // dates (YYYY-MM-DD) where reward was claimed
  // Feature #2: Custom Room Backgrounds
  selectedRoom: 'cozy' | 'kawaii-garden';
  // Feature #3: Bounty Hunt
  activeBounty: { category: string; description: string; expiresAt: number; xpBonus: number } | null;
  // Feature #4: Category Master Badges
  categoryScans: Record<string, number>;
  nightScans: number;
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
  resetPlayer: () => void;
  // ponytail: virtual pet actions
  feedPet: (barcode: string, category: string) => void;
  renamePet: (name: string) => void;
  selectBorder: (border: 'none' | 'bronze' | 'silver' | 'gold' | 'holographic') => void;
  selectTheme: (theme: 'default' | 'kawaii' | 'cyberpunk') => void;
  selectAccessory: (accessory: 'none' | 'cowboy' | 'wizard' | 'shades') => void;
  selectTitle: (title: string) => void;
  petCat: () => void;
  loadProfile: () => Promise<void>;
  // Feature #1: Daily Login Calendar
  claimLoginReward: (dateStr: string) => { xp: number; food: boolean; affection: number; border: string | null };
  // Feature #2: Room Backgrounds
  selectRoom: (room: 'cozy' | 'kawaii-garden') => void;
  // Feature #3: Bounty Hunt
  generateBounty: () => void;
  completeBounty: () => void;
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
  scanHistory: [],
  lastScanTime: {},
  lastRegisterTime: 0,
  lastDeleteTime: 0,
  pendingXpGain: 0,
  // ponytail: pet defaults
  petName: 'Scan-chan Jr.',
  petStage: 'KITTEN',
  petHunger: 50,
  petAffection: 10,
  foodInventory: {},
  selectedBorder: 'none',
  selectedTheme: 'default',
  selectedAccessory: 'none',
  selectedTitle: '',
  lastPetTime: 0,
  loginCalendar: [],
  selectedRoom: 'cozy',
  activeBounty: null,
  categoryScans: {},
  nightScans: 0,
};

// ─── Store ───────────────────────────────────────────────────────────────────

export const usePlayerStore = create<PlayerStore>()(
  persist(
    (set, get) => ({
      ...initialStoreState,

      initializePlayer: (nickname: string, avatar: string) => {
        const todayStr = new Date().toLocaleDateString('en-CA');
        const state = get();

        // If Guest player already has progress accumulated, preserve it rather than resetting to defaults!
        if (state.xp > 0 || state.petAffection > 10) {
          set({
            nickname,
            avatar,
            mode: GameMode.GUEST,
            lastActiveDate: todayStr,
          });
          return;
        }

        // Clean slate for brand-new users
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
          // Apply streak multiplier to XP calculation
          const streakMultipliedXp = applyStreakMultiplier(totalXpGain, state.streak);
          const newXp = state.xp + streakMultipliedXp;
          const newLevel = levelFromXp(newXp);

          // ponytail: add consumable food item to inventory
          const isConsumable = ['Snack', 'Drink', 'Candy', 'Biscuit', 'Dairy'].includes(category);
          const updatedFoodInventory = { ...state.foodInventory };
          if (isConsumable) {
            updatedFoodInventory[barcode] = (updatedFoodInventory[barcode] || 0) + 1;
          }

          // Feature #4: Category Master tracking
          const updatedCategoryScans = { ...state.categoryScans };
          if (category && category !== 'Other') {
            updatedCategoryScans[category] = (updatedCategoryScans[category] || 0) + 1;
          }
          const hour = new Date().getHours();
          const isNight = hour >= 23 || hour < 5;

          // Feature #3: Bounty completion check
          let bountyXpBonus = 0;
          let updatedBounty = state.activeBounty;
          if (updatedBounty && updatedBounty.category === category && Date.now() < updatedBounty.expiresAt) {
            bountyXpBonus = updatedBounty.xpBonus;
            updatedBounty = null; // consumed
          }

          const totalFinalXp = newXp + bountyXpBonus;
          const finalLevel = levelFromXp(totalFinalXp);

          return {
            scanHistory,
            xp: totalFinalXp,
            level: finalLevel,
            pendingXpGain: streakMultipliedXp + bountyXpBonus,
            dailyMissions: updatedMissions,
            lastScanTime: { ...state.lastScanTime, [barcode]: now },
            foodInventory: updatedFoodInventory,
            categoryScans: updatedCategoryScans,
            nightScans: isNight ? state.nightScans + 1 : state.nightScans,
            activeBounty: updatedBounty,
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
          // Apply streak multiplier to XP calculation
          const streakMultipliedXp = applyStreakMultiplier(totalXpGain, state.streak);
          const newXp = state.xp + streakMultipliedXp;
          const newLevel = levelFromXp(newXp);

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
            pendingXpGain: streakMultipliedXp,
            dailyMissions: updatedMissions,
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
        const currentStreak = get().streak;
        
        if (!lastDate) {
          // First time ever
          set({
            lastActiveDate: localDateString,
            streak: 1,
            dailyMissions: generateDailyMissions(localDateString),
          });
          return;
        }

        if (lastDate === localDateString) {
          // Already checked/initialized today - no reset needed
          return;
        }

        // Calculate streak status for new day (strict logic)
        const status = getStreakStatus(lastDate, localDateString, currentStreak);
        const nextStreak = calculateNewStreak(currentStreak, status);

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
      selectAccessory: (accessory) => set({ selectedAccessory: accessory }),
      selectTitle: (title) => set({ selectedTitle: title }),
      petCat: () => {
        set((state) => {
          const now = Date.now();
          const isCooldown = now - state.lastPetTime < 3000;
          if (isCooldown) return {};

          const nextAffection = Math.min(100, state.petAffection + 5);

          let nextStage: typeof state.petStage = 'KITTEN';
          if (nextAffection < 25) nextStage = 'KITTEN';
          else if (nextAffection < 50) nextStage = 'YOUNG_CAT';
          else if (nextAffection < 75) nextStage = 'ADULT_CAT';
          else if (nextAffection < 95) nextStage = 'WISE_CAT';
          else nextStage = 'LEGENDARY_CAT';

          const xpGain = 5;
          const newXp = state.xp + xpGain;
          const newLevel = levelFromXp(newXp);

          return {
            petAffection: nextAffection,
            petStage: nextStage,
            xp: newXp,
            level: newLevel,
            pendingXpGain: xpGain,
            lastPetTime: now,
          };
        });
      },

      renamePet: (name: string) => {
        set({ petName: name });
      },

      // Feature #1: Daily Login Calendar & Streak Rewards
      claimLoginReward: (dateStr: string) => {
        const state = get();
        if (state.loginCalendar.includes(dateStr)) {
          return { xp: 0, food: false, affection: 0, border: null };
        }

        const newCalendar = [...state.loginCalendar, dateStr];

        // Count consecutive days ending at dateStr
        let consecutiveDays = 0;
        const today = new Date(dateStr);
        for (let i = 0; i < 30; i++) {
          const checkDate = new Date(today);
          checkDate.setDate(checkDate.getDate() - i);
          const checkStr = checkDate.toLocaleDateString('en-CA');
          if (newCalendar.includes(checkStr)) {
            consecutiveDays++;
          } else {
            break;
          }
        }

        let xpReward = 20;
        let giveFood = false;
        let affectionBoost = 0;
        let borderReward: string | null = null;

        // Day 1-3: +20 XP & random food
        if (consecutiveDays <= 3) {
          giveFood = true;
        }
        // Day 5: +15 affection boost
        if (consecutiveDays >= 5) {
          affectionBoost = 15;
          xpReward = 30;
        }
        // Day 7: unlock Streak Master border
        if (consecutiveDays >= 7) {
          borderReward = 'holographic';
          xpReward = 50;
        }

        const newXp = state.xp + xpReward;
        const newLevel = levelFromXp(newXp);
        const newAffection = Math.min(100, state.petAffection + affectionBoost);

        // Auto-generate a food item
        const updatedFoodInventory = { ...state.foodInventory };
        if (giveFood) {
          const randomFoodKey = `login-reward-${dateStr}`;
          updatedFoodInventory[randomFoodKey] = (updatedFoodInventory[randomFoodKey] || 0) + 1;
        }

        set({
          loginCalendar: newCalendar,
          xp: newXp,
          level: newLevel,
          pendingXpGain: xpReward,
          petAffection: newAffection,
          foodInventory: updatedFoodInventory,
        });

        return { xp: xpReward, food: giveFood, affection: affectionBoost, border: borderReward };
      },

      // Feature #2: Room Backgrounds
      selectRoom: (room) => {
        set({ selectedRoom: room });
      },

      // Feature #3: Bounty Hunt
      generateBounty: () => {
        const categories = ['Drink', 'Snack', 'Candy', 'Biscuit', 'Dairy'];
        const descriptions: Record<string, string> = {
          Drink: '🥤 "I\'m so thirsty~ Scan any drink for me!"',
          Snack: '🍿 "Something crunchy please! Scan a snack!"',
          Candy: '🍬 "Sweets! I want candy! Scan one now~"',
          Biscuit: '🍪 "Cookie time! Scan any biscuit!"',
          Dairy: '🥛 "Milk please~ Scan any dairy product!"',
        };
        const cat = categories[Math.floor(Math.random() * categories.length)];
        const twoHoursMs = 2 * 60 * 60 * 1000;

        set({
          activeBounty: {
            category: cat,
            description: descriptions[cat],
            expiresAt: Date.now() + twoHoursMs,
            xpBonus: 30,
          },
        });
      },

      completeBounty: () => {
        set({ activeBounty: null });
      },

      loadProfile: async () => {
        try {
          const res = await fetch('/api/profile');
          const data = await res.json();
          if (data.success && data.data) {
            set({
              xp: data.data.xp,
              level: data.data.level,
              streak: data.data.streak,
              petName: data.data.petName,
              petStage: data.data.petStage,
              petHunger: data.data.petHunger,
              petAffection: data.data.petAffection,
              foodInventory: data.data.foodInventory || {},
              selectedTheme: data.data.selectedTheme,
              selectedBorder: data.data.selectedBorder,
              selectedAccessory: data.data.selectedAccessory,
              selectedTitle: data.data.selectedTitle,
              selectedRoom: data.data.selectedRoom || 'cozy',
              loginCalendar: data.data.loginCalendar || [],
              categoryScans: data.data.categoryScans || {},
              nightScans: data.data.nightScans || 0,
            });
          }
        } catch (err) {
          console.error('Failed to load profile from database', err);
        }
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

const saveProfile = async (state: any) => {
  if (state.mode !== GameMode.ARASHU) return;
  if (state.nickname === 'Arashu Tester') return; // Skip database save for mocked dev account
  try {
    await fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        xp: state.xp,
        level: state.level,
        streak: state.streak,
        petName: state.petName,
        petStage: state.petStage,
        petHunger: state.petHunger,
        petAffection: state.petAffection,
        foodInventory: state.foodInventory || {},
        selectedTheme: state.selectedTheme,
        selectedBorder: state.selectedBorder,
        selectedAccessory: state.selectedAccessory,
        selectedTitle: state.selectedTitle,
        selectedRoom: state.selectedRoom,
        loginCalendar: state.loginCalendar,
        categoryScans: state.categoryScans,
        nightScans: state.nightScans,
      }),
    });
  } catch (err) {
    console.error('Failed to sync profile with database', err);
  }
};

if (typeof window !== 'undefined') {
  let saveTimeout: any = null;
  usePlayerStore.subscribe((state) => {
    if (state.mode !== GameMode.ARASHU) return;
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      saveProfile(state);
    }, 1500);
  });
}
