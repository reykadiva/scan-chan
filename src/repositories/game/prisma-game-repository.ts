import type { PrismaClient } from '@prisma/client';
import type { AchievementProgress } from '@/types/achievement';
import type { GameRepository } from './game-repository';

export class PrismaGameRepository implements GameRepository {
  readonly domain = 'game' as const;

  constructor(readonly prisma: PrismaClient) {}

  async getAchievementProgress(userId: string): Promise<Record<string, AchievementProgress>> {
    const achievements = await this.prisma.achievement.findMany({ where: { userId } });
    return Object.fromEntries(
      achievements.map(a => [
        a.key,
        { key: a.key, unlockedAt: a.unlockedAt?.getTime() ?? null, progress: a.progress },
      ])
    );
  }

  async saveAchievementProgress(userId: string, progress: Record<string, AchievementProgress>): Promise<void> {
    await this.prisma.$transaction(
      Object.entries(progress).map(([key, p]) =>
        this.prisma.achievement.upsert({
          where: { userId_key: { userId, key } },
          create: { userId, key, progress: p.progress, unlockedAt: p.unlockedAt ? new Date(p.unlockedAt) : null },
          update: { progress: p.progress, unlockedAt: p.unlockedAt ? new Date(p.unlockedAt) : null },
        })
      )
    );
  }
}
