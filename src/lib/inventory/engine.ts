import type {
  InventoryItem,
  InventoryModel,
  InventoryEngineResult,
  InventoryItemType,
} from '@/types/inventory';

// Helper to generate IDs deterministically or using a simple generator.
// Since the engine is pure, we can construct IDs based on type + itemKey
// or take an optional pre-defined ID.
export function generateItemId(type: InventoryItemType, itemKey: string): string {
  return `${type}:${itemKey}`;
}

export function createInventory(
  userId: string,
  capacity: number,
  items: readonly InventoryItem[] = [],
  id?: string
): InventoryModel {
  return {
    id: id ?? `inv-${userId}`,
    userId,
    items: [...items],
    capacity,
  };
}

export function validateItem(item: Partial<InventoryItem>): boolean {
  if (!item.itemKey || item.itemKey.trim() === '') return false;
  if (!item.type) return false;
  if (item.quantity === undefined || item.quantity <= 0) return false;
  
  const validTypes: InventoryItemType[] = ['product', 'food', 'memory', 'furniture', 'decoration'];
  if (!validTypes.includes(item.type)) return false;

  return true;
}

export function addItem(
  inventory: InventoryModel,
  item: Omit<InventoryItem, 'id'> & { id?: string },
  now: number // Explicit timestamp for pure tracking
): InventoryEngineResult {
  if (!validateItem(item)) {
    return {
      success: false,
      inventory,
      error: { code: 'invalid-item', message: 'Item validation failed. Key must be non-empty and quantity > 0.' },
    };
  }

  const existingIndex = inventory.items.findIndex(
    (i) => i.type === item.type && i.itemKey === item.itemKey
  );

  const updatedItems = [...inventory.items];

  if (existingIndex >= 0) {
    const existing = updatedItems[existingIndex];
    updatedItems[existingIndex] = {
      ...existing,
      quantity: existing.quantity + item.quantity,
      // Merge metadata if present
      metadata: item.metadata
        ? { ...(existing.metadata ?? {}), ...item.metadata, updatedAt: now }
        : existing.metadata,
    };
  } else {
    // Check capacity before adding new slot
    if (inventory.items.length >= inventory.capacity) {
      return {
        success: false,
        inventory,
        error: { code: 'capacity-exceeded', message: 'Inventory is full. Cannot add new item slot.' },
      };
    }

    updatedItems.push({
      id: item.id ?? generateItemId(item.type, item.itemKey),
      type: item.type,
      itemKey: item.itemKey,
      quantity: item.quantity,
      metadata: { ...(item.metadata ?? {}), createdAt: now },
    });
  }

  return {
    success: true,
    inventory: {
      ...inventory,
      items: updatedItems,
    },
    error: null,
  };
}

export function removeItem(
  inventory: InventoryModel,
  itemId: string,
  quantity: number
): InventoryEngineResult {
  if (quantity <= 0) {
    return {
      success: false,
      inventory,
      error: { code: 'invalid-quantity', message: 'Quantity to remove must be greater than zero.' },
    };
  }

  const existingIndex = inventory.items.findIndex((i) => i.id === itemId);
  if (existingIndex < 0) {
    return {
      success: false,
      inventory,
      error: { code: 'item-not-found', message: `Item with id ${itemId} not found in inventory.` },
    };
  }

  const updatedItems = [...inventory.items];
  const existing = updatedItems[existingIndex];

  if (existing.quantity < quantity) {
    return {
      success: false,
      inventory,
      error: {
        code: 'insufficient-quantity',
        message: `Insufficient quantity. Requested: ${quantity}, Available: ${existing.quantity}.`,
      },
    };
  }

  if (existing.quantity === quantity) {
    // Remove the item slot completely
    updatedItems.splice(existingIndex, 1);
  } else {
    updatedItems[existingIndex] = {
      ...existing,
      quantity: existing.quantity - quantity,
    };
  }

  return {
    success: true,
    inventory: {
      ...inventory,
      items: updatedItems,
    },
    error: null,
  };
}

export function updateItemQuantity(
  inventory: InventoryModel,
  itemId: string,
  newQuantity: number,
  now: number
): InventoryEngineResult {
  if (newQuantity < 0) {
    return {
      success: false,
      inventory,
      error: { code: 'invalid-quantity', message: 'Quantity cannot be negative.' },
    };
  }

  const existingIndex = inventory.items.findIndex((i) => i.id === itemId);
  if (existingIndex < 0) {
    return {
      success: false,
      inventory,
      error: { code: 'item-not-found', message: `Item with id ${itemId} not found in inventory.` },
    };
  }

  const updatedItems = [...inventory.items];
  if (newQuantity === 0) {
    updatedItems.splice(existingIndex, 1);
  } else {
    updatedItems[existingIndex] = {
      ...updatedItems[existingIndex],
      quantity: newQuantity,
      metadata: {
        ...(updatedItems[existingIndex].metadata ?? {}),
        updatedAt: now,
      },
    };
  }

  return {
    success: true,
    inventory: {
      ...inventory,
      items: updatedItems,
    },
    error: null,
  };
}

export function sortInventory(
  inventory: InventoryModel,
  sortBy: 'type' | 'quantity' | 'itemKey' | 'id',
  order: 'asc' | 'desc' = 'asc'
): InventoryModel {
  const sorted = [...inventory.items].sort((a, b) => {
    const valA = a[sortBy];
    const valB = b[sortBy];

    if (typeof valA === 'string' && typeof valB === 'string') {
      return order === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    
    if (typeof valA === 'number' && typeof valB === 'number') {
      return order === 'asc' ? valA - valB : valB - valA;
    }

    return 0;
  });

  return {
    ...inventory,
    items: sorted,
  };
}

export function serializeInventory(inventory: InventoryModel): string {
  return JSON.stringify(inventory);
}

export function deserializeInventory(serialized: string): InventoryModel {
  const parsed = JSON.parse(serialized);
  return {
    id: parsed.id,
    userId: parsed.userId,
    items: parsed.items || [],
    capacity: parsed.capacity,
  };
}
