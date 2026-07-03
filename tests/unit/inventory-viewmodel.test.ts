import { describe, it, expect } from 'vitest';
import { createInventory } from '@/lib/inventory/engine';
import {
  formatDisplayName,
  deriveRarityColor,
  deriveDescription,
  toItemViewModel,
  buildInventoryViewModel,
} from '@/lib/inventory/viewmodel';
import type { InventoryModel, InventoryItem } from '@/types/inventory';

describe('Inventory ViewModel Builder - Pure Helpers', () => {
  it('should format display names beautifully', () => {
    expect(formatDisplayName('chocolate_chip')).toBe('Chocolate Chip');
    expect(formatDisplayName('milk-carton')).toBe('Milk Carton');
    expect(formatDisplayName('plush_toy_kitty')).toBe('Plush Toy Kitty');
    expect(formatDisplayName('')).toBe('Unknown Item');
  });

  it('should derive correct rarity color codes', () => {
    expect(deriveRarityColor({ rarity: 'legendary' })).toBe('#FFD700');
    expect(deriveRarityColor({ rarity: 'epic' })).toBe('#A335EE');
    expect(deriveRarityColor({ rarity: 'rare' })).toBe('#0070DD');
    expect(deriveRarityColor({ rarity: 'uncommon' })).toBe('#1EFF00');
    expect(deriveRarityColor({ rarity: 'common' })).toBe('#9D9D9D');
    expect(deriveRarityColor(null)).toBe('#9D9D9D');
  });

  it('should derive descriptions from metadata or type default templates', () => {
    const itemWithDesc: InventoryItem = {
      id: '1',
      type: 'food',
      itemKey: 'apple',
      quantity: 1,
      metadata: { description: 'A crisp red apple.' },
    };
    expect(deriveDescription(itemWithDesc)).toBe('A crisp red apple.');

    const itemWithoutDesc: InventoryItem = {
      id: '2',
      type: 'decoration',
      itemKey: 'cushion_soft',
      quantity: 1,
      metadata: null,
    };
    expect(deriveDescription(itemWithoutDesc)).toContain("Soft");
  });

  it('should build a complete item viewmodel correctly', () => {
    const item: InventoryItem = {
      id: 'item-1',
      type: 'food',
      itemKey: 'fish_snack',
      quantity: 5,
      metadata: { rarity: 'rare', description: 'Fresh salmon slices.' },
    };
    const vm = toItemViewModel(item);

    expect(vm.id).toBe('item-1');
    expect(vm.displayName).toBe('Fish Snack');
    expect(vm.rarityColor).toBe('#0070DD');
    expect(vm.canUse).toBe(true);
    expect(vm.canDiscard).toBe(true);
    expect(vm.stackSizeDescription).toBe('x5');
    expect(vm.dragAndDropData.isDraggable).toBe(true);
    expect(vm.actions).toHaveLength(2);
    expect(vm.actions[0].actionId).toBe('use');
  });
});

describe('Inventory ViewModel Builder - Full Build Flow', () => {
  const sampleItems: InventoryItem[] = [
    { id: '1', type: 'food', itemKey: 'apple', quantity: 10, metadata: { rarity: 'common' } },
    { id: '2', type: 'food', itemKey: 'orange_juice', quantity: 2, metadata: { rarity: 'uncommon' } },
    { id: '3', type: 'decoration', itemKey: 'flower_pot', quantity: 1, metadata: { rarity: 'rare' } },
    { id: '4', type: 'furniture', itemKey: 'beanbag_chair', quantity: 1, metadata: { rarity: 'epic' } },
  ];

  const inventory: InventoryModel = createInventory('user-1', 10, sampleItems);

  it('should build default viewModel when no filters or searches are supplied', () => {
    const vm = buildInventoryViewModel({ inventory });

    expect(vm.items).toHaveLength(4);
    expect(vm.isEmpty).toBe(false);
    expect(vm.isLoading).toBe(false);
    expect(vm.selectedItem).toBeNull();
    
    // Grouping checks
    expect(vm.groupedItems.food).toHaveLength(2);
    expect(vm.groupedItems.decoration).toHaveLength(1);
    expect(vm.groupedItems.furniture).toHaveLength(1);
    expect(vm.groupedItems.product).toHaveLength(0); // empty bucket check
    
    // Capacity summary checks
    expect(vm.capacitySummary.used).toBe(4);
    expect(vm.capacitySummary.total).toBe(10);
    expect(vm.capacitySummary.percentage).toBe(40);
    expect(vm.capacitySummary.isFull).toBe(false);

    // Statistics checks
    expect(vm.statistics.totalItemsCount).toBe(14); // 10 + 2 + 1 + 1
    expect(vm.statistics.totalStacksCount).toBe(4);
    expect(vm.statistics.typeCounts.food).toBe(12);
  });

  it('should support search query matching itemKey or displayName', () => {
    const vm = buildInventoryViewModel({ inventory, searchQuery: 'orange' });
    expect(vm.items).toHaveLength(1);
    expect(vm.items[0].displayName).toBe('Orange Juice');

    const vmEmpty = buildInventoryViewModel({ inventory, searchQuery: 'nonexistent' });
    expect(vmEmpty.items).toHaveLength(0);
    expect(vmEmpty.isEmpty).toBe(true);
  });

  it('should support filtering by item type', () => {
    const vm = buildInventoryViewModel({ inventory, filterType: 'food' });
    expect(vm.items).toHaveLength(2);
    expect(vm.items.every((item) => item.type === 'food')).toBe(true);
  });

  it('should sort items deterministically', () => {
    // Sort by quantity desc
    const vmQty = buildInventoryViewModel({ inventory, sortBy: 'quantity', sortOrder: 'desc' });
    expect(vmQty.items[0].id).toBe('1'); // apple (10)
    expect(vmQty.items[1].id).toBe('2'); // orange_juice (2)

    // Sort by itemKey asc
    const vmKey = buildInventoryViewModel({ inventory, sortBy: 'itemKey', sortOrder: 'asc' });
    expect(vmKey.items[0].itemKey).toBe('apple');
    expect(vmKey.items[1].itemKey).toBe('beanbag_chair');
  });

  it('should resolve selected item correctly', () => {
    const vm = buildInventoryViewModel({ inventory, selectedItemId: '3' });
    expect(vm.selectedItem).not.toBeNull();
    expect(vm.selectedItem?.displayName).toBe('Flower Pot');
  });
});
