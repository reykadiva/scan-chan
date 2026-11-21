import { NextResponse } from 'next/server';
import { logoutUser } from '@/services/auth-service';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    await logoutUser();
    const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
    // Also remove guest cookie if any
    response.cookies.delete('scan_mode');
    return response;
  } catch (error: any) {
    console.error('[API /api/auth/logout]', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Logout failed' },
      { status: 500 }
    );
  }
}
