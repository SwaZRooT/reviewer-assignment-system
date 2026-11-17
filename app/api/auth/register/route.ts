import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import pool from '@/lib/db';
import { cleanEmail, cleanText, passwordProblem } from '@/lib/validation';

// Public self-registration is allowed only for 'author' and 'reviewer'.
// Admin accounts can never be created here.
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const name = cleanText(body.name, 2, 100);
  const email = cleanEmail(body.email);
  const pwProblem = passwordProblem(body.password);
  const role = body.role;

  if (!name) return NextResponse.json({ error: 'Name must be 2 to 100 characters' }, { status: 400 });
  if (!email) return NextResponse.json({ error: 'Enter a valid email address' }, { status: 400 });
  if (pwProblem) return NextResponse.json({ error: pwProblem }, { status: 400 });
  if (role !== 'author' && role !== 'reviewer') {
    return NextResponse.json({ error: 'Role must be author or reviewer' }, { status: 400 });
  }

  let affiliation = '', expertise = '', maxWorkload = 3;
  if (role === 'reviewer') {
    const a = cleanText(body.affiliation, 2, 150);
    const e = cleanText(body.expertise_text, 20, 2000);
    const w = Number(body.max_workload ?? 3);
    if (!a) return NextResponse.json({ error: 'Affiliation is required' }, { status: 400 });
    if (!e) return NextResponse.json({ error: 'Describe your expertise in at least 20 characters' }, { status: 400 });
    if (!Number.isInteger(w) || w < 1 || w > 10) {
      return NextResponse.json({ error: 'Maximum workload must be between 1 and 10' }, { status: 400 });
    }
    affiliation = a; expertise = e; maxWorkload = w;
  }

  const hash = await bcrypt.hash(body.password, 10);
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const ins = await client.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING user_id',
      [name, email, hash, role]
    );
    if (role === 'reviewer') {
      await client.query(
        'INSERT INTO reviewer_profiles (reviewer_id, affiliation, max_workload, expertise_text) VALUES ($1, $2, $3, $4)',
        [ins.rows[0].user_id, affiliation, maxWorkload, expertise]
      );
    }
    await client.query('COMMIT');
    return NextResponse.json({ message: 'Account created. You can log in now.' }, { status: 201 });
  } catch (error) {
    await client.query('ROLLBACK');
    const code = (error as { code?: string }).code;
    if (code === '23505') return NextResponse.json({ error: 'This email is already registered' }, { status: 409 });
    if (code === '23514') return NextResponse.json({ error: 'Some data was rejected by database validation' }, { status: 400 });
    console.error('register error', error);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  } finally {
    client.release();
  }
}
