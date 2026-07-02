import type { PrismaClient } from '@prisma/client';
import { PrismaGameRepository } from './game';
import { PrismaInventoryRepository } from './inventory';
import { PrismaPetRepository } from './pet';
import { PrismaProfileRepository } from './profile';
import { PrismaScannerRepository } from './scanner';
import { PrismaSettingsRepository } from './settings';
import { PrismaSharedRepository } from './shared';
import { PrismaUIRepository } from './ui';

export function createRepositories(prisma: PrismaClient) {
  return {
    pet: new PrismaPetRepository(prisma),
    game: new PrismaGameRepository(prisma),
    scanner: new PrismaScannerRepository(prisma),
    ui: new PrismaUIRepository(prisma),
    inventory: new PrismaInventoryRepository(prisma),
    profile: new PrismaProfileRepository(prisma),
    settings: new PrismaSettingsRepository(prisma),
    shared: new PrismaSharedRepository(prisma),
  };
}
