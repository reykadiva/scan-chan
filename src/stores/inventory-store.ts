import { create } from 'zustand';

export interface InventoryStoreState {
  readonly isInitialized: boolean;
}

export const useInventoryStore = create<InventoryStoreState>(() => ({
  isInitialized: false,
}));
