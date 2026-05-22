import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

const PROTECTED_PATHS = ['/main', '/calendar', '/stats'];
const LOGIN_PATH = '/';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // 보호된 경로 — 비인증 시 로그인 화면으로
  if (PROTECTED_PATHS.some((p) => pathname.startsWith(p))) {
    if (!user) {
      return NextResponse.redirect(new URL(LOGIN_PATH, request.url));
    }
  }

  // 로그인 경로 — 이미 인증됐으면 메인으로
  if (pathname === LOGIN_PATH && user) {
    return NextResponse.redirect(new URL('/main', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|auth/callback).*)',
  ],
};
