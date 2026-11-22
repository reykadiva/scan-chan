import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/services/auth-service';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const isGuestCookie = request.cookies.get('scan_mode')?.value === 'guest';
    const currentUser = await getCurrentUser();

    if (currentUser?.authUser) {
      return NextResponse.json({
        success: true,
        authenticated: true,
        mode: 'ARASHU',
        user: {
          id: currentUser.authUser.id,
          email: currentUser.authUser.email,
          nickname: currentUser.dbUser?.nickname || 'Hunter',
          avatar: currentUser.dbUser?.avatar || '🐱',
        },
      });
    }

    if (isGuestCookie) {
      return NextResponse.json({
        success: true,
        authenticated: false,
        mode: 'GUEST',
        user: null,
      });
    }

    return NextResponse.json({
      success: true,
      authenticated: false,
      mode: null,
      user: null,
    });
  } catch (error: any) {
    console.error('[API /api/auth/session]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve session' },
      { status: 500 }
    );
  }
}
