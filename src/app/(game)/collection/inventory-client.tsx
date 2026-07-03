'use client';

import * as React from 'react';
import {
  AppShell,
  SafeArea,
  ResponsiveContainer,
  SectionContainer,
  Stack,
  Cluster,
} from '@/components/layout';
import {
  Heading,
  Text,
  Panel,
  Surface,
  StatusChip,
  Button,
  IconButton,
  Input,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  ProgressBar,
  EmptyState,
  LoadingState,
  Card,
  CardContent,
  Separator,
} from '@/components/ui';
import { buildInventoryViewModel } from '@/lib/inventory/viewmodel';
import { useInventoryStore } from '@/stores/inventory-store';
import type { InventoryItem, InventoryItemViewModel, InventoryItemType } from '@/types/inventory';
import { PixelCat, CatVariantId } from '@/components/legacy/pixel-cat';
import { Search, ArrowUpDown, Plus, HelpCircle } from 'lucide-react';

// Default mock data to populate the inventory view if the store is empty
const DEFAULT_MOCK_ITEMS: readonly InventoryItem[] = [
  {
    id: 'food-apple',
    type: 'food',
    itemKey: 'apple',
    quantity: 5,
    metadata: { rarity: 'common', description: 'A sweet, crunchy red apple. Scan Chan loves these.' },
  },
  {
    id: 'food-choco',
    type: 'food',
    itemKey: 'chocolate_bar',
    quantity: 2,
    metadata: { rarity: 'uncommon', description: 'Rich milk chocolate bar. A high-energy treat!' },
  },
  {
    id: 'dec-flower',
    type: 'decoration',
    itemKey: 'flower_pot',
    quantity: 1,
    metadata: { rarity: 'rare', description: 'A potted blue hydrangea. Brightens up the room.' },
  },
  {
    id: 'furn-chair',
    type: 'furniture',
    itemKey: 'beanbag_chair',
    quantity: 1,
    metadata: { rarity: 'epic', description: 'A soft, oversized beanbag chair for maximum coziness.' },
  },
  {
    id: 'dec-toy',
    type: 'decoration',
    itemKey: 'plush_toy',
    quantity: 1,
    metadata: { rarity: 'legendary', description: 'A legendary plush cat toy. Exudes a calming aura.' },
  },
];

