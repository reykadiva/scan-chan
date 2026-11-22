import { prisma } from '@/lib/prisma';
import { localDb } from '@/lib/database/local-db';
import { GAME_CONFIG } from '@/lib/game-config';
import { calculateStreakMultiplier } from '@/lib/streak-multiplier';
import { serializeProduct } from '@/lib/utils';

function mapOpenFoodFactsCategory(categoriesStr = ''): string {
  const cats = categoriesStr.toLowerCase();
  if (cats.includes('beverage') || cats.includes('drink') || cats.includes('soda') || cats.includes('juice') || cats.includes('tea') || cats.includes('water')) return 'Drink';
  if (cats.includes('candy') || cats.includes('sweet') || cats.includes('chocolate') || cats.includes('confectionery')) return 'Candy';
  if (cats.includes('biscuit') || cats.includes('cookie') || cats.includes('wafer')) return 'Biscuit';
  if (cats.includes('snack') || cats.includes('chip') || cats.includes('crisp') || cats.includes('popcorn')) return 'Snack';
  if (cats.includes('dairy') || cats.includes('milk') || cats.includes('cheese') || cats.includes('yogurt')) return 'Dairy';
  if (cats.includes('frozen')) return 'Frozen';
  if (cats.includes('noodle') || cats.includes('ramen') || cats.includes('instant')) return 'Instant';
  if (cats.includes('seasoning') || cats.includes('sauce') || cats.includes('spice') || cats.includes('salt')) return 'Seasoning';
  if (cats.includes('personal care') || cats.includes('soap') || cats.includes('shampoo') || cats.includes('toothpaste') || cats.includes('hygiene')) return 'Personal Care';
  return 'Other';
}

export async function processBarcodeScan(barcodeNumber: string, userId?: string | null, deviceType?: string) {
  let product: any = null;
  let isNewProduct = false;

  // 1. Look up product in database (Prisma first, then localDb)
  try {
    product = await prisma.product.findUnique({
      where: { barcodeNumber },
    });
  } catch (err) {
    console.warn('[processBarcodeScan] Prisma find product failed, checking local store:', err);
  }

  if (!product) {
    product = localDb.getProduct(barcodeNumber);
  }

  // 2. Fallback to Open Food Facts API if missing
  if (!product) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const offRes = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcodeNumber}.json`, {
        headers: { 'User-Agent': 'ScanChan - WebApp - 1.0' },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const offJson = await offRes.json();
      if (offJson.status === 1 && offJson.product) {
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
      }
    } catch (e) {
      console.warn('Open Food Facts API lookup offline or timed out:', e);
    }
  }

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

  // 3. Log scan history
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

  // Note: Inventory & progression mutation is handled authoritatively by executeScanAction.
  // processBarcodeScan serves strictly for product lookup, registration, and raw log.
  const cat = product?.category || 'Other';
  const foodEligible = ['Snack', 'Drink', 'Candy', 'Biscuit', 'Dairy', 'Instant'].includes(cat);

  return {
    found: !!product,
    product: product ? serializeProduct(product) : null,
    isNewProduct,
    xpAwarded,
    multiplier,
    foodAdded: foodEligible,
  };
}
