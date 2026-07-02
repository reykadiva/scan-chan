import type { PrismaClient } from '@prisma/client';
import type { InventoryRepository } from './inventory-repository';

export class PrismaInventoryRepository implements InventoryRepository {
  readonly domain = 'inventory' as const;

  constructor(readonly prisma: PrismaClient) {}
}
