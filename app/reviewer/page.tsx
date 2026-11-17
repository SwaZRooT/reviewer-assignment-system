'use client';
import { useCallback, useEffect, useState } from 'react';
import NavBar from '@/components/NavBar';

interface AssignmentRow {
  assignment_id: number;
  status: string;
  assigned_at: string;
  title: string;
  abstract: string;
}

export default function ReviewerPage() {
  const [rows, setRows] = useState<AssignmentRow[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  const fetchRows = useCallback(async (): Promise<AssignmentRow[]> => {
    const res = await fetch('/api/assignments/mine');
    return res.ok ? (await res.json()).assignments : [];
  }, []);
  const load = useCallback(async () => setRows(await fetchRows()), [fetchRows]);

  useEffect(() => {
    let active = true;
    fetchRows().then((r) => { if (active) setRows(r); });
    return () => { active = false; };
  }, [fetchRows]);

  const update = async (id: number, status: 'completed' | 'declined') => {
    const res = await fetch(`/api/assignments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    setMessage(data.message || data.error);
    load();
  };

  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-gray-50 p-8 font-sans text-gray-900">
        <div className="max-w-5xl mx-auto bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold mb-4">My review assignments</h2>
          {message && <div className="bg-blue-100 text-blue-800 p-3 rounded mb-4 text-sm font-medium">{message}</div>}
          <div className="space-y-4">
            {rows.map((r) => (
              <div key={r.assignment_id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="font-bold">{r.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{r.abstract}</p>
                    <p className="text-xs text-gray-500 mt-2">Assigned {new Date(r.assigned_at).toLocaleDateString()}</p>
                  </div>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm whitespace-nowrap">{r.status}</span>
                </div>
                {r.status === 'assigned' && (
                  <div className="mt-3 flex gap-2">
                    <button onClick={() => update(r.assignment_id, 'completed')}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-1.5 rounded">Mark completed</button>
                    <button onClick={() => update(r.assignment_id, 'declined')}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-semibold px-4 py-1.5 rounded">Decline</button>
                  </div>
                )}
              </div>
            ))}
            {rows.length === 0 && <p className="text-center text-gray-500 p-6">No papers have been assigned to you yet.</p>}
          </div>
        </div>
      </main>
    </>
  );
}
