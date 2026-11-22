import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/services/auth-service';
import { getPlayerProfile, updatePlayerPreferences } from '@/services/player-service';
import { profilePreferencesSchema } from '@/lib/validations/profile';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getCurrentUser();
    const user = session?.authUser;

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await getPlayerProfile(user.id);
    return NextResponse.json({
      success: true,
      data: {
        ...profile,
        email: user.email,
      },
    });
  } catch (error: any) {
    console.error('[API GET /api/profile]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

/**
 * SC-002: Stripped Profile Preferences Update.
 * progression fields (xp, streak, hunger, affection, foodInventory) are IGNORED / REJECTED.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getCurrentUser();
    const user = session?.authUser;

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = profilePreferencesSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || 'Invalid preferences payload' },
        { status: 400 }
      );
    }

    await updatePlayerPreferences(user.id, parsed.data);

    return NextResponse.json({
      success: true,
      message: 'Preferences updated successfully',
    });
  } catch (error: any) {
    console.error('[API POST /api/profile]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update preferences' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  return POST(request);
}
