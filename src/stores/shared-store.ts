import { create } from 'zustand';

export interface SharedStoreState {
  readonly isInitialized: boolean;
}

export const useSharedStore = create<SharedStoreState>(() => ({
  isInitialized: false,
}));
