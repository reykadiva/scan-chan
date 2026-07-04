import { applyPetFeeding, createFood } from '@/lib/pet';
import type { FoodCategory, FoodNutritionProfile, PetStateModel } from '@/types/pet';
import type {
  InventoryModel,
  InventoryGameplayInput,
  InventoryGameplayResult,
} from '@/types/inventory';
import { removeItem } from './engine';
import { formatDisplayName } from './viewmodel';

/**
 * Sprint 4.4 — Inventory Gameplay Flow Controller
 *
 * Deterministically orchestrates inventory actions and updates player/pet states:
 *   - use / consume: feeds foods/products to pet (decrements stack) or toggles equip state for room items
 *   - inspect: adds inspection timestamp to item metadata
 *   - favorite: toggles item favorited tag
 */
export function executeInventoryGameplayFlow(input: InventoryGameplayInput): InventoryGameplayResult {
  const { action, itemId, inventory, pet, currentXp, now } = input;

  const item = inventory.items.find((i) => i.id === itemId);
  if (!item) {
    return failedResult('item-not-found', inventory, pet, currentXp);
  }

  switch (action) {
    case 'inspect': {
      const updatedItems = inventory.items.map((i) => {
        if (i.id === itemId) {
          return {
            ...i,
            metadata: {
              ...(i.metadata ?? {}),
              lastInspectedAt: now,
            },
          };
        }
        return i;
      });
      return {
        success: true,
        status: 'success',
        inventory: { ...inventory, items: updatedItems },
        pet,
        xpGain: 0,
        nextXp: currentXp,
        memoryCreated: false,
        petRefreshNeeded: false,
        homeHubRefreshNeeded: false,
        error: null,
      };
    }

    case 'favorite': {
      const updatedItems = inventory.items.map((i) => {
        if (i.id === itemId) {
          return {
            ...i,
            metadata: {
              ...(i.metadata ?? {}),
              favorite: !Boolean(i.metadata?.favorite),
            },
          };
        }
        return i;
      });
      return {
        success: true,
        status: 'success',
        inventory: { ...inventory, items: updatedItems },
        pet,
        xpGain: 0,
        nextXp: currentXp,
        memoryCreated: false,
        petRefreshNeeded: false,
        homeHubRefreshNeeded: false,
        error: null,
      };
    }

    case 'consume':
    case 'use': {
      const isFoodOrProduct = item.type === 'food' || item.type === 'product';

      // 1. Handle Consumable Food & Products
      if (action === 'consume' || (action === 'use' && isFoodOrProduct)) {
        if (!isFoodOrProduct) {
          return failedResult('not-consumable', inventory, pet, currentXp);
        }

        // Check hunger limits
        if (pet.stats.hunger >= 95) {
          return failedResult('overfed', inventory, pet, currentXp);
        }

        const category = (item.metadata?.category ?? (item.type === 'food' ? 'snack' : 'unknown')) as FoodCategory;
        const food = createFood({
          id: item.itemKey,
          name: formatDisplayName(item.itemKey),
          category,
          nutrition: item.metadata?.nutrition as Partial<FoodNutritionProfile>,
          isFavorite: Boolean(item.metadata?.favorite),
          isNew: Boolean(item.metadata?.isNew),
        });

        // Apply pet feeding
        const fed = applyPetFeeding(pet, {
          food,
          now,
          memoryId: `feeding-${item.itemKey}-${now}`,
        });

        if (!fed.applied) {
          return failedResult(fed.reason ?? 'feeding-failed', inventory, pet, currentXp);
        }

        // Decrement item count in inventory
        const removeRes = removeItem(inventory, itemId, 1);
        if (!removeRes.success || !removeRes.inventory) {
          return failedResult('inventory-removal-failed', inventory, pet, currentXp);
        }

        return {
          success: true,
          status: 'success',
          inventory: removeRes.inventory,
          pet: fed.pet,
          xpGain: 10,
          nextXp: currentXp + 10,
          memoryCreated: Boolean(fed.memory),
          petRefreshNeeded: true,
          homeHubRefreshNeeded: true,
          error: null,
        };
      }

      // 2. Handle Non-Consumable Placement / Use (Decoration & Furniture)
      if (item.type === 'furniture' || item.type === 'decoration') {
        const updatedItems = inventory.items.map((i) => {
          if (i.id === itemId) {
            return {
              ...i,
              metadata: {
                ...(i.metadata ?? {}),
                equipped: !Boolean(i.metadata?.equipped),
              },
            };
          }
          return i;
        });
        return {
          success: true,
          status: 'success',
          inventory: { ...inventory, items: updatedItems },
          pet,
          xpGain: 0,
          nextXp: currentXp,
          memoryCreated: false,
          petRefreshNeeded: false,
          homeHubRefreshNeeded: true, // Room changed so Home Hub must refresh
          error: null,
        };
      }

      // 3. Memories cannot be consumed or equipped
      return {
        success: true,
        status: 'success',
        inventory,
        pet,
        xpGain: 0,
        nextXp: currentXp,
        memoryCreated: false,
        petRefreshNeeded: false,
        homeHubRefreshNeeded: false,
        error: null,
      };
    }

    default:
      return failedResult('unsupported-action', inventory, pet, currentXp);
  }
}

function failedResult(
  error: string,
  inventory: InventoryModel,
  pet: PetStateModel,
  currentXp: number
): InventoryGameplayResult {
  return {
    success: false,
    status: 'failed',
    inventory,
    pet,
    xpGain: 0,
    nextXp: currentXp,
    memoryCreated: false,
    petRefreshNeeded: false,
    homeHubRefreshNeeded: false,
    error,
  };
}
