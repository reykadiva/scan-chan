import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentUser } from '@/services/auth-service';
import { executeScanAction } from '@/services/player-service';

export const dynamic = 'force-dynamic';

const scanActionSchema = z.object({
  barcodeNumber: z.string().trim().min(1, 'Barcode number is required'),
  idempotencyKey: z.string().optional(),
  deviceType: z.string().optional(),
  isPostRegistration: z.boolean().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getCurrentUser();
    const user = session?.authUser;

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = scanActionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || 'Invalid scan payload' },
        { status: 400 }
      );
    }

    const result = await executeScanAction(
      user.id,
      parsed.data.barcodeNumber,
      parsed.data.idempotencyKey,
      parsed.data.deviceType,
      parsed.data.isPostRegistration
    );

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('[API POST /api/actions/scan]', error);
    const status = error.statusCode || 500;
    const clientMessage =
      status === 400
        ? error.message || 'Invalid barcode claim'
        : 'Failed to claim barcode scan';

    return NextResponse.json(
      { success: false, error: clientMessage },
      { status }
    );
  }
}
