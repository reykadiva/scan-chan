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

export interface InventoryItemAction {
  readonly label: string;
  readonly actionId: string;
  readonly enabled: boolean;
}

export interface DragAndDropData {
  readonly isDraggable: boolean;
  readonly dragId: string;
}

export interface InventoryItemViewModel {
  readonly id: string;
  readonly type: InventoryItemType;
  readonly itemKey: string;
  readonly quantity: number;
  readonly displayName: string;
  readonly iconUrl: string | null;
  readonly stackSizeDescription: string;
  readonly canUse: boolean;
  readonly canDiscard: boolean;
  readonly rarityColor: string;
  readonly description: string;
  readonly metadata: Record<string, unknown> | null;
  readonly dragAndDropData: DragAndDropData;
  readonly actions: readonly InventoryItemAction[];
}

export interface CapacitySummary {
  readonly used: number;
  readonly total: number;
  readonly percentage: number;
  readonly isFull: boolean;
}

export interface InventoryStatistics {
  readonly totalItemsCount: number;
  readonly totalStacksCount: number;
  readonly typeCounts: Record<InventoryItemType, number>;
}

export interface InventoryViewModel {
  readonly items: readonly InventoryItemViewModel[];
  readonly groupedItems: Record<string, readonly InventoryItemViewModel[]>;
  readonly isEmpty: boolean;
  readonly isLoading: boolean;
  readonly capacitySummary: CapacitySummary;
  readonly statistics: InventoryStatistics;
  readonly selectedItem: InventoryItemViewModel | null;
}

export interface InventoryViewModelInput {
  readonly inventory: InventoryModel;
  readonly searchQuery?: string;
  readonly filterType?: InventoryItemType | 'all';
  readonly sortBy?: 'type' | 'quantity' | 'itemKey' | 'id';
  readonly sortOrder?: 'asc' | 'desc';
  readonly selectedItemId?: string | null;
  readonly isLoading?: boolean;
}

