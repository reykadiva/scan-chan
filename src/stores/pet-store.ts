import { create } from 'zustand';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';

export interface PetStoreState {
  isInitialized: boolean;
  hasHydrated: boolean;
  persistenceMode: 'guest' | 'arashu';
  name: string;
  stage: 'kitten' | 'young' | 'adult' | 'wise' | 'legendary';
  hunger: number;
  mood: number;
  energy: number;
  affection: number;
  curiosity: number;
  personality: 'gentle' | 'curious' | 'playful' | 'sleepy';
  memories: string[];
  lastDecayTimestamp: number | null;
  accessories: string[];
  furniture: string[];
  currentAnimation: string | null;
  interactionState: 'idle' | 'pending';
  initialize: () => void;
  setHydrated: (hasHydrated: boolean) => void;
  setPersistenceMode: (mode: 'guest' | 'arashu') => void;
  updateIdentity: (identity: Partial<Pick<PetStoreState, 'name' | 'stage'>>) => void;
  updateStats: (stats: Partial<Pick<PetStoreState, 'hunger' | 'mood' | 'energy' | 'affection' | 'curiosity'>>) => void;
  queueAnimation: (animation: string | null) => void;
  reset: () => void;
}

export const initialPetState = {
  isInitialized: false,
  hasHydrated: false,
  persistenceMode: 'guest' as const,
  name: 'Scan Chan',
  stage: 'kitten' as const,
  hunger: 100,
  mood: 100,
  energy: 100,
  affection: 25,
  curiosity: 50,
  personality: 'gentle' as const,
  memories: [] as string[],
  lastDecayTimestamp: null as number | null,
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
        updateStats: (stats) => set(stats),
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
        partialize: ({ name, stage, hunger, mood, energy, affection, curiosity, personality, memories, lastDecayTimestamp, accessories, furniture, persistenceMode }) => ({
          name,
          stage,
          hunger,
          mood,
          energy,
          affection,
          curiosity,
          personality,
          memories,
          lastDecayTimestamp,
          accessories,
          furniture,
          persistenceMode,
        }),
        onRehydrateStorage: () => (state) => state?.setHydrated(true),
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
