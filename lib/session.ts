import { SignJWT, jwtVerify } from 'jose';

export type Role = 'admin' | 'reviewer' | 'author';
export interface Session {
  userId: number;
  name: string;
  role: Role;
}

export const SESSION_COOKIE = 'session';
export const SESSION_MAX_AGE = 60 * 60 * 8; // 8 hours

// The signing secret comes from the environment; there is no hard-coded fallback.
function getKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('SESSION_SECRET is missing or shorter than 32 characters. Set it in .env');
  }
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(s: Session): Promise<string> {
  return new SignJWT({ name: s.name, role: s.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(String(s.userId))
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getKey());
}

export async function verifySessionToken(token: string | undefined): Promise<Session | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getKey(), { algorithms: ['HS256'] });
    const role = payload.role;
    if (role !== 'admin' && role !== 'reviewer' && role !== 'author') return null;
    return { userId: Number(payload.sub), name: String(payload.name), role };
  } catch {
    return null;
  }
}

export function homeFor(role: Role): string {
  return role === 'admin' ? '/admin' : role === 'author' ? '/author' : '/reviewer';
}
