import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Product, ScanHistory } from '@prisma/client';
import { serializeProduct } from '@/lib/utils';

export const dynamic = 'force-dynamic';

type ScanHistoryWithProduct = ScanHistory & {
  product: Product | null;
};

function serializeScanHistory(log: ScanHistoryWithProduct) {
  return {
    ...log,
    scannedAt: log.scannedAt.toISOString(),
    product: log.product ? serializeProduct(log.product) : null,
  };
}

export async function GET() {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [totalProducts, totalScans, recentScans, scansByBarcode, allRecentLogs] =
      await Promise.all([
        prisma.product.count(),
        prisma.scanHistory.count(),
        prisma.scanHistory.findMany({
          take: 10,
          orderBy: { scannedAt: 'desc' },
          include: { product: true },
        }) as Promise<ScanHistoryWithProduct[]>,
        // Group by barcode to find most scanned
        prisma.scanHistory.groupBy({
          by: ['barcodeNumber'],
          _count: { barcodeNumber: true },
          orderBy: { _count: { barcodeNumber: 'desc' } },
          take: 1,
        }),
        // Last 7 days for trend
        prisma.scanHistory.findMany({
          where: { scannedAt: { gte: sevenDaysAgo } },
          select: { scannedAt: true },
          orderBy: { scannedAt: 'asc' },
        }),
      ]);

    // Get most scanned product
    let mostScannedProduct = null;
    if (scansByBarcode.length > 0) {
      const topBarcode = scansByBarcode[0].barcodeNumber;
      const product = await prisma.product.findUnique({
        where: { barcodeNumber: topBarcode },
      });
      if (product) {
        mostScannedProduct = {
          ...serializeProduct(product),
          scanCount: scansByBarcode[0]._count.barcodeNumber,
        };
      }
    }

    // Build daily trend for last 7 days
    const trendMap: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      trendMap[key] = 0;
    }
    for (const log of allRecentLogs) {
      const key = log.scannedAt.toISOString().slice(0, 10);
      if (key in trendMap) trendMap[key]++;
    }
    const dailyScanTrend = Object.entries(trendMap).map(([date, count]) => ({
      date,
      count,
    }));

    return NextResponse.json({
      success: true,
      data: {
        totalProducts,
        totalScans,
        mostScannedProduct,
        recentScans: recentScans.map(serializeScanHistory),
        dailyScanTrend,
      },
    });
  } catch (error) {
    console.error('[GET /api/statistics]', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
