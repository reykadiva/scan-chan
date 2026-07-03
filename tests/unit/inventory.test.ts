import { describe, it, expect, beforeEach } from 'vitest';
import {
  createInventory,
  generateItemId,
  validateItem,
  addItem,
  removeItem,
  updateItemQuantity,
  sortInventory,
  serializeInventory,
  deserializeInventory,
} from '@/lib/inventory';
import type { InventoryItemType } from '@/types/inventory';
import { useInventoryStore } from '@/stores/inventory-store';

describe('Inventory Domain Pure Engine', () => {
  const userId = 'user-123';
  const capacity = 3;

  it('should create a clean inventory model', () => {
    const inv = createInventory(userId, capacity);
    expect(inv.userId).toBe(userId);
    expect(inv.capacity).toBe(capacity);
    expect(inv.items).toEqual([]);
  });

  it('should validate items correctly', () => {
    expect(validateItem({ type: 'food', itemKey: 'apple', quantity: 5 })).toBe(true);
    expect(validateItem({ type: 'food', itemKey: '', quantity: 5 })).toBe(false);
    expect(validateItem({ type: 'food', itemKey: 'apple', quantity: 0 })).toBe(false);
    expect(validateItem({ type: 'food', itemKey: 'apple', quantity: -1 })).toBe(false);
    expect(validateItem({ type: 'invalid' as unknown as InventoryItemType, itemKey: 'apple', quantity: 5 })).toBe(false);
  });

  it('should add stackable items, updating quantity if type and key match', () => {
    const inv = createInventory(userId, capacity);
    
    // Add item 1
    const result1 = addItem(inv, { type: 'food', itemKey: 'apple', quantity: 2 }, 1000);
    expect(result1.success).toBe(true);
    expect(result1.inventory.items).toHaveLength(1);
    expect(result1.inventory.items[0]).toEqual({
      id: generateItemId('food', 'apple'),
      type: 'food',
      itemKey: 'apple',
      quantity: 2,
      metadata: { createdAt: 1000 },
    });

    // Add more of item 1
    const result2 = addItem(result1.inventory, { type: 'food', itemKey: 'apple', quantity: 3, metadata: { bonus: true } }, 2000);
    expect(result2.success).toBe(true);
    expect(result2.inventory.items).toHaveLength(1);
    expect(result2.inventory.items[0].quantity).toBe(5);
    expect(result2.inventory.items[0].metadata).toEqual({
      createdAt: 1000,
      bonus: true,
      updatedAt: 2000,
    });
  });

  it('should prevent adding new slot if capacity is exceeded', () => {
    let inv = createInventory(userId, capacity);
    
    // Fill to capacity
    inv = addItem(inv, { type: 'food', itemKey: 'apple', quantity: 1 }, 1000).inventory;
    inv = addItem(inv, { type: 'food', itemKey: 'orange', quantity: 1 }, 1000).inventory;
    inv = addItem(inv, { type: 'food', itemKey: 'banana', quantity: 1 }, 1000).inventory;
    
    expect(inv.items).toHaveLength(3);

    // Try adding fourth unique item slot
    const result = addItem(inv, { type: 'food', itemKey: 'melon', quantity: 1 }, 1000);
    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('capacity-exceeded');
    expect(result.inventory.items).toHaveLength(3);

    // Stacking existing item should still be allowed
    const stackResult = addItem(inv, { type: 'food', itemKey: 'orange', quantity: 5 }, 1000);
    expect(stackResult.success).toBe(true);
    expect(stackResult.inventory.items[1].quantity).toBe(6);
  });

  it('should remove items correctly and prune slot if quantity falls to 0', () => {
    let inv = createInventory(userId, capacity);
    inv = addItem(inv, { type: 'food', itemKey: 'apple', quantity: 5 }, 1000).inventory;

    // Partially remove
    const removeResult1 = removeItem(inv, generateItemId('food', 'apple'), 2);
    expect(removeResult1.success).toBe(true);
    expect(removeResult1.inventory.items[0].quantity).toBe(3);

    // Fully remove
    const removeResult2 = removeItem(removeResult1.inventory, generateItemId('food', 'apple'), 3);
    expect(removeResult2.success).toBe(true);
    expect(removeResult2.inventory.items).toHaveLength(0);
  });

  it('should return error if removing more than available', () => {
    let inv = createInventory(userId, capacity);
    inv = addItem(inv, { type: 'food', itemKey: 'apple', quantity: 2 }, 1000).inventory;

    const result = removeItem(inv, generateItemId('food', 'apple'), 3);
    expect(result.success).toBe(false);
    expect(result.error?.code).toBe('insufficient-quantity');
  });

  it('should update item quantities directly', () => {
    let inv = createInventory(userId, capacity);
    inv = addItem(inv, { type: 'food', itemKey: 'apple', quantity: 2 }, 1000).inventory;

    const result = updateItemQuantity(inv, generateItemId('food', 'apple'), 10, 2000);
    expect(result.success).toBe(true);
    expect(result.inventory.items[0].quantity).toBe(10);

    const removeResult = updateItemQuantity(result.inventory, generateItemId('food', 'apple'), 0, 3000);
    expect(removeResult.success).toBe(true);
    expect(removeResult.inventory.items).toHaveLength(0);
  });

  it('should sort items deterministically', () => {
    let inv = createInventory(userId, 5);
    inv = addItem(inv, { type: 'food', itemKey: 'cherry', quantity: 5 }, 1000).inventory;
    inv = addItem(inv, { type: 'decoration', itemKey: 'banner', quantity: 2 }, 1000).inventory;
    inv = addItem(inv, { type: 'food', itemKey: 'apple', quantity: 10 }, 1000).inventory;

    // Sort by itemKey asc
    const sortedKey = sortInventory(inv, 'itemKey', 'asc');
    expect(sortedKey.items[0].itemKey).toBe('apple');
    expect(sortedKey.items[1].itemKey).toBe('banner');
    expect(sortedKey.items[2].itemKey).toBe('cherry');

    // Sort by quantity desc
    const sortedQty = sortInventory(inv, 'quantity', 'desc');
    expect(sortedQty.items[0].quantity).toBe(10);
    expect(sortedQty.items[1].quantity).toBe(5);
    expect(sortedQty.items[2].quantity).toBe(2);
  });

  it('should support serialization and deserialization', () => {
    let inv = createInventory(userId, capacity);
    inv = addItem(inv, { type: 'food', itemKey: 'apple', quantity: 5 }, 1000).inventory;

    const serialized = serializeInventory(inv);
    const deserialized = deserializeInventory(serialized);

    expect(deserialized.id).toBe(inv.id);
    expect(deserialized.userId).toBe(inv.userId);
    expect(deserialized.capacity).toBe(inv.capacity);
    expect(deserialized.items).toHaveLength(1);
    expect(deserialized.items[0].itemKey).toBe('apple');
    expect(deserialized.items[0].quantity).toBe(5);
  });
});

