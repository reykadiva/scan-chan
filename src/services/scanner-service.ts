import { prisma } from '@/lib/prisma';
import { localDb } from '@/lib/database/local-db';
import { GAME_CONFIG } from '@/lib/game-config';
import { calculateStreakMultiplier } from '@/lib/streak-multiplier';
import { serializeProduct } from '@/lib/utils';
import { isConsumableCategory } from '@/types';

export async function lookupOrRegisterProduct(barcodeNumber: string) {
  let product: any = null;

  // 1. Look up product strictly in internal database (Prisma first, then localDb)
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

  // 100% User-driven catalog: No external OpenFoodFacts lookup.
  // If barcode does not exist in internal catalog, user can register it manually.
  return { product, isNewProduct: false };
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

  // 3. Log scan history (strictly for authenticated users; skip for guests to keep RAM ephemeral)
  if (!options?.skipLog && userId) {
    try {
      await prisma.scanHistory.create({
        data: {
          barcodeNumber,
          productId: product?.id ?? null,
          deviceType: deviceType ?? 'webcam',
          userId,
          xpAwarded,
        },
      });
    } catch {
      localDb.addScanHistory({
        id: `scan_${Date.now()}`,
        barcodeNumber,
        productId: product?.id ?? null,
        deviceType: deviceType ?? 'webcam',
        userId,
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
