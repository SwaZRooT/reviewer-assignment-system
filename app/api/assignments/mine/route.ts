import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireRole } from '@/lib/auth';

// Reviewers see only their own assignments. The author is not shown (blind review).
export async function GET() {
  const auth = await requireRole('reviewer');
  if ('error' in auth) return auth.error;

  const result = await query(
    `SELECT a.assignment_id, a.status, a.assigned_at, p.title, p.abstract
     FROM assignments a JOIN papers p ON p.paper_id = a.paper_id
     WHERE a.reviewer_id = $1
     ORDER BY a.assigned_at DESC`,
    [auth.session.userId]
  );
  return NextResponse.json({ assignments: result.rows });
}
