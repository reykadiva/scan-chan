import type { PrismaClient } from '@prisma/client';
import type { ScannerRepository } from './scanner-repository';

export class PrismaScannerRepository implements ScannerRepository {
  readonly domain = 'scanner' as const;

  constructor(readonly prisma: PrismaClient) {}
}
