import type { InventoryRepository } from '@/repositories';
import type { InventoryModel, InventoryItem } from '@/types/inventory';
import { createInventory, addItem, removeItem } from '@/lib/inventory';
import { deferred, type FutureOrchestrationPoint, type ServiceResult } from '../service-result';

export interface InventoryService {
  readonly domain: 'inventory';
  prepareInventoryRead: () => ServiceResult<FutureOrchestrationPoint>;
  prepareItemMutation: () => ServiceResult<FutureOrchestrationPoint>;

  // Domain Orchestrations
  getInventory: (userId: string) => Promise<InventoryModel>;
  addItem: (userId: string, item: Omit<InventoryItem, 'id'>, now: number) => Promise<InventoryModel>;
  removeItem: (userId: string, itemId: string, quantity: number) => Promise<InventoryModel>;
}

export class DefaultInventoryService implements InventoryService {
  readonly domain = 'inventory' as const;

  constructor(readonly repository: InventoryRepository) {}

  /** Future Sprint 5 extension point: item reads stay behind service and repository boundaries. */
  prepareInventoryRead() {
    return deferred('inventory');
  }

  /** Future Sprint 5 extension point: item mutations are orchestrated here, not inside stores. */
  prepareItemMutation() {
    return deferred('inventory');
  }

  async getInventory(userId: string): Promise<InventoryModel> {
    const existing = await this.repository.getInventoryByUserId(userId);
    if (existing) return existing;
    
    // Create new default inventory if not exists
    const newInv = createInventory(userId, 20);
    return this.repository.saveInventory(newInv);
  }

  async addItem(userId: string, item: Omit<InventoryItem, 'id'>, now: number): Promise<InventoryModel> {
    const current = await this.getInventory(userId);
    const result = addItem(current, item, now);
    if (!result.success || result.error) {
      throw new Error(result.error?.message ?? 'Failed to add item to inventory.');
    }
    return this.repository.saveInventory(result.inventory);
  }

  async removeItem(userId: string, itemId: string, quantity: number): Promise<InventoryModel> {
    const current = await this.getInventory(userId);
    const result = removeItem(current, itemId, quantity);
    if (!result.success || result.error) {
      throw new Error(result.error?.message ?? 'Failed to remove item from inventory.');
    }
    return this.repository.saveInventory(result.inventory);
  }
}