describe('Zustand Inventory Store Delegation', () => {
  beforeEach(() => {
    useInventoryStore.getState().reset();
  });

  it('should allow adding, removing, and sorting items via the store actions', () => {
    const store = useInventoryStore.getState();
    expect(store.items).toHaveLength(0);

    // Add item
    const success1 = store.addItem({ type: 'food', itemKey: 'apple', quantity: 3 });
    expect(success1).toBe(true);
    expect(useInventoryStore.getState().items).toHaveLength(1);
    expect(useInventoryStore.getState().items[0].quantity).toBe(3);

    // Stacking item
    const success2 = useInventoryStore.getState().addItem({ type: 'food', itemKey: 'apple', quantity: 2 });
    expect(success2).toBe(true);
    expect(useInventoryStore.getState().items).toHaveLength(1);
    expect(useInventoryStore.getState().items[0].quantity).toBe(5);

    // Add separate item
    useInventoryStore.getState().addItem({ type: 'decoration', itemKey: 'plushie', quantity: 1 });
    expect(useInventoryStore.getState().items).toHaveLength(2);

    // Sort
    useInventoryStore.getState().sort('itemKey', 'desc');
    expect(useInventoryStore.getState().items[0].itemKey).toBe('plushie');
    expect(useInventoryStore.getState().items[1].itemKey).toBe('apple');

    // Remove
    const successRemove = useInventoryStore.getState().removeItem(generateItemId('food', 'apple'), 2);
    expect(successRemove).toBe(true);
    expect(useInventoryStore.getState().items.find(i => i.itemKey === 'apple')?.quantity).toBe(3);
  });
});
