import type { InventoryModel } from '@/types/inventory';

export interface InventoryRepository {
  readonly domain: 'inventory';
  getInventoryByUserId: (userId: string) => Promise<InventoryModel | null>;
  saveInventory: (inventory: InventoryModel) => Promise<InventoryModel>;
}