export function InventoryClient() {
  const storeItems = useInventoryStore((state) => state.items);
  const storeCapacity = useInventoryStore((state) => state.capacity);

  // Client states for query filtering and presentation
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filterType, setFilterType] = React.useState<InventoryItemType | 'all'>('all');
  const [sortBy, setSortBy] = React.useState<'type' | 'quantity' | 'itemKey' | 'id'>('itemKey');
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('asc');
  const [selectedItemId, setSelectedItemId] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  // Populate store with mock items initially if empty so the UI looks active
  React.useEffect(() => {
    if (storeItems.length === 0) {
      // Map domain models to store entries
      const mapped = DEFAULT_MOCK_ITEMS.map((item) => ({
        id: item.id,
        type: item.type,
        itemKey: item.itemKey,
        quantity: item.quantity,
        metadata: item.metadata,
      }));
      useInventoryStore.getState().setItems(mapped);
    }
  }, [storeItems]);

  // Compute ViewModel purely using the snapshot from Zustand state
  const viewModel = React.useMemo(() => {
    return buildInventoryViewModel({
      inventory: {
        id: 'user-inventory',
        userId: 'guest',
        items: storeItems,
        capacity: storeCapacity,
      },
      searchQuery,
      filterType,
      sortBy,
      sortOrder,
      selectedItemId,
      isLoading,
    });
  }, [storeItems, storeCapacity, searchQuery, filterType, sortBy, sortOrder, selectedItemId, isLoading]);

  // Simulation handlers for item action extension points
  const handleUseItem = (item: InventoryItemViewModel) => {
    alert(`[Action Placeholder] Using ${item.displayName}. Future Sprints will connect this to feeding/decoration gameplay!`);
  };

  const handleDiscardItem = (item: InventoryItemViewModel) => {
    const confirmed = confirm(`Are you sure you want to discard ${item.displayName}?`);
    if (confirmed) {
      const removed = useInventoryStore.getState().removeItem(item.id, 1);
      if (removed) {
        if (item.quantity <= 1) {
          setSelectedItemId(null);
        }
      } else {
        alert('Failed to discard item.');
      }
    }
  };

  const handleToggleSortOrder = () => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  };

  // Simulate loading state toggle for UX demonstration
  const triggerSimulationLoading = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 800);
  };

  return (
    <AppShell>
      <SafeArea>
        <ResponsiveContainer>
          <SectionContainer>
            <Stack className="gap-6">
              
              {/* Header Title & Action controls */}
              <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <Heading level={1} id="inventory-title">Your Things</Heading>
                  <Text tone="muted">Organize, customize, and view items scanned for Scan Chan.</Text>
                </div>
                <Cluster className="mt-2 md:mt-0">
                  <Button variant="outline" size="sm" onClick={triggerSimulationLoading}>
                    Simulate Load
                  </Button>
                </Cluster>
              </header>

              {/* Statistics & Capacity Dashboard Cards */}
              <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Inventory Metrics">
                <Panel className="flex flex-col justify-between p-4">
                  <Text tone="muted" className="text-xs font-semibold uppercase tracking-wider">Total Items</Text>
                  <Text className="mt-2 text-3xl font-bold">{viewModel.statistics.totalItemsCount}</Text>
                  <Text tone="muted" className="mt-1 text-xs">Sum of all item stacks</Text>
                </Panel>
                <Panel className="flex flex-col justify-between p-4">
                  <Text tone="muted" className="text-xs font-semibold uppercase tracking-wider">Unique Stacks</Text>
                  <Text className="mt-2 text-3xl font-bold">{viewModel.statistics.totalStacksCount}</Text>
                  <Text tone="muted" className="mt-1 text-xs">Active slots occupied</Text>
                </Panel>
                <Panel className="flex flex-col justify-between p-4">
                  <Text tone="muted" className="text-xs font-semibold uppercase tracking-wider">Food & Care</Text>
                  <Text className="mt-2 text-3xl font-bold">{viewModel.statistics.typeCounts.food}</Text>
                  <Text tone="muted" className="mt-1 text-xs">Ready for feeding Scan Chan</Text>
                </Panel>

                {/* Capacity progress indicator */}
                <Panel className="flex flex-col justify-between p-4">
                  <Cluster className="justify-between">
                    <Text tone="muted" className="text-xs font-semibold uppercase tracking-wider">Slot Capacity</Text>
                    {viewModel.capacitySummary.isFull && (
                      <StatusChip tone="attention">Full</StatusChip>
                    )}
                  </Cluster>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-3xl font-bold">{viewModel.capacitySummary.used}</span>
                    <span className="text-sm tone-muted">/ {viewModel.capacitySummary.total}</span>
                  </div>
                  <div className="mt-2">
                    <ProgressBar value={viewModel.capacitySummary.percentage} />
                  </div>
                </Panel>
              </section>

              {/* Filtering, Search & Sorting Controls bar */}
              <Surface className="grid gap-4 p-4 md:grid-cols-[1fr_auto_auto]">
                {/* Search query input */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    placeholder="Search by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    aria-label="Search items"
                  />
                </div>

                {/* Sort selector dropdown */}
                <Cluster className="w-full md:w-auto">
                  <Select
                    value={sortBy}
                    onValueChange={(val) => setSortBy(val as 'type' | 'quantity' | 'itemKey' | 'id')}
                  >
                    <SelectTrigger className="w-[140px]" aria-label="Sort by">
                      <SelectValue placeholder="Sort key" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="itemKey">Name</SelectItem>
                      <SelectItem value="quantity">Quantity</SelectItem>
                      <SelectItem value="type">Category</SelectItem>
                    </SelectContent>
                  </Select>

                  <IconButton
                    variant="outline"
                    onClick={handleToggleSortOrder}
                    label="Toggle sort order"
                  >
                    <ArrowUpDown className="h-4 w-4" />
                  </IconButton>
                </Cluster>

                {/* Simulated drag-and-drop placeholder target */}
                <div
                  data-dnd-drop-zone="inventory-bar"
                  className="hidden items-center justify-center rounded-xl border border-dashed border-primary/20 bg-primary/5 px-4 py-2 text-xs md:flex"
                  aria-hidden="true"
                >
                  <span className="text-muted-foreground">Drag items here to sort / use</span>
                </div>
              </Surface>

              {/* Category selector tabs */}
              <nav aria-label="Filter items by category">
                <Cluster className="gap-2">
                  {[
                    { value: 'all', label: 'All Things' },
                    { value: 'food', label: 'Foods' },
                    { value: 'product', label: 'Products' },
                    { value: 'furniture', label: 'Furniture' },
                    { value: 'decoration', label: 'Decorations' },
                    { value: 'memory', label: 'Memories' },
                  ].map((tab) => {
                    const isActive = filterType === tab.value;
                    return (
                      <Button
                        key={tab.value}
                        variant={isActive ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => {
                          setFilterType(tab.value as InventoryItemType | 'all');
                          setSelectedItemId(null); // Clear selected item on tab change
                        }}
                      >
                        {tab.label}
                      </Button>
                    );
                  })}
                </Cluster>
              </nav>

              {/* Main content viewport: loading, empty state, or list grids */}
              <div className="grid gap-6 lg:grid-cols-[1fr_22rem] lg:items-start">
                
                <div className="min-h-[24rem]">
                  {viewModel.isLoading ? (
                    <LoadingState label="Searching storage trunks..." />
                  ) : viewModel.isEmpty ? (
                    <EmptyState
                      title="No items found."
                      description={
                        searchQuery
                          ? `No items match your search for "${searchQuery}".`
                          : "This drawer is empty. Feed Scan Chan or scan groceries to unlock items!"
                      }
                    />
                  ) : (
                    /* The Grid representation */
                    <div
                      className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5"
                      data-dnd-container="inventory-grid"
                    >
                      {viewModel.items.map((item) => {
                        const isSelected = selectedItemId === item.id;
                        // Select palette based on cat variant mappings
                        const catVariant = (item.type === 'food' ? 'calico' : item.type === 'furniture' ? 'tabby' : 'cyan') as CatVariantId;
                        
                        return (
                          <div
                            key={item.id}
                            data-dnd-draggable-id={item.dragAndDropData.dragId}
                            onClick={() => setSelectedItemId(isSelected ? null : item.id)}
                            className="group relative cursor-pointer"
                          >
                            <Card
                              className={`aspect-square overflow-hidden border-2 transition-all hover:shadow-md ${
                                isSelected
                                  ? 'border-[#FFC107] ring-2 ring-[#FFC107]/20'
                                  : 'border-transparent'
                              }`}
                              style={{ backgroundColor: '#FFFDF9' }}
                            >
                              <CardContent className="flex h-full flex-col items-center justify-center p-3 text-center">
                                {/* Cat mascot decoration representation */}
                                <div className="h-16 w-16 transition-transform group-hover:scale-105">
                                  <PixelCat variant={catVariant} action={item.type === 'food' ? 'rewards' : 'none'} />
                                </div>
                                <span className="mt-2 block truncate text-xs font-semibold text-slate-700 w-full">
                                  {item.displayName}
                                </span>
                              </CardContent>
                            </Card>

                            {/* Stacking Quantity Indicator Badge */}
                            <div className="absolute right-2 top-2">
                              <span className="rounded-full bg-slate-800/90 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                                {item.stackSizeDescription}
                              </span>
                            </div>
                          </div>
                        );
                      })}

                      {/* Display inviting empty slots if capacity allows */}
                      {Array.from({ length: Math.max(0, viewModel.capacitySummary.total - viewModel.capacitySummary.used) }).slice(0, 3).map((_, i) => (
                        <div
                          key={`empty-slot-${i}`}
                          className="flex aspect-square items-center justify-center rounded-[20px] border-2 border-dashed border-slate-200 bg-slate-50/50 text-slate-300"
                        >
                          <Plus className="h-5 w-5" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Selected Item Detail Sidebar Panel */}
                <aside aria-label="Item details panel">
                  {viewModel.selectedItem ? (
                    <Surface className="grid gap-4 p-5">
                      <div className="flex items-start justify-between">
                        <div>
                          <Heading level={3}>{viewModel.selectedItem.displayName}</Heading>
                          <Cluster className="mt-1">
                            <span
                              className="inline-block h-3 w-3 rounded-full"
                              style={{ backgroundColor: viewModel.selectedItem.rarityColor }}
                            />
                            <span className="text-xs font-semibold capitalize text-slate-500">
                              {viewModel.selectedItem.type}
                            </span>
                          </Cluster>
                        </div>
                        <StatusChip tone="neutral">
                          {viewModel.selectedItem.stackSizeDescription}
                        </StatusChip>
                      </div>

                      {/* Mascot visual preview */}
                      <div className="flex aspect-[4/3] items-center justify-center rounded-2xl bg-slate-50 border border-slate-100 p-4">
                        <div className="h-28 w-28">
                          <PixelCat
                            variant={viewModel.selectedItem.type === 'food' ? 'calico' : 'tabby'}
                            action={viewModel.selectedItem.type === 'food' ? 'rewards' : 'none'}
                          />
                        </div>
                      </div>

                      {/* Details & description text */}
                      <Stack className="gap-2">
                        <Text tone="strong" className="text-sm">Description</Text>
                        <Text tone="muted" className="text-sm leading-relaxed">
                          {viewModel.selectedItem.description}
                        </Text>
                      </Stack>

                      <Separator />

                      {/* Extension boundaries for item actions */}
                      <Cluster className="justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={!viewModel.selectedItem.canDiscard}
                          onClick={() => handleDiscardItem(viewModel.selectedItem!)}
                        >
                          Discard
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          disabled={!viewModel.selectedItem.canUse}
                          onClick={() => handleUseItem(viewModel.selectedItem!)}
                        >
                          Use Item
                        </Button>
                      </Cluster>
                    </Surface>
                  ) : (
                    /* Inviting panel fallback details when selection is empty */
                    <Surface className="flex flex-col items-center justify-center p-8 text-center min-h-[16rem]">
                      <HelpCircle className="h-10 w-10 text-slate-300 mb-2" />
                      <Text tone="strong" className="text-sm">No item selected</Text>
                      <Text tone="muted" className="text-xs mt-1 max-w-[14rem]">
                        Tap any grid slot or card item to view its details, statistics, and usable actions here.
                      </Text>
                    </Surface>
                  )}
                </aside>

              </div>

            </Stack>
          </SectionContainer>
        </ResponsiveContainer>
      </SafeArea>
    </AppShell>
  );
}
