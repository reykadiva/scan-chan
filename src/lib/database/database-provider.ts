import type { PrismaClient } from '@prisma/client';
import { arashuPrisma } from './arashu-prisma';
import { guestPrisma } from './guest-prisma';

export type DatabaseMode = 'guest' | 'arashu';

export function getPrismaClient(mode: DatabaseMode): PrismaClient {
  return mode === 'guest' ? guestPrisma : arashuPrisma;
}
