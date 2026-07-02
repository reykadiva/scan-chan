import type { PrismaClient } from '@prisma/client';

export function createMockPrismaClient(overrides: Partial<PrismaClient> = {}): PrismaClient {
  return overrides as PrismaClient;
}
