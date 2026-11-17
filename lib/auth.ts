import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { SESSION_COOKIE, SESSION_MAX_AGE, verifySessionToken, type Role, type Session } from './session';

export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value);
}

export async function setSessionCookie(token: string) {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,                              // not readable from JavaScript (blocks XSS theft)
    sameSite: 'lax',                             // not sent on cross-site POSTs (CSRF protection)
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.set(SESSION_COOKIE, '', { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 0 });
}

// Server-side authorization for API routes. Returns the session, or a ready-made 401/403 response.
export async function requireRole(...roles: Role[]): Promise<{ session: Session } | { error: NextResponse }> {
  const session = await getSession();
  if (!session) return { error: NextResponse.json({ error: 'Not logged in' }, { status: 401 }) };
  if (!roles.includes(session.role)) {
    return { error: NextResponse.json({ error: 'You do not have permission for this action' }, { status: 403 }) };
  }
  return { session };
}
