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

  // Authenticate user securely on server via Supabase
  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch (err) {
    user = null;
  }

  // SC-001: Clean up any legacy scan_session cookie
  if (request.cookies.has('scan_session')) {
    supabaseResponse.cookies.set('scan_session', '', { path: '/', maxAge: 0 });
  }

  const pathname = request.nextUrl.pathname;

  // SPA Architecture: /play, /scan, and /play/mode redirect directly to root /
  if (pathname === '/play' || pathname === '/scan' || pathname === '/play/mode') {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  // If user tries to visit legacy login, register, or old auth pages, redirect cleanly
  const legacyAuthPaths = ['/login', '/register', '/play/mode/arashu-login', '/arashu-login', '/forgot-password'];
  if (legacyAuthPaths.includes(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    if (!user) {
      url.searchParams.set('auth', 'true');
    }
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
