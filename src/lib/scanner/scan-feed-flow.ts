import type { ScanFeedFlowInput, ScanFeedFlowResult } from '@/types/scanner';
import { lookupScannedProduct, type ProductLookupCache, type ProductLookupFn } from './product-lookup';
import { executeScannerGameplay } from './gameplay';

/**
 * Sprint 3.7 — Scan-to-Feed Flow Controller
 *
 * Orchestrates the full chain from barcode to feeding result:
 *   1. Product lookup (with cache, retry, offline support)
 *   2. Scanner gameplay execution (feeding, pet stats, XP, memory)
 *
 * This flow does NOT touch rewards, achievements, missions, inventory,
 * or UI state. It returns a pure result that callers (store actions,
 * application flow controllers) can use to update their own state.
 */
export async function executeScanFeedFlow(input: ScanFeedFlowInput & {
  lookup: ProductLookupFn;
  cache?: ProductLookupCache;
  retries?: number;
  offline?: boolean;
}): Promise<ScanFeedFlowResult> {
  const now = input.now;

  const lookupResult = await lookupScannedProduct({
    barcode: input.barcode,
    lookup: input.lookup,
    cache: input.cache,
    now,
    retries: input.retries,
    offline: input.offline,
  });

  const gameplay = executeScannerGameplay({
    lookup: lookupResult.result,
    pet: input.pet,
    currentXp: input.currentXp,
    now,
  });

  return {
    barcode: input.barcode,
    timestamp: now,

    // Lookup output
    lookupStatus: lookupResult.result.status,
    lookupProduct: lookupResult.result.product,
    lookupFood: lookupResult.result.food,
    lookupFromCache: lookupResult.result.fromCache,
    lookupAttempts: lookupResult.result.attempts,
    lookupCache: lookupResult.cache,

    // Gameplay output
    gameplayStatus: gameplay.status,
    pet: gameplay.pet,
    xpGain: gameplay.xpGain,
    nextXp: gameplay.nextXp,
    memoryCreated: gameplay.memoryCreated,
    homeHubShouldRefresh: gameplay.homeHubShouldRefresh,

    // Combined status
    success: gameplay.status === 'success',
    error: lookupResult.result.error ?? gameplay.error,
  };
}
