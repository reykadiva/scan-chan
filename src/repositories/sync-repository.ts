import type { SyncMetadata } from '@/types/sync';
import type { PrismaClient } from '@prisma/client';
import { PetStage, InventoryItemType } from '@prisma/client';

export interface SyncRepository {
  getSyncMetadata(userId: string): Promise<SyncMetadata | null>;
  updateSyncMetadata(userId: string, metadata: Partial<SyncMetadata>): Promise<void>;
  syncPetState(userId: string, state: unknown): Promise<void>;
  syncGameState(userId: string, state: unknown): Promise<void>;
  syncInventoryState(userId: string, state: unknown): Promise<void>;
  syncSettingsState(userId: string, state: unknown): Promise<void>;
  loadPetState(userId: string): Promise<unknown | null>;
  loadGameState(userId: string): Promise<unknown | null>;
  loadInventoryState(userId: string): Promise<unknown | null>;
  loadSettingsState(userId: string): Promise<unknown | null>;
}

export class PrismaSyncRepository implements SyncRepository {
  constructor(private prisma: PrismaClient) {}

  async getSyncMetadata(userId: string): Promise<SyncMetadata | null> {
    const record = await this.prisma.syncMetadata.findUnique({
      where: { userId },
    });
    if (!record) return null;
    return {
      userId: record.userId,
      lastSyncedAt: record.lastSyncedAt?.getTime() ?? null,
      version: record.version,
      source: record.source ?? 'unknown',
    };
  }

  async updateSyncMetadata(userId: string, metadata: Partial<SyncMetadata>): Promise<void> {
    await this.prisma.syncMetadata.upsert({
      where: { userId },
      create: {
        userId,
        lastSyncedAt: metadata.lastSyncedAt ? new Date(metadata.lastSyncedAt) : null,
        version: metadata.version ?? 1,
        source: metadata.source ?? 'web',
      },
      update: {
        lastSyncedAt: metadata.lastSyncedAt ? new Date(metadata.lastSyncedAt) : undefined,
        version: metadata.version,
        source: metadata.source,
      },
    });
  }

  async syncPetState(userId: string, state: unknown): Promise<void> {
    const s = state as Record<string, unknown>;
    const stageMap: Record<string, PetStage> = {
      kitten: PetStage.KITTEN,
      young_cat: PetStage.YOUNG_CAT,
      adult_cat: PetStage.ADULT_CAT,
      wise_cat: PetStage.WISE_CAT,
      legendary_cat: PetStage.LEGENDARY_CAT,
    };
    const stage = stageMap[(s.stage as string) ?? 'kitten'] ?? PetStage.KITTEN;
    
    await this.prisma.pet.upsert({
      where: { userId },
      create: { userId, name: (s.name as string) ?? 'Scan Chan', stage },
      update: { name: s.name as string, stage },
    });
    
    const pet = await this.prisma.pet.findUnique({ where: { userId } });
    if (pet) {
      await this.prisma.petStats.upsert({
        where: { petId: pet.id },
        create: {
          petId: pet.id,
          hunger: (s.hunger as number) ?? 100,
          mood: (s.mood as number) ?? 100,
          energy: (s.energy as number) ?? 100,
          affection: (s.affection as number) ?? 25,
          curiosity: (s.curiosity as number) ?? 50,
        },
        update: {
          hunger: s.hunger as number,
          mood: s.mood as number,
          energy: s.energy as number,
          affection: s.affection as number,
          curiosity: s.curiosity as number,
        },
      });
    }
  }

  async syncGameState(userId: string, state: unknown): Promise<void> {
    const s = state as Record<string, unknown>;
    await this.prisma.progress.upsert({
      where: { userId },
      create: { userId, xp: (s.xp as number) ?? 0, level: (s.level as number) ?? 1, streak: (s.streak as number) ?? 0 },
      update: { xp: s.xp as number, level: s.level as number, streak: s.streak as number },
    });
  }

  async syncInventoryState(userId: string, state: unknown): Promise<void> {
    const s = state as Record<string, unknown>;
    const inventory = await this.prisma.inventory.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });
    
    if (s.items && Array.isArray(s.items)) {
      await this.prisma.inventoryItem.deleteMany({ where: { inventoryId: inventory.id } });
      for (const item of s.items) {
        const i = item as Record<string, unknown>;
        const typeMap: Record<string, InventoryItemType> = {
          product: InventoryItemType.PRODUCT,
          food: InventoryItemType.FOOD,
          memory: InventoryItemType.MEMORY,
          furniture: InventoryItemType.FURNITURE,
          decoration: InventoryItemType.DECORATION,
        };
        const type = typeMap[(i.type as string) ?? 'product'] ?? InventoryItemType.PRODUCT;
        
        await this.prisma.inventoryItem.create({
          data: {
            inventoryId: inventory.id,
            type,
            itemKey: i.itemKey as string,
            quantity: i.quantity as number,
            metadata: i.metadata ? JSON.parse(JSON.stringify(i.metadata)) : undefined,
          },
        });
      }
    }
  }

  async syncSettingsState(userId: string, state: unknown): Promise<void> {
    const s = state as Record<string, unknown>;
    await this.prisma.settings.upsert({
      where: { userId },
      create: { userId, sound: (s.sound as boolean) ?? true, music: (s.music as boolean) ?? true, motion: (s.motion as boolean) ?? true, theme: (s.theme as string) ?? 'warm' },
      update: { sound: s.sound as boolean, music: s.music as boolean, motion: s.motion as boolean, theme: s.theme as string },
    });
  }

  async loadPetState(userId: string): Promise<unknown | null> {
    const pet = await this.prisma.pet.findUnique({
      where: { userId },
      include: { stats: true },
    });
    if (!pet) return null;
    return {
      name: pet.name,
      stage: pet.stage.toLowerCase(),
      hunger: pet.stats?.hunger ?? 100,
      mood: pet.stats?.mood ?? 100,
      energy: pet.stats?.energy ?? 100,
      affection: pet.stats?.affection ?? 25,
      curiosity: pet.stats?.curiosity ?? 50,
    };
  }

  async loadGameState(userId: string): Promise<unknown | null> {
    const progress = await this.prisma.progress.findUnique({ where: { userId } });
    if (!progress) return null;
    return { xp: progress.xp, level: progress.level, streak: progress.streak };
  }

  async loadInventoryState(userId: string): Promise<unknown | null> {
    const inventory = await this.prisma.inventory.findUnique({
      where: { userId },
      include: { items: true },
    });
    if (!inventory) return null;
    return { items: inventory.items };
  }

  async loadSettingsState(userId: string): Promise<unknown | null> {
    const settings = await this.prisma.settings.findUnique({ where: { userId } });
    if (!settings) return null;
    return { sound: settings.sound, music: settings.music, motion: settings.motion, theme: settings.theme };
  }
}
