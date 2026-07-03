import { applyPetFeeding } from '@/lib/pet';
import type { PetStateModel } from '@/types/pet';
import type { ProductLookupResult, ScannerGameplayResult } from '@/types/scanner';

const SCAN_FEED_XP = 10;

export function executeScannerGameplay(input: {
  lookup: ProductLookupResult;
  pet: PetStateModel;
  currentXp: number;
  now: number;
}): ScannerGameplayResult {
  if (!input.lookup.food || input.lookup.status === 'unsupported' || input.lookup.status === 'failed' || input.lookup.status === 'offline') {
    return failedGameplay(input.lookup.barcode, input.pet, input.currentXp, input.lookup.error ?? input.lookup.status);
  }

  const fed = applyPetFeeding(input.pet, { food: input.lookup.food, now: input.now });

  if (!fed.applied) {
    return failedGameplay(input.lookup.barcode, input.pet, input.currentXp, fed.reason ?? 'feeding-rejected');
  }

  return {
    barcode: input.lookup.barcode,
    status: 'success',
    pet: fed.pet,
    xpGain: SCAN_FEED_XP,
    nextXp: input.currentXp + SCAN_FEED_XP,
    memoryCreated: Boolean(fed.memory),
    homeHubShouldRefresh: true,
    error: null,
  };
}

function failedGameplay(barcode: string, pet: PetStateModel, currentXp: number, error: string): ScannerGameplayResult {
  return {
    barcode,
    status: 'failed',
    pet,
    xpGain: 0,
    nextXp: currentXp,
    memoryCreated: false,
    homeHubShouldRefresh: false,
    error,
  };
}
