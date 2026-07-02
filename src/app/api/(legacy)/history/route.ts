import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Product, ScanHistory, Prisma } from '@prisma/client';
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20')));
    const skip = (page - 1) * limit;
    const search = searchParams.get('search') ?? '';

    const where: Prisma.ScanHistoryWhereInput = {};
    if (search) {
      where.OR = [
        { barcodeNumber: { contains: search } },
        { product: { productName: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [logs, total] = await Promise.all([
      prisma.scanHistory.findMany({
        where,
        include: { product: true },
        orderBy: { scannedAt: 'desc' },
        skip,
        take: limit,
      }) as Promise<ScanHistoryWithProduct[]>,
      prisma.scanHistory.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: logs.map(serializeScanHistory),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('[GET /api/history]', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
