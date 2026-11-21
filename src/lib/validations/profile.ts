import { z } from 'zod';
import { petStageSchema } from './database';

export const profileUpdateSchema = z.object({
  xp: z.number().int().min(0).optional(),
  streak: z.number().int().min(0).optional(),
  lastActiveDate: z.string().nullable().optional(),
  petName: z.string().min(1).max(80).optional(),
  petStage: petStageSchema.optional(),
  petHunger: z.number().int().min(0).max(100).optional(),
  petAffection: z.number().int().min(0).max(100).optional(),
  foodInventory: z.record(z.string(), z.number().int().min(0)).optional(),
  selectedTheme: z.string().max(80).optional(),
  selectedBorder: z.string().max(80).optional(),
  selectedAccessory: z.string().max(80).optional(),
  selectedTitle: z.string().max(120).optional(),
  selectedRoom: z.string().max(80).optional(),
  registeredBarcodes: z.array(z.string()).optional(),
  scanHistory: z.array(z.string()).optional(),
  lastFedBarcode: z.string().optional(),
  dailyPetCount: z.number().int().min(0).optional(),
  lastPetDate: z.string().nullable().optional(),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
