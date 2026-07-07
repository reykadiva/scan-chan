import { create } from 'zustand';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';
import type { MissionProgress } from '@/types/game';

export interface GameStoreState {
  isInitialized: boolean;
  hasHydrated: boolean;
  persistenceMode: 'guest' | 'arashu';
  xp: number;
  level: number;
  streak: number;
  lastActiveDate: string | null;
  registeredBarcodes: string[];
  scanHistory: string[];
  dailyMissions: MissionProgress[];
  pendingXpGain: number;
  rewardsQueue: string[];
  lastScanTime: Record<string, number>;
  lastRegisterTime: number | null;
  scanSessionState: 'idle' | 'ready' | 'complete' | 'error';
  initialize: () => void;
  setHydrated: (hasHydrated: boolean) => void;
  setPersistenceMode: (mode: 'guest' | 'arashu') => void;
  setProgress: (progress: Partial<Pick<GameStoreState, 'xp' | 'level' | 'streak' | 'lastActiveDate'>>) => void;
  recordScanPlaceholder: (barcodeNumber: string, scannedAt?: number) => void;
  registerBarcodePlaceholder: (barcodeNumber: string, registeredAt?: number) => void;
  setScanSessionState: (scanSessionState: GameStoreState['scanSessionState']) => void;
  clearPendingRewards: () => void;
  reset: () => void;
}

export const initialGameState = {
  isInitialized: false,
  hasHydrated: false,
  persistenceMode: 'guest' as const,
  xp: 0,
  level: 1,
  streak: 0,
  lastActiveDate: null as string | null,
  registeredBarcodes: [] as string[],
  scanHistory: [] as string[],
  dailyMissions: [] as MissionProgress[],
  pendingXpGain: 0,
  rewardsQueue: [] as string[],
  lastScanTime: {} as Record<string, number>,
  lastRegisterTime: null as number | null,
  scanSessionState: 'idle' as const,
};

const gameStorageKey = (mode: 'guest' | 'arashu') => `scan-chan-${mode}-game-state`;

export const useGameStore = create<GameStoreState>()(
  devtools(
    persist(
      (set) => ({
        ...initialGameState,
        initialize: () => set({ isInitialized: true }),
        setHydrated: (hasHydrated) => set({ hasHydrated }),
        setPersistenceMode: (persistenceMode) => {
          useGameStore.persist.setOptions({ name: gameStorageKey(persistenceMode) });
          set({ persistenceMode });
          void useGameStore.persist.rehydrate();
        },
        setProgress: (progress) => set(progress),
        recordScanPlaceholder: (barcodeNumber, scannedAt = Date.now()) =>
          set((state) => ({
            scanHistory: [...state.scanHistory, barcodeNumber],
            lastScanTime: { ...state.lastScanTime, [barcodeNumber]: scannedAt },
          })),
        registerBarcodePlaceholder: (barcodeNumber, registeredAt = Date.now()) =>
          set((state) => ({
            registeredBarcodes: state.registeredBarcodes.includes(barcodeNumber)
              ? state.registeredBarcodes
              : [...state.registeredBarcodes, barcodeNumber],
            lastRegisterTime: registeredAt,
          })),
        setScanSessionState: (scanSessionState) => set({ scanSessionState }),
        clearPendingRewards: () => set({ pendingXpGain: 0, rewardsQueue: [] }),
        reset: () =>
          set((state) => ({
            ...initialGameState,
            hasHydrated: state.hasHydrated,
            persistenceMode: state.persistenceMode,
          })),
      }),
      {
        name: gameStorageKey('guest'),
        version: 1,
        storage: createJSONStorage(() => localStorage),
        partialize: ({ xp, level, streak, lastActiveDate, registeredBarcodes, scanHistory, dailyMissions, pendingXpGain, rewardsQueue, lastScanTime, lastRegisterTime, persistenceMode }) => ({
          xp,
          level,
          streak,
          lastActiveDate,
          registeredBarcodes,
          scanHistory,
          dailyMissions,
          pendingXpGain,
          rewardsQueue,
          lastScanTime,
          lastRegisterTime,
          persistenceMode,
        }),
        onRehydrateStorage: () => (state) => state?.setHydrated(true),
      },
    ),
    { name: 'scan-chan-game-store' },
  ),
);

export const selectProgress = (state: GameStoreState) => ({
  xp: state.xp,
  level: state.level,
  streak: state.streak,
});
export const selectPendingRewards = (state: GameStoreState) => ({
  pendingXpGain: state.pendingXpGain,
  rewardsQueue: state.rewardsQueue,
});
