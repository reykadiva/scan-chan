import type { PrismaClient } from '@prisma/client';
import type { SettingsRepository } from './settings-repository';

export class PrismaSettingsRepository implements SettingsRepository {
  readonly domain = 'settings' as const;

  constructor(readonly prisma: PrismaClient) {}
}
