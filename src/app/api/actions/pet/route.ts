import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/services/auth-service';
import { executePetAction } from '@/services/player-service';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const session = await getCurrentUser();
    const user = session?.authUser;

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const result = await executePetAction(user.id);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('[API POST /api/actions/pet]', error);
    const status = error.statusCode || 500;
    const clientMessage =
      status === 429
        ? error.message || 'Petting limit reached'
        : 'Failed to pet cat';

    return NextResponse.json(
      { success: false, error: clientMessage },
      { status }
    );
  }
}
