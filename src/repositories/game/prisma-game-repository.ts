import type { PrismaClient } from '@prisma/client';
import type { GameRepository } from './game-repository';

export class PrismaGameRepository implements GameRepository {
  readonly domain = 'game' as const;

  constructor(readonly prisma: PrismaClient) {}
}
