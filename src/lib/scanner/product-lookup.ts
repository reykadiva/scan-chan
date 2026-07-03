import { translateProductToFood } from '@/lib/product';
import type { ProductTranslationInput } from '@/types/product';
import type { ProductLookupCacheEntry, ProductLookupResult } from '@/types/scanner';

export type ProductLookupCache = ReadonlyMap<string, ProductLookupCacheEntry>;
export type ProductLookupFn = (barcode: string) => Promise<ProductTranslationInput | null>;

export async function lookupScannedProduct(input: {
  barcode: string;
  lookup: ProductLookupFn;
  cache?: ProductLookupCache;
  now: number;
  retries?: number;
  offline?: boolean;
}): Promise<{ result: ProductLookupResult; cache: ProductLookupCache }> {
  const barcode = input.barcode.trim();
  const cached = input.cache?.get(barcode);

  if (cached) {
    return finalizeLookup({ barcode, product: cached.product, attempts: 0, fromCache: true, cache: input.cache ?? new Map(), now: input.now });
  }

  if (input.offline) {
    return {
      result: { barcode, status: 'offline', product: null, food: null, translationStatus: null, fromCache: false, attempts: 0, error: 'offline' },
      cache: input.cache ?? new Map(),
    };
  }

  const maxAttempts = Math.max(1, (input.retries ?? 0) + 1);
  let lastError: unknown = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const product = await input.lookup(barcode);
      return finalizeLookup({ barcode, product, attempts: attempt, fromCache: false, cache: input.cache ?? new Map(), now: input.now });
    } catch (error) {
      lastError = error;
    }
  }

  return {
    result: {
      barcode,
      status: 'failed',
      product: null,
      food: null,
      translationStatus: null,
      fromCache: false,
      attempts: maxAttempts,
      error: lastError instanceof Error ? lastError.message : 'lookup-failed',
    },
    cache: input.cache ?? new Map(),
  };
}

function finalizeLookup(input: {
  barcode: string;
  product: ProductTranslationInput | null;
  attempts: number;
  fromCache: boolean;
  cache: ProductLookupCache;
  now: number;
}): { result: ProductLookupResult; cache: ProductLookupCache } {
  const translated = translateProductToFood(input.product ? { ...input.product, barcodeNumber: input.barcode } : null);
  const status = !input.product ? 'unknown' : translated.canFeed ? 'found' : 'unsupported';
  const cache = new Map(input.cache).set(input.barcode, { barcode: input.barcode, product: input.product, cachedAt: input.now });

  return {
    cache,
    result: {
      barcode: input.barcode,
      status,
      product: input.product,
      food: translated.food,
      translationStatus: translated.status,
      fromCache: input.fromCache,
      attempts: input.attempts,
      error: null,
    },
  };
}
