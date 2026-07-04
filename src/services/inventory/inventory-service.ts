import type { InventoryRepository } from '@/repositories';
import type {
  InventoryModel,
  InventoryItem,
  InventoryGameplayAction,
  InventoryGameplayResult,
} from '@/types/inventory';
import type { PetStateModel } from '@/types/pet';
import { createInventory, addItem, removeItem, executeInventoryGameplayFlow } from '@/lib/inventory';
import { deferred, type FutureOrchestrationPoint, type ServiceResult } from '../service-result';

export interface InventoryService {
  readonly domain: 'inventory';
  prepareInventoryRead: () => ServiceResult<FutureOrchestrationPoint>;
  prepareItemMutation: () => ServiceResult<FutureOrchestrationPoint>;

  // Domain Orchestrations
  getInventory: (userId: string) => Promise<InventoryModel>;
  addItem: (userId: string, item: Omit<InventoryItem, 'id'>, now: number) => Promise<InventoryModel>;
  removeItem: (userId: string, itemId: string, quantity: number) => Promise<InventoryModel>;
  executeGameplayAction: (
    userId: string,
    action: InventoryGameplayAction,
    itemId: string,
    pet: PetStateModel,
    currentXp: number,
    now: number
  ) => Promise<InventoryGameplayResult>;
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

  async executeGameplayAction(
    userId: string,
    action: InventoryGameplayAction,
    itemId: string,
    pet: PetStateModel,
    currentXp: number,
    now: number
  ): Promise<InventoryGameplayResult> {
    const inventory = await this.getInventory(userId);
    const result = executeInventoryGameplayFlow({
      action,
      itemId,
      inventory,
      pet,
      currentXp,
      now,
    });

    if (result.success && result.inventory) {
      await this.repository.saveInventory(result.inventory);
    }

    return result;
  }
}
