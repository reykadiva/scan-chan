import type { PrismaClient } from '@prisma/client';
import type { SharedRepository } from './shared-repository';

export class PrismaSharedRepository implements SharedRepository {
  readonly domain = 'shared' as const;

  constructor(readonly prisma: PrismaClient) {}
}
