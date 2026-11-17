const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function cleanEmail(v: unknown): string | null {
  if (typeof v !== 'string') return null;
  const e = v.trim().toLowerCase();
  return e.length <= 150 && EMAIL_RE.test(e) ? e : null;
}

// At least 8 characters, one letter, one digit; max 72 because bcrypt ignores anything longer.
export function passwordProblem(v: unknown): string | null {
  if (typeof v !== 'string') return 'Password is required';
  if (v.length < 8) return 'Password must be at least 8 characters';
  if (Buffer.byteLength(v, 'utf8') > 72) return 'Password must be at most 72 bytes';
  if (!/[A-Za-z]/.test(v) || !/\d/.test(v)) return 'Password must contain a letter and a digit';
  return null;
}

export function cleanText(v: unknown, min: number, max: number): string | null {
  if (typeof v !== 'string') return null;
  const t = v.trim();
  return t.length >= min && t.length <= max ? t : null;
}
