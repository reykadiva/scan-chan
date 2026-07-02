import type { PrismaClient } from '@prisma/client';
import type { UIRepository } from './ui-repository';

export class PrismaUIRepository implements UIRepository {
  readonly domain = 'ui' as const;

  constructor(readonly prisma: PrismaClient) {}
}
