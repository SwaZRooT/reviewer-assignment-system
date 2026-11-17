import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';
import { setSessionCookie } from '@/lib/auth';
import { createSessionToken, homeFor, type Role } from '@/lib/session';
import { cleanEmail } from '@/lib/validation';
import { clearFailures, isLimited, recordFailure } from '@/lib/rateLimit';

// Compared against when the email is unknown, so response time does not reveal which emails exist.
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 10);

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = cleanEmail(body.email);
    const password = typeof body.password === 'string' ? body.password : '';
    if (!email || !password) {
      return NextResponse.json({ error: 'Enter a valid email and password' }, { status: 400 });
    }

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'local';
    const key = `${ip}|${email}`;
    if (isLimited(key)) {
      return NextResponse.json({ error: 'Too many failed attempts. Try again in 15 minutes.' }, { status: 429 });
    }

    const res = await query('SELECT user_id, name, password_hash, role FROM users WHERE email = $1', [email]);
    const user = res.rows[0];
    const ok = await bcrypt.compare(password, user ? user.password_hash : DUMMY_HASH);
    if (!user || !ok) {
      recordFailure(key);
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    clearFailures(key);
    const token = await createSessionToken({ userId: user.user_id, name: user.name, role: user.role as Role });
    await setSessionCookie(token);
    return NextResponse.json({ user: { name: user.name, role: user.role }, redirect: homeFor(user.role) });
  } catch (error) {
    console.error('login error', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
