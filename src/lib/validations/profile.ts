import { z } from 'zod';
import { petStageSchema } from './database';

/**
 * SC-002: Server-Authoritative Profile Preferences Schema.
 * ONLY non-economic styling & pet name customizations are allowed.
 * Progression fields (xp, streak, hunger, affection, foodInventory) are stripped / forbidden.
 */
export const profilePreferencesSchema = z.object({
  petName: z
    .string()
    .trim()
    .min(1, 'Pet name cannot be empty')
    .max(24, 'Pet name cannot exceed 24 characters')
    .regex(/^[a-zA-Z0-9\s._'-]+$/, 'Pet name contains invalid characters')
    .optional(),
  selectedTheme: z.string().max(80).optional(),
  selectedBorder: z.string().max(80).optional(),
  selectedAccessory: z.string().max(80).optional(),
  selectedTitle: z.string().max(120).optional(),
  selectedRoom: z.string().max(80).optional(),
});

export type ProfilePreferencesInput = z.infer<typeof profilePreferencesSchema>;

export const profileUpdateSchema = profilePreferencesSchema.extend({
  // Legacy / optional fields for typing compatibility
  xp: z.number().int().min(0).optional(),
  streak: z.number().int().min(0).optional(),
  lastActiveDate: z.string().nullable().optional(),
  petHunger: z.number().int().min(0).max(100).optional(),
  petAffection: z.number().int().min(0).max(100).optional(),
  foodInventory: z.record(z.string(), z.number().int().min(0)).optional(),
  registeredBarcodes: z.array(z.string()).optional(),
  scanHistory: z.array(z.string()).optional(),
  lastFedBarcode: z.string().optional(),
  dailyPetCount: z.number().int().min(0).optional(),
  lastPetDate: z.string().nullable().optional(),
  lastAffectionDecayAt: z.number().int().min(0).optional(),
  lastFedAt: z.number().int().min(0).optional(),
  lastHungerDecayAt: z.number().int().min(0).optional(),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
