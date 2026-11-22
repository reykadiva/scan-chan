import { prisma } from '@/lib/prisma';
import { localDb } from '@/lib/database/local-db';
import { GAME_CONFIG } from '@/lib/game-config';
import { calculateStreakMultiplier } from '@/lib/streak-multiplier';
import { serializeProduct } from '@/lib/utils';
import { isConsumableCategory } from '@/types';

function mapOpenFoodFactsCategory(categoriesStr = ''): string {
  const cats = categoriesStr.toLowerCase();
  if (
    cats.includes('beverage') ||
    cats.includes('drink') ||
    cats.includes('soda') ||
    cats.includes('juice') ||
    cats.includes('tea') ||
    cats.includes('water') ||
    cats.includes('coffee') ||
    cats.includes('minuman') ||
    cats.includes('air mineral') ||
    cats.includes('teh') ||
    cats.includes('kopi')
  ) {
    return 'Drink';
  }
  if (
    cats.includes('candy') ||
    cats.includes('sweet') ||
    cats.includes('chocolate') ||
    cats.includes('confectionery') ||
    cats.includes('permen') ||
    cats.includes('cokelat') ||
    cats.includes('coklat')
  ) {
    return 'Candy';
  }
  if (
    cats.includes('biscuit') ||
    cats.includes('cookie') ||
    cats.includes('wafer') ||
    cats.includes('biskuit') ||
    cats.includes('kukis')
  ) {
    return 'Biscuit';
  }
  if (
    cats.includes('snack') ||
    cats.includes('chip') ||
    cats.includes('crisp') ||
    cats.includes('popcorn') ||
    cats.includes('camilan') ||
    cats.includes('keripik') ||
    cats.includes('snak')
  ) {
    return 'Snack';
  }
  if (
    cats.includes('dairy') ||
    cats.includes('milk') ||
    cats.includes('cheese') ||
    cats.includes('yogurt') ||
    cats.includes('susu') ||
    cats.includes('keju')
  ) {
    return 'Dairy';
  }
  if (
    cats.includes('frozen') ||
    cats.includes('ice cream') ||
    cats.includes('es krim') ||
    cats.includes('gelato')
  ) {
    return 'Frozen';
  }
  if (
    cats.includes('noodle') ||
    cats.includes('ramen') ||
    cats.includes('instant') ||
    cats.includes('mie') ||
    cats.includes('mi instan')
  ) {
    return 'Instant';
  }
  if (
    cats.includes('seasoning') ||
    cats.includes('sauce') ||
    cats.includes('spice') ||
    cats.includes('salt') ||
    cats.includes('bumbu') ||
    cats.includes('saus') ||
    cats.includes('kecap') ||
    cats.includes('sambal')
  ) {
    return 'Seasoning';
  }
  if (
    cats.includes('personal care') ||
    cats.includes('soap') ||
    cats.includes('shampoo') ||
    cats.includes('toothpaste') ||
    cats.includes('hygiene') ||
    cats.includes('sabun') ||
    cats.includes('sampo') ||
    cats.includes('pasta gigi')
  ) {
    return 'Personal Care';
  }
  if (cats.includes('food') || cats.includes('makanan')) {
    return 'Snack';
  }
  return 'Other';
}

// In-memory negative cache for barcodes verified absent (404/not found) on OpenFoodFacts
// TTL: 10 minutes (600,000 ms)
const negativeCache = new Map<string, number>();
const NEGATIVE_CACHE_TTL_MS = 10 * 60 * 1000;

export function clearBarcodeNegativeCache(barcodeNumber: string) {
  negativeCache.delete(barcodeNumber.trim());
}

