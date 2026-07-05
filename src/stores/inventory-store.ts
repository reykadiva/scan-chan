import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type {
  InventoryItem,
  InventoryItemType,
  InventoryGameplayAction,
  InventoryGameplayResult,
} from '@/types/inventory';
import type { PetStateModel } from '@/types/pet';
import {
  createInventory,
  addItem as engineAddItem,
  removeItem as engineRemoveItem,
  updateItemQuantity as engineUpdateItemQuantity,
  sortInventory as engineSortInventory,
  executeInventoryGameplayFlow,
} from '@/lib/inventory';

export interface InventoryEntry {
  id: string;
  type: InventoryItemType;
  itemKey: string;
  quantity: number;
  metadata?: Record<string, unknown> | null;
}

export interface InventoryStoreState {
  isInitialized: boolean;
  items: InventoryEntry[];
  capacity: number;
  selectedItemId: string | null;
  initialize: () => void;
  setItems: (items: InventoryEntry[]) => void;
  setSelectedItemId: (selectedItemId: string | null) => void;
  
  // Delegated mutation actions to pure engine
  addItem: (item: Omit<InventoryItem, 'id'>, now?: number) => boolean;
  removeItem: (itemId: string, quantity: number) => boolean;
  updateQuantity: (itemId: string, quantity: number, now?: number) => boolean;
  sort: (sortBy: 'type' | 'quantity' | 'itemKey' | 'id', order?: 'asc' | 'desc') => void;
  executeGameplayAction: (input: {
    action: InventoryGameplayAction;
    itemId: string;
    pet: PetStateModel;
    currentXp: number;
    now?: number;
  }) => InventoryGameplayResult;
  
  reset: () => void;
}

export const initialInventoryState = {
  isInitialized: true,
  items: [] as InventoryEntry[],
  capacity: 20,
  selectedItemId: null as string | null,
};

export const useInventoryStore = create<InventoryStoreState>()(
  devtools(
    (set) => ({
      ...initialInventoryState,
      initialize: () => set({ isInitialized: true }),
      setItems: (items) => set({ items }),
      setSelectedItemId: (selectedItemId) => set({ selectedItemId }),

      addItem: (item, now = Date.now()) => {
        let success = false;
        set((state) => {
          const inv = createInventory('guest-user', state.capacity, state.items);
          const result = engineAddItem(inv, item, now);
          if (result.success) {
            success = true;
            return { items: [...result.inventory.items] };
          }
          return {};
        });
        return success;
      },

      removeItem: (itemId, quantity) => {
        let success = false;
        set((state) => {
          const inv = createInventory('guest-user', state.capacity, state.items);
          const result = engineRemoveItem(inv, itemId, quantity);
          if (result.success) {
            success = true;
            return { items: [...result.inventory.items] };
          }
          return {};
        });
        return success;
      },

      updateQuantity: (itemId, quantity, now = Date.now()) => {
        let success = false;
        set((state) => {
          const inv = createInventory('guest-user', state.capacity, state.items);
          const result = engineUpdateItemQuantity(inv, itemId, quantity, now);
          if (result.success) {
            success = true;
            return { items: [...result.inventory.items] };
          }
          return {};
        });
        return success;
      },

      sort: (sortBy, order = 'asc') => {
        set((state) => {
          const inv = createInventory('guest-user', state.capacity, state.items);
          const sorted = engineSortInventory(inv, sortBy, order);
          return { items: [...sorted.items] };
        });
      },

      executeGameplayAction: (input) => {
        const { action, itemId, pet, currentXp, now = Date.now() } = input;
        let flowResult: InventoryGameplayResult;

        set((state) => {
          const inv = createInventory('guest-user', state.capacity, state.items);
          const result = executeInventoryGameplayFlow({
            action,
            itemId,
            inventory: inv,
            pet,
            currentXp,
            now,
          });
          flowResult = result;
          if (result.success && result.inventory) {
            return { items: [...result.inventory.items] };
          }
          return {};
        });

        return flowResult!;
      },

      reset: () => set(initialInventoryState),
    }),
    { name: 'scan-chan-inventory-store' },
  ),
);

export const selectInventorySummary = (state: InventoryStoreState) => ({
  itemCount: state.items.length,
  selectedItemId: state.selectedItemId,
  capacity: state.capacity,
  isFull: state.items.length >= state.capacity,
});
