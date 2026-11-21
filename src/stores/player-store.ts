import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GameMode, GAME_CONFIG } from '@/lib/game-config';
import { applyStreakMultiplier } from '@/lib/streak-multiplier';
import { getStreakStatus, calculateNewStreak, recordScanStreak, getTodayString } from '@/lib/streak-helpers';

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
  selectedBorder: 'none' | 'bronze' | 'silver' | 'gold' | 'holographic';
  selectedTheme: string;
  selectedAccessory: 'none' | 'cowboy' | 'wizard' | 'shades';
  selectedTitle: string;
  selectedRoom: 'cozy' | 'kawaii-garden';
  isLoading: boolean;
  error: string | null;
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
  feedPet: (barcode: string, category: string) => void;
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

function generateCreatorId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `guest_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export const initialStoreState: PlayerState = {
  mode: null,
  nickname: null,
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
  petHunger: 50,
  petAffection: 10,
  foodInventory: {},
  selectedBorder: 'none',
  selectedTheme: 'default',
  selectedAccessory: 'none',
  selectedTitle: '',
  selectedRoom: 'cozy',
  isLoading: false,
  error: null,
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
          });
          return;
        }

        set({
          ...initialStoreState,
          nickname,
          avatar,
          mode: GameMode.GUEST,
          creatorId: generateCreatorId(),
          streak: 0,
          lastActiveDate: null,
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
          const scanHistory = [barcode, ...state.scanHistory];

          if (isOnCooldown) {
            return { scanHistory };
          }

          const todayStr = getTodayString();
          const { newStreak } = recordScanStreak(state.streak, state.lastActiveDate, todayStr);

          const baseXpGain = isNewProduct
            ? GAME_CONFIG.xp.scanNew
            : GAME_CONFIG.xp.scanExisting;

          const streakMultipliedXp = applyStreakMultiplier(baseXpGain, newStreak);
          const newXp = state.xp + streakMultipliedXp;
          const newLevel = levelFromXp(newXp);

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
            xp: newXp,
            level: newLevel,
            pendingXpGain: streakMultipliedXp,
            foodInventory: updatedFoodInventory,
          };
        });
      },

      registerProduct: (barcode: string, category: string) => {
        const now = Date.now();
        set((state) => {
          if (state.registeredBarcodes.includes(barcode)) {
            return {};
          }

          const todayStr = getTodayString();
          const { newStreak } = recordScanStreak(state.streak, state.lastActiveDate, todayStr);

          const totalXpGain = GAME_CONFIG.xp.registerProduct;
          const streakMultipliedXp = applyStreakMultiplier(totalXpGain, newStreak);
          const newXp = state.xp + streakMultipliedXp;
          const newLevel = levelFromXp(newXp);

          const foodCategories = ['snack', 'drink', 'candy', 'biscuit', 'dairy', 'instant', 'food'];
          const isFood = !category || foodCategories.some((c) => (category || '').toLowerCase().includes(c));
          const updatedFoodInventory = isFood
            ? { ...state.foodInventory, [barcode]: (state.foodInventory[barcode] || 0) + 1 }
            : state.foodInventory;

          return {
            registeredBarcodes: [...state.registeredBarcodes, barcode],
            lastRegisterTime: now,
            streak: newStreak,
            lastActiveDate: todayStr,
            xp: newXp,
            level: newLevel,
            pendingXpGain: streakMultipliedXp,
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
        const state = get();
        const { lastActiveDate, streak } = state;

        let newStreak = streak;
        if (lastActiveDate) {
          const lastDateParts = lastActiveDate.split('-').map(Number);
          const todayParts = localDateString.split('-').map(Number);
          const last = new Date(lastDateParts[0], lastDateParts[1] - 1, lastDateParts[2]);
          const today = new Date(todayParts[0], todayParts[1] - 1, todayParts[2]);
          const diffDays = Math.round((today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));

          // Real-time TikTok style: if user missed 1 full calendar day without scanning, streak drops to 0!
          if (diffDays > 1) {
            newStreak = 0;
          }
        }

        const newHunger = Math.max(0, state.petHunger - 25);
        const newAffection = newHunger === 0 ? Math.max(0, state.petAffection - 5) : state.petAffection;

        set({
          streak: newStreak,
          petHunger: newHunger,
          petAffection: newAffection,
        });
      },

      clearPendingXpGain: () => {
        set({ pendingXpGain: 0 });
      },

      resetPlayer: () => {
        set({ ...initialStoreState });
      },

      feedPet: (barcode: string, category: string) => {
        set((state) => {
          const currentQty = state.foodInventory[barcode] || 0;
          if (currentQty <= 0) return {};

          const updatedFoodInventory = { ...state.foodInventory };
          updatedFoodInventory[barcode] = currentQty - 1;
          if (updatedFoodInventory[barcode] <= 0) {
            delete updatedFoodInventory[barcode];
          }

          let hungerGain = 10;
          if (category === 'Snack') hungerGain = 15;
          else if (category === 'Dairy') hungerGain = 20;
          else if (category === 'Drink') hungerGain = 12;

          const affectionGain = 3;
          const xpGain = 10;

          const newHunger = Math.min(100, state.petHunger + hungerGain);
          const newAffection = Math.min(100, state.petAffection + affectionGain);
          const newXp = state.xp + xpGain;
          const newLevel = levelFromXp(newXp);

          let newStage = state.petStage;
          if (newAffection >= 90) newStage = 'LEGENDARY_CAT';
          else if (newAffection >= 75) newStage = 'WISE_CAT';
          else if (newAffection >= 50) newStage = 'ADULT_CAT';
          else if (newAffection >= 25) newStage = 'YOUNG_CAT';

          return {
            foodInventory: updatedFoodInventory,
            petHunger: newHunger,
            petAffection: newAffection,
            petStage: newStage,
            xp: newXp,
            level: newLevel,
          };
        });
      },

      renamePet: (name: string) => {
        set({ petName: name });
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
            const todayStr = getTodayString();
            let streak = typeof d.streak === 'number' ? d.streak : 0;
            const lastActiveDate = d.lastActiveDate ?? get().lastActiveDate;

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

            set({
              mode: GameMode.ARASHU,
              nickname: d.nickname || 'Hunter',
              avatar: d.avatar || 'calico',
              xp: typeof d.xp === 'number' ? d.xp : 0,
              level: levelFromXp(d.xp || 0),
              streak,
              lastActiveDate,
              petName: d.petName || 'Scan-chan Jr.',
              petStage: d.petStage || 'KITTEN',
              petHunger: typeof d.petHunger === 'number' ? d.petHunger : 50,
              petAffection: typeof d.petAffection === 'number' ? d.petAffection : 10,
              foodInventory: d.foodInventory || {},
              selectedTheme: d.selectedTheme || 'default',
              selectedBorder: d.selectedBorder || 'none',
              selectedAccessory: d.selectedAccessory || 'none',
              selectedTitle: d.selectedTitle || '',
              selectedRoom: d.selectedRoom || 'cozy',
              registeredBarcodes: Array.isArray(d.registeredBarcodes) ? d.registeredBarcodes : [],
              scanHistory: Array.isArray(d.scanHistory) ? d.scanHistory : [],
              isLoading: false,
            });
          }
        } catch (err: any) {
          console.warn('Profile load skipped or offline:', err);
          set({ isLoading: false, error: err.message });
        }
      },

      saveProfileToServer: async () => {
        const state = get();
        if (state.mode !== GameMode.ARASHU) return;

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
        }
      },
    }),
    {
      name: 'scan-chan-player-state',
      version: 2,
      migrate: (persistedState: any, _version: number) => {
        if (!persistedState || typeof persistedState !== 'object') {
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
        selectedBorder: state.selectedBorder,
        selectedTheme: state.selectedTheme,
        selectedAccessory: state.selectedAccessory,
        selectedTitle: state.selectedTitle,
        selectedRoom: state.selectedRoom,
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