export async function lookupOrRegisterProduct(barcodeNumber: string) {
  let product: any = null;
  let isNewProduct = false;

  // 1. Look up product in database (Prisma first, then localDb)
  try {
    product = await prisma.product.findUnique({
      where: { barcodeNumber },
    });
  } catch (err) {
    console.warn('[lookupOrRegisterProduct] Prisma find product failed, checking local store:', err);
  }

  if (!product) {
    product = localDb.getProduct(barcodeNumber);
  }

  // 2. Fallback to Open Food Facts API if missing
  if (!product) {
    // Fast-path: check negative cache to respond in <5ms without querying external API repeatedly
    const cachedNotFoundTime = negativeCache.get(barcodeNumber);
    if (cachedNotFoundTime && Date.now() - cachedNotFoundTime < NEGATIVE_CACHE_TTL_MS) {
      return { product: null, isNewProduct: false };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // Strict 2000ms timeout

    try {
      const offRes = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcodeNumber}.json`, {
        headers: { 'User-Agent': 'ScanChan - WebApp - 1.0' },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const offJson = await offRes.json();
      if (offJson.status === 1 && offJson.product) {
        negativeCache.delete(barcodeNumber);
        const p = offJson.product;
        const name = p.product_name || p.product_name_en || p.product_name_id || `Product ${barcodeNumber}`;
        const brand = p.brands ? p.brands.split(',')[0].trim() : null;
        const category = mapOpenFoodFactsCategory(p.categories || '');
        const imageUrl = p.image_url || p.image_front_url || null;
        const description = p.generic_name || p.generic_name_en || null;

        const productData = {
          barcodeNumber,
          productName: name,
          brand,
          category,
          imageUrl,
          description,
          creatorId: 'openfoodfacts',
        };

        try {
          product = await prisma.product.create({
            data: productData,
          });
        } catch {
          product = localDb.saveProduct({
            id: `prod_${Date.now()}`,
            ...productData,
            foodValue: null,
            rarity: null,
            petReaction: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
        isNewProduct = true;
      } else {
        // Not found on OpenFoodFacts: save to negative cache
        negativeCache.set(barcodeNumber, Date.now());
      }
    } catch (e: any) {
      clearTimeout(timeoutId);
      // Timeout or offline: cache negatively to protect user from subsequent delays
      negativeCache.set(barcodeNumber, Date.now());
      if (e?.name === 'AbortError') {
        console.warn(`[OpenFoodFacts] Aborted after 2000ms timeout for barcode ${barcodeNumber}`);
      } else {
        console.warn('Open Food Facts API lookup offline or error:', e);
      }
    }
  } else {
    // Product exists in database: ensure negative cache is clear
    negativeCache.delete(barcodeNumber);
  }

  return { product, isNewProduct };
}

export async function processBarcodeScan(
  barcodeNumber: string,
  userId?: string | null,
  deviceType?: string,
  options?: { skipLog?: boolean }
) {
  const { product, isNewProduct } = await lookupOrRegisterProduct(barcodeNumber);

  // Calculate base XP
  let baseXP = isNewProduct ? GAME_CONFIG.xp.scanNew : GAME_CONFIG.xp.scanExisting;
  let multiplier = 1;

  if (userId) {
    try {
      const userProgress = await prisma.progress.findUnique({
        where: { userId },
      });
      if (userProgress) {
        multiplier = calculateStreakMultiplier(userProgress.streak);
      }
    } catch {
      const localUser = localDb.getUser(userId);
      if (localUser) {
        multiplier = calculateStreakMultiplier(localUser.progress.streak);
      }
    }
  }

  const xpAwarded = Math.round(baseXP * multiplier);

  // 3. Log scan history (only if skipLog is not true)
  if (!options?.skipLog) {
    try {
      await prisma.scanHistory.create({
        data: {
          barcodeNumber,
          productId: product?.id ?? null,
          deviceType: deviceType ?? 'webcam',
          userId: userId ?? null,
          xpAwarded,
        },
      });
    } catch {
      localDb.addScanHistory({
        id: `scan_${Date.now()}`,
        barcodeNumber,
        productId: product?.id ?? null,
        deviceType: deviceType ?? 'webcam',
        userId: userId ?? null,
        xpAwarded,
        scannedAt: new Date().toISOString(),
      });
    }
  }

  // Note: Inventory & progression mutation is handled authoritatively by executeScanAction.
  const foodEligible = isConsumableCategory(product?.category);

  return {
    found: !!product,
    product: product ? serializeProduct(product) : null,
    isNewProduct,
    xpAwarded,
    multiplier,
    foodAdded: foodEligible,
  };
}
