import type { PrismaClient } from '@prisma/client';
import { createPrismaClient } from '@/lib/database/create-prisma-client';

declare global {
  var _prisma: PrismaClient | undefined;
}

const dbUrl =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL ||
  process.env.SUPABASE_DATABASE_URL;

export const prisma: PrismaClient =
  globalThis._prisma ?? createPrismaClient(dbUrl, 'main');

if (process.env.NODE_ENV !== 'production') {
  globalThis._prisma = prisma;
}