export type InventoryItemType = 'product' | 'food' | 'memory' | 'furniture' | 'decoration';

export interface InventoryItem {
  readonly id: string;
  readonly type: InventoryItemType;
  readonly itemKey: string;
  readonly quantity: number;
  readonly metadata?: Record<string, unknown> | null;
}

export interface InventoryModel {
  readonly id: string;
  readonly userId: string;
  readonly items: readonly InventoryItem[];
  readonly capacity: number;
}

export type InventoryErrorCode =
  | 'capacity-exceeded'
  | 'item-not-found'
  | 'insufficient-quantity'
  | 'invalid-quantity'
  | 'invalid-item';

export interface InventoryEngineError {
  readonly code: InventoryErrorCode;
  readonly message: string;
}

export interface InventoryEngineResult {
  readonly success: boolean;
  readonly inventory: InventoryModel;
  readonly error: InventoryEngineError | null;
}

export interface InventoryDomainBoundary {
  readonly domain: 'inventory';
}
