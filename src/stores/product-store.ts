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
  mergeServerProducts: (serverProducts: Product[], isFullOverwrite?: boolean) => void;
  removeProduct: (barcodeNumber: string) => void;
  clearCatalog: () => void;
  syncPendingToServer: () => Promise<void>;
  fetchProducts: (options?: { search?: string; category?: string; page?: number; limit?: number }) => Promise<Product[]>;
  fetchAndMergeCatalog: (options?: { search?: string; category?: string; limit?: number }) => Promise<Product[]>;
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

      mergeServerProducts: (serverProducts: Product[], isFullOverwrite = false) => {
        set((state) => {
          const pendingSet = new Set(state.pendingSyncBarcodes);
          const newMap: Record<string, Product> = {};

          for (const sp of serverProducts) {
            if (!sp?.barcodeNumber) continue;
            newMap[sp.barcodeNumber] = sp;
            pendingSet.delete(sp.barcodeNumber);
          }

          // If catalog is empty from server OR isFullOverwrite is true:
          // Overwrite completely, preserving only items currently pending sync
          if (isFullOverwrite || serverProducts.length === 0) {
            for (const pendingBarcode of Array.from(pendingSet)) {
              if (state.products[pendingBarcode]) {
                newMap[pendingBarcode] = state.products[pendingBarcode];
              }
            }

            if (Object.keys(newMap).length === 0 && typeof window !== 'undefined') {
              try {
                localStorage.removeItem('scan-chan-products-storage');
                localStorage.removeItem('scan-chan-product-registry');
              } catch (e) {
                console.warn('[ProductStore] Failed to remove empty localStorage keys:', e);
              }
            }

            return {
              products: newMap,
              pendingSyncBarcodes: Array.from(pendingSet),
              lastSyncedAt: Date.now(),
            };
          }

          // If partial search/category filter, merge matching items without deleting unrelated products
          const merged = { ...state.products };
          for (const [b, p] of Object.entries(newMap)) {
            merged[b] = p;
          }

          return {
            products: merged,
            pendingSyncBarcodes: Array.from(pendingSet),
            lastSyncedAt: Date.now(),
          };
        });
      },

      removeProduct: (barcodeNumber: string) => {
        set((state) => {
          const next = { ...state.products };
          delete next[barcodeNumber];
          const remainingPending = state.pendingSyncBarcodes.filter((b) => b !== barcodeNumber);

          if (Object.keys(next).length === 0 && typeof window !== 'undefined') {
            try {
              localStorage.removeItem('scan-chan-products-storage');
              localStorage.removeItem('scan-chan-product-registry');
            } catch {}
          }

          return {
            products: next,
            pendingSyncBarcodes: remainingPending,
          };
        });
      },

      clearCatalog: () => {
        if (typeof window !== 'undefined') {
          try {
            localStorage.removeItem('scan-chan-products-storage');
            localStorage.removeItem('scan-chan-product-registry');
          } catch {}
        }
        set({
          products: {},
          pendingSyncBarcodes: [],
          lastSyncedAt: Date.now(),
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

      fetchProducts: async (options) => {
        const isFiltered = Boolean(options?.search || options?.category);
        try {
          const params = new URLSearchParams({
            limit: options?.limit ? String(options.limit) : '50',
            ...(options?.page && { page: String(options.page) }),
            ...(options?.search && { search: options.search }),
            ...(options?.category && { category: options.category }),
          });

          const res = await fetch(`/api/products?${params}`);
          const data = await res.json();

          if (data.success && Array.isArray(data.data)) {
            get().mergeServerProducts(data.data, !isFiltered);
          }
        } catch (err) {
          console.warn('[ProductStore] Failed to fetch server products, using local cache:', err);
        }

        // Trigger background sync for pending local items
        get().syncPendingToServer().catch(() => {});

        return get().getAllProductsList();
      },

      fetchAndMergeCatalog: async (options) => {
        return get().fetchProducts(options);
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
      onRehydrateStorage: () => (state) => {
        if (typeof window !== 'undefined') {
          try {
            // Clean legacy storage key if empty or stale
            const legacy = localStorage.getItem('scan-chan-products-storage');
            if (legacy && (!state?.products || Object.keys(state.products).length === 0)) {
              localStorage.removeItem('scan-chan-products-storage');
            }
          } catch {}
        }
      },
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
