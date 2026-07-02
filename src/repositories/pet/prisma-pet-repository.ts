import type { PrismaClient } from '@prisma/client';
import type { PetRepository } from './pet-repository';

export class PrismaPetRepository implements PetRepository {
  readonly domain = 'pet' as const;

  constructor(readonly prisma: PrismaClient) {}
}
