import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { scanRequestSchema } from '@/lib/validations/scan';

export const dynamic = 'force-dynamic';

// ponytail: simple keyword-based category mapper
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = scanRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { barcodeNumber, deviceType } = parsed.data;

    // Look up product by barcode
    let product = await prisma.product.findUnique({
      where: { barcodeNumber },
    });

    // ponytail: fallback to Open Food Facts API if not in database
    if (!product) {
      try {
        const offRes = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcodeNumber}.json`, {
          headers: { 'User-Agent': 'ScanChan - WebGame - Version 0.1' },
        });
        const offJson = await offRes.json();
        if (offJson.status === 1 && offJson.product) {
          const offProd = offJson.product;
          const name = offProd.product_name || offProd.product_name_en || offProd.product_name_id || `Product ${barcodeNumber}`;
          const brand = offProd.brands ? offProd.brands.split(',')[0].trim() : null;
          const category = mapOpenFoodFactsCategory(offProd.categories || '');
          const imageUrl = offProd.image_url || offProd.image_front_url || null;
          const description = offProd.generic_name || offProd.generic_name_en || null;

          product = await prisma.product.create({
            data: {
              barcodeNumber,
              productName: name,
              brand,
              category,
              imageUrl,
              description,
              creatorId: 'openfoodfacts',
            },
          });
        }
      } catch (e) {
        console.warn('Open Food Facts API lookup failed or was offline', e);
      }
    }

    // Log the scan
    const scanHistory = await prisma.scanHistory.create({
      data: {
        barcodeNumber,
        productId: product?.id ?? null,
        deviceType: deviceType ?? null,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        found: !!product,
        product: product
          ? {
              ...product,
              createdAt: product.createdAt.toISOString(),
              updatedAt: product.updatedAt.toISOString(),
            }
          : null,
        scanHistory: {
          ...scanHistory,
          scannedAt: scanHistory.scannedAt.toISOString(),
        },
      },
    });
  } catch (error) {
    console.error('[POST /api/scan]', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
