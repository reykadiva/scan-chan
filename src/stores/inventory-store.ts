import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface InventoryEntry {
  id: string;
  type: 'product' | 'food' | 'memory' | 'furniture' | 'decoration';
  itemKey: string;
  quantity: number;
}

export interface InventoryStoreState {
  isInitialized: boolean;
  items: InventoryEntry[];
  selectedItemId: string | null;
  initialize: () => void;
  setItems: (items: InventoryEntry[]) => void;
  setSelectedItemId: (selectedItemId: string | null) => void;
  reset: () => void;
}

export const initialInventoryState = {
  isInitialized: false,
  items: [] as InventoryEntry[],
  selectedItemId: null as string | null,
};

export const useInventoryStore = create<InventoryStoreState>()(
  devtools(
    (set) => ({
      ...initialInventoryState,
      initialize: () => set({ isInitialized: true }),
      setItems: (items) => set({ items }),
      setSelectedItemId: (selectedItemId) => set({ selectedItemId }),
      reset: () => set(initialInventoryState),
    }),
    { name: 'scan-chan-inventory-store' },
  ),
);

export const selectInventorySummary = (state: InventoryStoreState) => ({
  itemCount: state.items.length,
  selectedItemId: state.selectedItemId,
});
