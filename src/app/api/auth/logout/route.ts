import { NextResponse } from 'next/server';
import { logoutUser } from '@/services/auth-service';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    await logoutUser();
    const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
    response.cookies.set('scan_mode', '', { path: '/', maxAge: 0 });
    response.cookies.set('scan_session', '', { path: '/', maxAge: 0 });
    response.cookies.delete('scan_mode');
    response.cookies.delete('scan_session');
    return response;
  } catch (error: any) {
    console.error('[API /api/auth/logout]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to logout' },
      { status: 500 }
    );
  }
}
