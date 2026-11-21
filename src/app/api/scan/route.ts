import { NextRequest, NextResponse } from 'next/server';
import { scanRequestSchema } from '@/lib/validations/scan';
import { getCurrentUser } from '@/services/auth-service';
import { processBarcodeScan } from '@/services/scanner-service';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = scanRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || 'Invalid barcode payload' },
        { status: 400 }
      );
    }

    let userId: string | null = null;
    try {
      const session = await getCurrentUser();
      if (session?.authUser) {
        userId = session.authUser.id;
      }
    } catch {
      // Unauthenticated / guest scan
      userId = null;
    }

    const result = await processBarcodeScan(
      parsed.data.barcodeNumber,
      userId,
      parsed.data.deviceType
    );

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('[API /api/scan]', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process barcode scan' },
      { status: 500 }
    );
  }
}
