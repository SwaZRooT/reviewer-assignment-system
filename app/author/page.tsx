'use client';
import { useCallback, useEffect, useState } from 'react';
import NavBar from '@/components/NavBar';

interface PaperRow {
  paper_id: number;
  title: string;
  status: string;
  created_at: string;
  reviewers_assigned: number;
}

export default function AuthorPage() {
  const [papers, setPapers] = useState<PaperRow[]>([]);
  const [title, setTitle] = useState('');
  const [abstract, setAbstract] = useState('');
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);

  const fetchPapers = useCallback(async (): Promise<PaperRow[]> => {
    const res = await fetch('/api/papers');
    return res.ok ? (await res.json()).papers : [];
  }, []);
  const load = useCallback(async () => setPapers(await fetchPapers()), [fetchPapers]);

  useEffect(() => {
    let active = true;
    fetchPapers().then((p) => { if (active) setPapers(p); });
    return () => { active = false; };
  }, [fetchPapers]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/papers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, abstract }),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage({ text: `Paper submitted (ID ${data.paper_id})`, ok: true });
      setTitle(''); setAbstract('');
      load();
    } else {
      setMessage({ text: data.error || 'Submission failed', ok: false });
    }
  };

  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-gray-50 p-8 font-sans text-gray-900">
        <div className="max-w-5xl mx-auto space-y-8">
          <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold mb-4">Submit a paper</h2>
            {message && (
              <div className={`p-3 rounded mb-4 text-sm font-medium ${message.ok ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {message.text}
              </div>
            )}
            <form onSubmit={submit}>
              <label className="block text-sm font-semibold mb-1">Title</label>
              <input required value={title} onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 mb-4 focus:ring-2 focus:ring-blue-500 outline-none" />
              <label className="block text-sm font-semibold mb-1">Abstract (at least 50 characters)</label>
              <textarea required rows={5} value={abstract} onChange={(e) => setAbstract(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 mb-4 focus:ring-2 focus:ring-blue-500 outline-none" />
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded">Submit</button>
            </form>
          </section>

          <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold mb-4">My papers</h2>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-800 text-white text-sm">
                  <th className="p-3">ID</th><th className="p-3">Title</th><th className="p-3">Status</th>
                  <th className="p-3">Reviewers assigned</th><th className="p-3">Submitted</th>
                </tr>
              </thead>
              <tbody>
                {papers.map((p) => (
                  <tr key={p.paper_id} className="border-b">
                    <td className="p-3">{p.paper_id}</td>
                    <td className="p-3 font-medium">{p.title}</td>
                    <td className="p-3"><span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">{p.status}</span></td>
                    <td className="p-3">{p.reviewers_assigned}</td>
                    <td className="p-3 text-sm text-gray-600">{new Date(p.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
                {papers.length === 0 && (
                  <tr><td colSpan={5} className="p-6 text-center text-gray-500">You have not submitted any papers yet.</td></tr>
                )}
              </tbody>
            </table>
          </section>
        </div>
      </main>
    </>
  );
}
