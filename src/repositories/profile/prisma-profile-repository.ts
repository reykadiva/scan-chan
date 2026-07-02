import type { PrismaClient } from '@prisma/client';
import type { ProfileRepository } from './profile-repository';

export class PrismaProfileRepository implements ProfileRepository {
  readonly domain = 'profile' as const;

  constructor(readonly prisma: PrismaClient) {}
}
