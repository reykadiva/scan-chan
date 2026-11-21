import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST() {
  const response = NextResponse.json({
    success: true,
    mode: 'GUEST',
  });

  // Set cookie for 30 days
  response.cookies.set('scan_mode', 'guest', {
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: false,
    sameSite: 'lax',
  });

  return response;
}
