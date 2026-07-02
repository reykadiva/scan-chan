import { z } from 'zod';
import { barcodeSchema } from './product';

export const appModeSchema = z.enum(['GUEST', 'ARASHU']);
export const petStageSchema = z.enum(['KITTEN', 'YOUNG_CAT', 'ADULT_CAT', 'WISE_CAT', 'LEGENDARY_CAT']);
export const missionStatusSchema = z.enum(['ACTIVE', 'COMPLETED', 'EXPIRED']);
export const inventoryItemTypeSchema = z.enum(['PRODUCT', 'FOOD', 'MEMORY', 'FURNITURE', 'DECORATION']);

export const userSchema = z.object({
  mode: appModeSchema,
  nickname: z.string().max(80).optional().nullable(),
  avatar: z.string().max(255).optional().nullable(),
});

export const petSchema = z.object({
  userId: z.string().min(1),
  name: z.string().min(1).max(80),
  stage: petStageSchema.default('KITTEN'),
  mood: z.string().max(80).optional().nullable(),
});

export const petStatsSchema = z.object({
  petId: z.string().min(1),
  hunger: z.number().int().min(0).max(100).default(100),
  mood: z.number().int().min(0).max(100).default(100),
  energy: z.number().int().min(0).max(100).default(100),
  affection: z.number().int().min(0).max(100).default(25),
  curiosity: z.number().int().min(0).max(100).default(50),
});

export const inventoryItemSchema = z.object({
  inventoryId: z.string().min(1),
  type: inventoryItemTypeSchema,
  itemKey: z.string().min(1).max(120),
  quantity: z.number().int().min(0).default(1),
  metadata: z.unknown().optional(),
});

export const scanHistorySchema = z.object({
  userId: z.string().min(1).optional().nullable(),
  barcodeNumber: barcodeSchema,
  productId: z.string().min(1).optional().nullable(),
  deviceType: z.string().max(100).optional().nullable(),
  xpAwarded: z.number().int().min(0).optional().nullable(),
});

export const missionSchema = z.object({
  userId: z.string().min(1),
  templateId: z.string().min(1).max(120),
  title: z.string().min(1).max(160),
  description: z.string().optional().nullable(),
  progress: z.number().int().min(0).default(0),
  target: z.number().int().min(1).default(1),
  status: missionStatusSchema.default('ACTIVE'),
  xpReward: z.number().int().min(0).optional().nullable(),
  date: z.coerce.date(),
});

export const achievementSchema = z.object({
  userId: z.string().min(1).optional().nullable(),
  title: z.string().min(1).max(160),
  description: z.string().optional().nullable(),
  category: z.string().max(120).optional().nullable(),
  threshold: z.number().int().min(0).optional().nullable(),
  xpReward: z.number().int().min(0).optional().nullable(),
  badgeImage: z.string().url().optional().nullable(),
  unlockedAt: z.coerce.date().optional().nullable(),
});

export const progressSchema = z.object({
  userId: z.string().min(1),
  xp: z.number().int().min(0).default(0),
  level: z.number().int().min(1).default(1),
  streak: z.number().int().min(0).default(0),
  lastActiveDate: z.coerce.date().optional().nullable(),
});

export const settingsSchema = z.object({
  userId: z.string().min(1),
  sound: z.boolean().default(true),
  music: z.boolean().default(true),
  motion: z.boolean().default(true),
  theme: z.string().min(1).max(80).default('warm'),
});

export const syncMetadataSchema = z.object({
  userId: z.string().min(1),
  lastSyncedAt: z.coerce.date().optional().nullable(),
  version: z.number().int().min(1).default(1),
  source: z.string().max(120).optional().nullable(),
});

export type UserInput = z.infer<typeof userSchema>;
export type PetInput = z.infer<typeof petSchema>;
export type PetStatsInput = z.infer<typeof petStatsSchema>;
export type InventoryItemInput = z.infer<typeof inventoryItemSchema>;
export type ScanHistoryInput = z.infer<typeof scanHistorySchema>;
export type MissionInput = z.infer<typeof missionSchema>;
export type AchievementInput = z.infer<typeof achievementSchema>;
export type ProgressInput = z.infer<typeof progressSchema>;
export type SettingsInput = z.infer<typeof settingsSchema>;
export type SyncMetadataInput = z.infer<typeof syncMetadataSchema>;
