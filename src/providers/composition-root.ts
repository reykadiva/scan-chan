import type { PrismaClient } from '@prisma/client';
import { getPrismaClient, type DatabaseMode } from '@/lib/database';
import { createRepositories } from '@/repositories';
import { createServices } from '@/services';
import { createApplicationFlows } from './application-flows';

export type AppDependencyMode = DatabaseMode;

export interface AppContainer {
  readonly mode: AppDependencyMode;
  readonly prisma: PrismaClient;
  readonly repositories: ReturnType<typeof createRepositories>;
  readonly services: ReturnType<typeof createServices>;
  readonly flows: ReturnType<typeof createApplicationFlows>;
}

export function createAppContainer(mode: AppDependencyMode): AppContainer {
  return createAppContainerFromPrisma(mode, getPrismaClient(mode));
}

export function createAppContainerFromPrisma(mode: AppDependencyMode, prisma: PrismaClient): AppContainer {
  const repositories = createRepositories(prisma);
  const services = createServices(repositories);
  const flows = createApplicationFlows(services);

  return {
    mode,
    prisma,
    repositories,
    services,
    flows,
  };
}

// ponytail: one composition factory; split by runtime only when stores, routes, jobs, or sync need different lifetimes.
