import type { AppDependencyMode } from '@/providers';
import { createAppContainerFromPrisma } from '@/providers';
import { createMockPrismaClient } from '@tests/mocks/prisma';

export function createTestAppContainer(mode: AppDependencyMode = 'guest') {
  return createAppContainerFromPrisma(mode, createMockPrismaClient());
}

// ponytail: keep bootstrap mode-only until tests need per-runtime setup.
