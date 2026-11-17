import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireRole } from '@/lib/auth';

export async function POST(req: Request) {
  const auth = await requireRole('admin');
  if ('error' in auth) return auth.error;

  try {
    const { paper_id, reviewer_id } = await req.json();
    if (!Number.isInteger(paper_id) || !Number.isInteger(reviewer_id)) {
      return NextResponse.json({ success: false, message: 'Invalid paper or reviewer ID' }, { status: 400 });
    }

    // Execute PostgreSQL Stored Atomic Transaction Function
    const result = await query(
      'SELECT assign_reviewer_atomic($1, $2) AS outcome',
      [paper_id, reviewer_id]
    );

    const outcome = result.rows[0].outcome;

    if (outcome.status === 'error') {
      return NextResponse.json({ success: false, message: outcome.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: outcome.message });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
