// nexus/frontend/src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_ROUTES = ['/dashboard'];
const AUTH_ROUTES = ['/auth'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Read token from zustand-persisted localStorage via cookie fallback
  // (We set a lightweight auth-hint cookie on login via the client)
  const authHint = request.cookies.get('nexus-auth')?.value;

  const isProtected = PROTECTED_ROUTES.some((r) => pathname.startsWith(r));
  const isAuthRoute  = AUTH_ROUTES.some((r) => pathname.startsWith(r));

  if (isProtected && !authHint) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth';
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthRoute && authHint) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/auth'],
};
