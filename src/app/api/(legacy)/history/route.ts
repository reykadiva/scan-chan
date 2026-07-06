import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Product, ScanHistory, Prisma } from '@prisma/client';
import { serializeProduct } from '@/lib/utils';
import { createClient } from '@/lib/supabase/server';

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

    let userId: string | null = null;
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        userId = user.id;
      }
    } catch (e) {
      console.warn('Could not read user auth session in history route', e);
    }

    const where: Prisma.ScanHistoryWhereInput = {
      userId,
    };

    if (search) {
      where.AND = [
        { userId },
        {
          OR: [
            { barcodeNumber: { contains: search } },
            { product: { productName: { contains: search, mode: 'insensitive' } } },
          ]
        }
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
