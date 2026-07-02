import { getPrismaClient, type DatabaseMode } from '@/lib/database';
import { createRepositories } from './create-repositories';

export function createDatabaseRepositories(mode: DatabaseMode) {
  return createRepositories(getPrismaClient(mode));
}
