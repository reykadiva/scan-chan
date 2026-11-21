import { createClient } from '@/lib/supabase/server';
import { NextResponse, type NextRequest } from 'next/server';
import { syncOAuthUser } from '@/services/auth-service';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const nextParam = requestUrl.searchParams.get('next');

  // Always redirect directly to /play (avoid landing on /play/mode)
  const targetPath = (!nextParam || nextParam === '/play/mode') ? '/play' : nextParam;
  const redirectUrl = new URL(targetPath, request.url);
  const response = NextResponse.redirect(redirectUrl);

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data?.user) {
      const syncResult = await syncOAuthUser(data.user);

      const sessionData = {
        id: data.user.id,
        email: data.user.email || '',
        nickname: syncResult.dbUser?.nickname || data.user.user_metadata?.full_name || 'Hunter',
        avatar: syncResult.dbUser?.avatar || 'calico',
        mode: 'ARASHU',
      };

      response.cookies.set('scan_session', JSON.stringify(sessionData), {
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        httpOnly: false,
        sameSite: 'lax',
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
