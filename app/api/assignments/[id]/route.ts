import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireRole } from '@/lib/auth';

// A reviewer can complete or decline only their own assignment, and only while it is still 'assigned'.
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireRole('reviewer');
  if ('error' in auth) return auth.error;

  const { id } = await params;
  const assignmentId = Number(id);
  const body = await req.json().catch(() => ({}));
  if (!Number.isInteger(assignmentId) || (body.status !== 'completed' && body.status !== 'declined')) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const res = await query(
    `UPDATE assignments SET status = $1
     WHERE assignment_id = $2 AND reviewer_id = $3 AND status = 'assigned'
     RETURNING assignment_id`,
    [body.status, assignmentId, auth.session.userId]
  );
  if (res.rowCount === 0) {
    return NextResponse.json({ error: 'Assignment not found or already closed' }, { status: 404 });
  }
  return NextResponse.json({ message: `Assignment marked ${body.status}` });
}
