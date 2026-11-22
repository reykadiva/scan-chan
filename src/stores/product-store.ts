import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Product } from '@/types';
import { usePlayerStore } from '@/stores/player-store';
import { GameMode } from '@/lib/game-config';

export interface ProductStoreState {
  products: Record<string, Product>;
  pendingSyncBarcodes: string[];
  lastSyncedAt: number | null;
  isSyncing: boolean;
}

export interface ProductStoreActions {
  upsertProduct: (product: Product, isPendingSync?: boolean) => void;
  upsertMultipleProducts: (products: Product[]) => void;
  mergeServerProducts: (serverProducts: Product[]) => void;
  removeProduct: (barcodeNumber: string) => void;
  syncPendingToServer: () => Promise<void>;
  fetchAndMergeCatalog: (options?: { search?: string; category?: string }) => Promise<Product[]>;
  getAllProductsList: () => Product[];
}

export type ProductStore = ProductStoreState & ProductStoreActions;

export const useProductStore = create<ProductStore>()(
  persist(
    (set, get) => ({
      products: {},
      pendingSyncBarcodes: [],
      lastSyncedAt: null,
      isSyncing: false,

      upsertProduct: (product: Product, isPendingSync = false) => {
        set((state) => {
          const barcode = product.barcodeNumber;
          const pending = isPendingSync
            ? Array.from(new Set([...state.pendingSyncBarcodes, barcode]))
            : state.pendingSyncBarcodes;

          return {
            products: {
              ...state.products,
              [barcode]: {
                ...state.products[barcode],
                ...product,
                updatedAt: product.updatedAt || new Date().toISOString(),
              },
            },
            pendingSyncBarcodes: pending,
          };
        });
      },

      upsertMultipleProducts: (newProducts: Product[]) => {
        set((state) => {
          const updated = { ...state.products };
          for (const p of newProducts) {
            if (p?.barcodeNumber) {
              updated[p.barcodeNumber] = {
                ...updated[p.barcodeNumber],
                ...p,
              };
            }
          }
          return { products: updated };
        });
      },

      mergeServerProducts: (serverProducts: Product[]) => {
        set((state) => {
          const updated = { ...state.products };
          const pendingSet = new Set(state.pendingSyncBarcodes);

          for (const sp of serverProducts) {
            if (!sp?.barcodeNumber) continue;
            const barcode = sp.barcodeNumber;
            // Merge with local product, keeping any local richer fields if server is null
            const local = updated[barcode];
            updated[barcode] = {
              ...local,
              ...sp,
              brand: sp.brand || local?.brand || null,
              category: sp.category || local?.category || null,
              description: sp.description || local?.description || null,
              imageUrl: sp.imageUrl || local?.imageUrl || null,
            };
            // Since server has it, it's no longer pending
            pendingSet.delete(barcode);
          }

          return {
            products: updated,
            pendingSyncBarcodes: Array.from(pendingSet),
            lastSyncedAt: Date.now(),
          };
        });
      },

      removeProduct: (barcodeNumber: string) => {
        set((state) => {
          const next = { ...state.products };
          delete next[barcodeNumber];
          return {
            products: next,
            pendingSyncBarcodes: state.pendingSyncBarcodes.filter((b) => b !== barcodeNumber),
          };
        });
      },

      syncPendingToServer: async () => {
        const state = get();
        if (state.isSyncing || state.pendingSyncBarcodes.length === 0) return;

        set({ isSyncing: true });
        try {
          const pendingBarcodes = [...state.pendingSyncBarcodes];
          const successfullySynced: string[] = [];

          for (const barcode of pendingBarcodes) {
            const product = state.products[barcode];
            if (!product) {
              successfullySynced.push(barcode);
              continue;
            }

            try {
              const res = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  barcodeNumber: product.barcodeNumber,
                  productName: product.productName,
                  brand: product.brand || null,
                  category: product.category || null,
                  description: product.description || null,
                  imageUrl: product.imageUrl || null,
                  creatorId: product.creatorId || null,
                }),
              });

              // If 201 (created) or 409 (already exists on server), it's safely in cloud
              if (res.status === 201 || res.status === 409) {
                successfullySynced.push(barcode);
              }
            } catch {
              // Ignore single item sync failure (will retry on next sync)
            }
          }

          if (successfullySynced.length > 0) {
            set((current) => ({
              pendingSyncBarcodes: current.pendingSyncBarcodes.filter(
                (b) => !successfullySynced.includes(b)
              ),
              lastSyncedAt: Date.now(),
            }));
          }
        } finally {
          set({ isSyncing: false });
        }
      },

      fetchAndMergeCatalog: async (options) => {
        try {
          const params = new URLSearchParams({
            limit: '50',
            ...(options?.search && { search: options.search }),
            ...(options?.category && { category: options.category }),
          });

          const res = await fetch(`/api/products?${params}`);
          const data = await res.json();

          if (data.success && Array.isArray(data.data)) {
            get().mergeServerProducts(data.data);
          }
        } catch (err) {
          console.warn('[ProductStore] Failed to fetch server products, using local cache:', err);
        }

        // Trigger background sync for pending local items
        get().syncPendingToServer().catch(() => {});

        return get().getAllProductsList();
      },

      getAllProductsList: () => {
        const state = get();
        return Object.values(state.products).sort((a, b) => {
          const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return timeB - timeA;
        });
      },
    }),
    {
      name: 'scan-chan-product-registry',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => {
        // Ephemeral in RAM: Guest Mode products must NEVER persist to localStorage
        if (usePlayerStore.getState().mode === GameMode.GUEST) {
          return {} as any;
        }
        return {
          products: state.products,
          pendingSyncBarcodes: state.pendingSyncBarcodes,
          lastSyncedAt: state.lastSyncedAt,
        };
      },
    }
  )
);
