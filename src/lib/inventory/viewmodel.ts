import type {
  InventoryItem,
  InventoryItemViewModel,
  InventoryViewModel,
  InventoryViewModelInput,
  InventoryItemType,
  InventoryItemAction,
} from '@/types/inventory';

/**
 * Format itemKey into a capitalized, user-friendly display name.
 * e.g. "chocolate_bar" -> "Chocolate Bar", "milk-box" -> "Milk Box"
 */
export function formatDisplayName(itemKey: string): string {
  if (!itemKey) return 'Unknown Item';
  return itemKey
    .replace(/[_-]+/g, ' ')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Derive rarity color hex code from item metadata or default to common.
 */
export function deriveRarityColor(metadata: Record<string, unknown> | null | undefined): string {
  const rarity = String(metadata?.rarity ?? 'common').toLowerCase();
  switch (rarity) {
    case 'legendary':
      return '#FFD700'; // Gold
    case 'epic':
      return '#A335EE'; // Purple
    case 'rare':
      return '#0070DD'; // Blue
    case 'uncommon':
      return '#1EFF00'; // Green
    case 'common':
    default:
      return '#9D9D9D'; // Grey
  }
}

/**
 * Derive user-friendly description for an item.
 */
export function deriveDescription(item: InventoryItem): string {
  if (item.metadata?.description) {
    return String(item.metadata.description);
  }
  
  const displayName = formatDisplayName(item.itemKey);
  switch (item.type) {
    case 'food':
      return `Delicious food item: ${displayName}. Feed this to Scan Chan.`;
    case 'product':
      return `Scanned product: ${displayName}. Register or use to get details.`;
    case 'memory':
      return `A precious memory with Scan Chan: ${displayName}.`;
    case 'furniture':
      return `Cozy furniture to decorate the room: ${displayName}.`;
    case 'decoration':
      return `A beautiful decoration for Scan Chan's room: ${displayName}.`;
    default:
      return `Item: ${displayName}`;
  }
}

/**
 * Map pure InventoryItem model to InventoryItemViewModel presentation structure.
 */
export function toItemViewModel(item: InventoryItem): InventoryItemViewModel {
  const displayName = formatDisplayName(item.itemKey);
  const metadata = item.metadata ?? null;
  const rarityColor = deriveRarityColor(metadata);
  const description = deriveDescription(item);

  const canUse = item.type === 'food' || item.type === 'product';
  const canDiscard = item.type !== 'memory'; // Memories cannot be discarded

  const actions: InventoryItemAction[] = [
    { label: 'Use', actionId: 'use', enabled: canUse },
    { label: 'Discard', actionId: 'discard', enabled: canDiscard },
  ];

  return {
    id: item.id,
    type: item.type,
    itemKey: item.itemKey,
    quantity: item.quantity,
    displayName,
    iconUrl: `/assets/icons/inventory/${item.type}/${item.itemKey}.png`,
    stackSizeDescription: `x${item.quantity}`,
    canUse,
    canDiscard,
    rarityColor,
    description,
    metadata,
    dragAndDropData: {
      isDraggable: true,
      dragId: `dnd-${item.id}`,
    },
    actions,
  };
}

/**
 * Build InventoryViewModel presentation model deterministically.
 */
export function buildInventoryViewModel(input: InventoryViewModelInput): InventoryViewModel {
  const {
    inventory,
    searchQuery = '',
    filterType = 'all',
    sortBy = 'itemKey',
    sortOrder = 'asc',
    selectedItemId = null,
    isLoading = false,
  } = input;

  // 1. Map all items to presentation view models
  let mappedItems = inventory.items.map(toItemViewModel);

  // 2. Search filtering
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase().trim();
    mappedItems = mappedItems.filter(
      (item) =>
        item.itemKey.toLowerCase().includes(query) ||
        item.displayName.toLowerCase().includes(query)
    );
  }

  // 3. Type filtering
  if (filterType !== 'all') {
    mappedItems = mappedItems.filter((item) => item.type === filterType);
  }

  // 4. Sorting
  mappedItems.sort((a, b) => {
    const valA = a[sortBy];
    const valB = b[sortBy];

    if (typeof valA === 'string' && typeof valB === 'string') {
      return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    
    if (typeof valA === 'number' && typeof valB === 'number') {
      return sortOrder === 'asc' ? valA - valB : valB - valA;
    }

    return 0;
  });

  // 5. Category grouping (always initialize all keys to empty arrays)
  const initialGrouped: Record<InventoryItemType, InventoryItemViewModel[]> = {
    product: [],
    food: [],
    memory: [],
    furniture: [],
    decoration: [],
  };

  const groupedItems = mappedItems.reduce((acc, item) => {
    acc[item.type].push(item);
    return acc;
  }, initialGrouped);

  // 6. Capacity summary
  const used = inventory.items.length;
  const total = inventory.capacity;
  const percentage = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;
  const isFull = used >= total;

  const capacitySummary = {
    used,
    total,
    percentage,
    isFull,
  };

  // 7. Statistics
  let totalItemsCount = 0;
  const typeCounts: Record<InventoryItemType, number> = {
    product: 0,
    food: 0,
    memory: 0,
    furniture: 0,
    decoration: 0,
  };

  for (const item of inventory.items) {
    totalItemsCount += item.quantity;
    typeCounts[item.type] += item.quantity;
  }

  const statistics = {
    totalItemsCount,
    totalStacksCount: inventory.items.length,
    typeCounts,
  };

  // 8. Selected item lookup
  const selectedItem = selectedItemId
    ? mappedItems.find((item) => item.id === selectedItemId) || null
    : null;

  return {
    items: mappedItems,
    groupedItems,
    isEmpty: mappedItems.length === 0,
    isLoading,
    capacitySummary,
    statistics,
    selectedItem,
  };
}
