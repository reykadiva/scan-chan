import type { PrismaClient, Prisma } from '@prisma/client';
import type { InventoryRepository } from './inventory-repository';
import type { InventoryModel, InventoryItem } from '@/types/inventory';
import { createInventory } from '@/lib/inventory';

export class PrismaInventoryRepository implements InventoryRepository {
  readonly domain = 'inventory' as const;

  constructor(readonly prisma: PrismaClient) {}

  async getInventoryByUserId(userId: string): Promise<InventoryModel | null> {
    const inv = await this.prisma.inventory.findUnique({
      where: { userId },
      include: { items: true },
    });

    if (!inv) return null;

    const mappedItems: InventoryItem[] = inv.items.map((item) => ({
      id: item.id,
      type: item.type.toLowerCase() as 'product' | 'food' | 'memory' | 'furniture' | 'decoration',
      itemKey: item.itemKey,
      quantity: item.quantity,
      metadata: item.metadata ? (item.metadata as Record<string, unknown>) : null,
    }));

    return createInventory(userId, 20, mappedItems, inv.id);
  }

  async saveInventory(inventory: InventoryModel): Promise<InventoryModel> {
    const upserted = await this.prisma.$transaction(async (tx) => {
      const dbInv = await tx.inventory.upsert({
        where: { userId: inventory.userId },
        create: { userId: inventory.userId },
        update: {},
      });

      const existingDbItems = await tx.inventoryItem.findMany({
        where: { inventoryId: dbInv.id },
      });

      const domainItemIds = inventory.items.map((i) => i.id);
      const itemsToDelete = existingDbItems.filter((dbi) => !domainItemIds.includes(dbi.id));

      if (itemsToDelete.length > 0) {
        await tx.inventoryItem.deleteMany({
          where: { id: { in: itemsToDelete.map((i) => i.id) } },
        });
      }

      for (const item of inventory.items) {
        await tx.inventoryItem.upsert({
          where: {
            inventoryId_type_itemKey: {
              inventoryId: dbInv.id,
              type: item.type.toUpperCase() as 'PRODUCT' | 'FOOD' | 'MEMORY' | 'FURNITURE' | 'DECORATION',
              itemKey: item.itemKey,
            },
          },
          create: {
            id: item.id,
            inventoryId: dbInv.id,
            type: item.type.toUpperCase() as 'PRODUCT' | 'FOOD' | 'MEMORY' | 'FURNITURE' | 'DECORATION',
            itemKey: item.itemKey,
            quantity: item.quantity,
            metadata: item.metadata ? (item.metadata as unknown as Prisma.InputJsonValue) : undefined,
          },
          update: {
            quantity: item.quantity,
            metadata: item.metadata ? (item.metadata as unknown as Prisma.InputJsonValue) : undefined,
          },
        });
      }

      return tx.inventory.findUnique({
        where: { id: dbInv.id },
        include: { items: true },
      });
    });

    if (!upserted) throw new Error('Failed to save inventory');

    const mappedItems: InventoryItem[] = upserted.items.map((item) => ({
      id: item.id,
      type: item.type.toLowerCase() as 'product' | 'food' | 'memory' | 'furniture' | 'decoration',
      itemKey: item.itemKey,
      quantity: item.quantity,
      metadata: item.metadata ? (item.metadata as Record<string, unknown>) : null,
    }));

    return createInventory(inventory.userId, inventory.capacity, mappedItems, upserted.id);
  }
}
