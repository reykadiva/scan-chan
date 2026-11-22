import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST() {
  const response = NextResponse.json({
    success: true,
    mode: 'GUEST',
  });

  // Set ephemeral session-only cookie (no maxAge: deleted when browser/tab closes)
  response.cookies.set('scan_mode', 'guest', {
    path: '/',
    httpOnly: false,
    sameSite: 'lax',
  });

  return response;
}
