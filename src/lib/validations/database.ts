import { z } from 'zod';
import { barcodeSchema } from './product';

export const appModeSchema = z.enum(['GUEST', 'ARASHU']);
export const petStageSchema = z.enum(['KITTEN', 'YOUNG_CAT', 'ADULT_CAT', 'WISE_CAT', 'LEGENDARY_CAT']);
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
  hunger: z.number().int().min(0).max(100).default(50),
  affection: z.number().int().min(0).max(100).default(10),
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
export type ProgressInput = z.infer<typeof progressSchema>;
export type SettingsInput = z.infer<typeof settingsSchema>;
export type SyncMetadataInput = z.infer<typeof syncMetadataSchema>;
