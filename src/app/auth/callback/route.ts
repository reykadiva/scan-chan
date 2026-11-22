import { createClient } from '@/lib/supabase/server';
import { NextResponse, type NextRequest } from 'next/server';
import { syncOAuthUser } from '@/services/auth-service';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const nextParam = requestUrl.searchParams.get('next');

  // SPA Single-URL: Always redirect directly to root /
  const targetPath = (!nextParam || nextParam === '/play/mode' || nextParam === '/play') ? '/' : nextParam;
  const redirectUrl = new URL(targetPath, request.url);
  const response = NextResponse.redirect(redirectUrl);

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data?.user) {
      const syncResult = await syncOAuthUser(data.user);

      // SC-001: Do not issue unverified custom scan_session cookie.
      // Delete legacy scan_session cookie if present in browser.
      response.cookies.set('scan_session', '', {
        path: '/',
        maxAge: 0,
      });

      response.cookies.set('scan_mode', 'hunter', {
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
        httpOnly: false,
        sameSite: 'lax',
      });
    }
  }

  // Forward any server cookies set by Supabase auth client
  try {
    const cookieStore = await cookies();
    cookieStore.getAll().forEach((c) => {
      response.cookies.set(c.name, c.value);
    });
  } catch {}

  return response;
}
