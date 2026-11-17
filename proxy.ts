import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE, homeFor, verifySessionToken } from '@/lib/session';

const PUBLIC_PAGES = ['/login', '/register'];
const PUBLIC_API = ['/api/auth/login', '/api/auth/register'];
const ROLE_PAGES: Record<string, 'admin' | 'author' | 'reviewer'> = {
  '/admin': 'admin',
  '/author': 'author',
  '/reviewer': 'reviewer',
};

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = await verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value);

  if (PUBLIC_API.includes(pathname)) return NextResponse.next();

  if (PUBLIC_PAGES.includes(pathname)) {
    if (session) return NextResponse.redirect(new URL(homeFor(session.role), req.url));
    return NextResponse.next();
  }

  if (!session) {
    if (pathname.startsWith('/api/')) return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
    return NextResponse.redirect(new URL('/login', req.url));
  }

  const needed = ROLE_PAGES[pathname];
  if (needed && needed !== session.role) {
    return NextResponse.redirect(new URL(homeFor(session.role), req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)'],
};
