import { create } from 'zustand';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';
import {
  applyPetFeeding,
  applyPetInteraction,
  applyPassivePetDecay,
  applyPetStatUpdate,
  calculatePetLifecycle,
  calculatePetStatus,
  initialPetPersonality,
  initialPetStats,
} from '@/lib/pet';
import type {
  FeedingRecord,
  FoodModel,
  PetInteractionHistory,
  PetInteractionType,
  PetLifecycleState,
  PetMemory,
  PetPersonalityState,
  PetStageName,
  PetStatsState,
  PetStatus,
} from '@/types/pet';

export interface PetStoreState {
  isInitialized: boolean;
  hasHydrated: boolean;
  persistenceMode: 'guest' | 'arashu';
  name: string;
  stage: PetStageName;
  hunger: number;
  mood: number;
  energy: number;
  affection: number;
  curiosity: number;
  personality: PetPersonalityState;
  memories: PetMemory[];
  lifecycle: PetLifecycleState;
  status: PetStatus;
  lastDecayTimestamp: number | null;
  interactions: PetInteractionHistory;
  feedings: FeedingRecord[];
  accessories: string[];
  furniture: string[];
  currentAnimation: string | null;
  interactionState: 'idle' | 'pending';
  initialize: () => void;
  setHydrated: (hasHydrated: boolean) => void;
  setPersistenceMode: (mode: 'guest' | 'arashu') => void;
  updateIdentity: (identity: Partial<Pick<PetStoreState, 'name' | 'stage'>>) => void;
  updateStats: (stats: Partial<PetStatsState>) => void;
  applyDecay: (now: number) => void;
  recordMemory: (memory: PetMemory) => void;
  interact: (type: PetInteractionType, now: number) => void;
  feed: (food: FoodModel, now: number) => void;
  queueAnimation: (animation: string | null) => void;
  reset: () => void;
}

export const initialPetState = {
  isInitialized: false,
  hasHydrated: false,
  persistenceMode: 'guest' as const,
  name: 'Scan Chan',
  stage: 'kitten' as const,
  ...initialPetStats,
  personality: initialPetPersonality,
  memories: [] as PetMemory[],
  lifecycle: 'awake' as const,
  status: 'content' as const,
  lastDecayTimestamp: null as number | null,
  interactions: {} as PetInteractionHistory,
  feedings: [] as FeedingRecord[],
  accessories: [] as string[],
  furniture: [] as string[],
  currentAnimation: null as string | null,
  interactionState: 'idle' as const,
};

const petStorageKey = (mode: 'guest' | 'arashu') => `scan-chan-${mode}-pet-state`;

export const usePetStore = create<PetStoreState>()(
  devtools(
    persist(
      (set) => ({
        ...initialPetState,
        initialize: () => set({ isInitialized: true }),
        setHydrated: (hasHydrated) => set({ hasHydrated }),
        setPersistenceMode: (persistenceMode) => {
          usePetStore.persist.setOptions({ name: petStorageKey(persistenceMode) });
          set({ persistenceMode });
          void usePetStore.persist.rehydrate();
        },
        updateIdentity: (identity) => set(identity),
        updateStats: (stats) =>
          set((state) => {
            const nextStats = applyPetStatUpdate(selectPetStats(state), stats);

            return {
              ...nextStats,
              lifecycle: calculatePetLifecycle(nextStats),
              status: calculatePetStatus(nextStats),
            };
          }),
        applyDecay: (now) =>
          set((state) => {
            const elapsedHours = state.lastDecayTimestamp === null ? 0 : (now - state.lastDecayTimestamp) / 3_600_000;
            const nextStats = applyPassivePetDecay(selectPetStats(state), elapsedHours);

            return {
              ...nextStats,
              lifecycle: calculatePetLifecycle(nextStats),
              status: calculatePetStatus(nextStats),
              lastDecayTimestamp: now,
            };
          }),
        recordMemory: (memory) => set((state) => ({ memories: [...state.memories, memory] })),
        interact: (type, now) =>
          set((state) => {
            const result = applyPetInteraction(toPetStateModel(state), { type, now });
            const next = result.pet;

            return {
              ...next.stats,
              personality: next.personality,
              memories: [...next.memories],
              lifecycle: next.lifecycle,
              status: calculatePetStatus(next.stats),
              interactions: next.interactions,
            };
          }),
        feed: (food, now) =>
          set((state) => {
            const result = applyPetFeeding(toPetStateModel(state), { food, now });
            const next = result.pet;

            return {
              ...next.stats,
              personality: next.personality,
              memories: [...next.memories],
              lifecycle: next.lifecycle,
              status: calculatePetStatus(next.stats),
              feedings: [...next.feedings],
            };
          }),
        queueAnimation: (currentAnimation) => set({ currentAnimation }),
        reset: () =>
          set((state) => ({
            ...initialPetState,
            hasHydrated: state.hasHydrated,
            persistenceMode: state.persistenceMode,
          })),
      }),
      {
        name: petStorageKey('guest'),
        version: 1,
        storage: createJSONStorage(() => localStorage),
        partialize: ({ name, stage, hunger, mood, energy, affection, curiosity, personality, memories, lifecycle, status, lastDecayTimestamp, interactions, feedings, accessories, furniture, persistenceMode }) => ({
          name,
          stage,
          hunger,
          mood,
          energy,
          affection,
          curiosity,
          personality,
          memories,
          lifecycle,
          status,
          lastDecayTimestamp,
          interactions,
          feedings,
          accessories,
          furniture,
          persistenceMode,
        }),
        onRehydrateStorage: () => {
          return (state) => {
            if (state) {
              state.setHydrated(true);
              if (!state.isInitialized) {
                state.initialize();
              }
            }
          };
        },
      },
    ),
    { name: 'scan-chan-pet-store' },
  ),
);

export const selectPetStats = (state: PetStoreState) => ({
  hunger: state.hunger,
  mood: state.mood,
  energy: state.energy,
  affection: state.affection,
  curiosity: state.curiosity,
});
export const selectPetIdentity = (state: PetStoreState) => ({
  name: state.name,
  stage: state.stage,
  personality: state.personality,
});

const toPetStateModel = (state: PetStoreState) => ({
  name: state.name,
  stage: state.stage,
  stats: selectPetStats(state),
  personality: state.personality,
  memories: state.memories,
  lifecycle: state.lifecycle,
  lastDecayTimestamp: state.lastDecayTimestamp,
  interactions: state.interactions,
  feedings: state.feedings,
});
