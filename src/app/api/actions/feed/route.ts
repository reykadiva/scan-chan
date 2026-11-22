import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentUser } from '@/services/auth-service';
import { executeFeedAction } from '@/services/player-service';

export const dynamic = 'force-dynamic';

const feedActionSchema = z.object({
  barcode: z.string().trim().min(1, 'Barcode is required'),
  category: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getCurrentUser();
    const user = session?.authUser;

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = feedActionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || 'Invalid feed payload' },
        { status: 400 }
      );
    }

    const result = await executeFeedAction(user.id, parsed.data.barcode, parsed.data.category);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('[API POST /api/actions/feed]', error);
    const status = error.statusCode || 500;
    const clientMessage =
      status === 400
        ? error.message || 'Invalid feeding request'
        : 'Failed to feed pet';

    return NextResponse.json(
      { success: false, error: clientMessage },
      { status }
    );
  }
}
