import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireRole } from '@/lib/auth';
import { cleanText } from '@/lib/validation';

// GET: authors see only their own papers, admins see all papers. Reviewers are not allowed.
export async function GET() {
  const auth = await requireRole('author', 'admin');
  if ('error' in auth) return auth.error;
  const { session } = auth;

  const sql = `
    SELECT p.paper_id, p.title, p.status, p.created_at, u.name AS author_name,
           (SELECT COUNT(*) FROM assignments a WHERE a.paper_id = p.paper_id)::int AS reviewers_assigned
    FROM papers p JOIN users u ON u.user_id = p.author_id
    ${session.role === 'author' ? 'WHERE p.author_id = $1' : ''}
    ORDER BY p.paper_id DESC`;
  const result = await query(sql, session.role === 'author' ? [session.userId] : []);
  return NextResponse.json({ papers: result.rows });
}

// POST: only authors can submit; the author is always the logged-in user (never taken from the request body).
export async function POST(req: Request) {
  const auth = await requireRole('author');
  if ('error' in auth) return auth.error;

  const body = await req.json().catch(() => ({}));
  const title = cleanText(body.title, 5, 255);
  const abstract = cleanText(body.abstract, 50, 5000);
  if (!title) return NextResponse.json({ error: 'Title must be 5 to 255 characters' }, { status: 400 });
  if (!abstract) return NextResponse.json({ error: 'Abstract must be 50 to 5000 characters' }, { status: 400 });

  const res = await query(
    'INSERT INTO papers (title, abstract, author_id) VALUES ($1, $2, $3) RETURNING paper_id',
    [title, abstract, auth.session.userId]
  );
  return NextResponse.json({ message: 'Paper submitted', paper_id: res.rows[0].paper_id }, { status: 201 });
}
