import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Authenticate user securely on server
  let user = null;
  const sessionCookie = request.cookies.get('scan_session')?.value;
  if (sessionCookie) {
    try {
      const parsed = JSON.parse(sessionCookie);
      if (parsed.id) {
        user = { id: parsed.id, email: parsed.email };
      }
    } catch {}
  }

  if (!user) {
    try {
      const { data } = await supabase.auth.getUser();
      user = data.user;
    } catch (err) {
      user = null;
    }
  }

  const isGuest = request.cookies.get('scan_mode')?.value === 'guest';
  const pathname = request.nextUrl.pathname;

  // Protected paths that require authentication or guest choice
  const isProtectedPath =
    pathname.startsWith('/play') ||
    pathname.startsWith('/scan') ||
    pathname.startsWith('/product');

  // Allow choosing mode at /play/mode
  const isModeSelection = pathname === '/play/mode';

  if (isProtectedPath && !user && !isGuest && !isModeSelection) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    url.searchParams.set('auth', 'true');
    return NextResponse.redirect(url);
  }

  // If user tries to visit legacy login, register, or old auth pages, redirect cleanly
  const legacyAuthPaths = ['/login', '/register', '/play/mode/arashu-login', '/arashu-login', '/forgot-password'];
  if (legacyAuthPaths.includes(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = user ? '/play' : '/';
    if (!user) {
      url.searchParams.set('auth', 'true');
    }
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
