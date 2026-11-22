import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/services/auth-service';
import { getPlayerProfile, updatePlayerProfile } from '@/services/player-service';
import { profileUpdateSchema } from '@/lib/validations/profile';

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

export async function POST(request: NextRequest) {
  try {
    const session = await getCurrentUser();
    const user = session?.authUser;

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = profileUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || 'Invalid profile payload' },
        { status: 400 }
      );
    }

    await updatePlayerProfile(user.id, parsed.data);

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
    });
  } catch (error: any) {
    console.error('[API POST /api/profile]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
