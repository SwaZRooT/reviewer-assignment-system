'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'author',
    affiliation: '', expertise_text: '', max_workload: '3',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, max_workload: parseInt(form.max_workload, 10) }),
      });
      const data = await res.json();
      if (res.ok) router.push('/login');
      else setError(data.error || 'Registration failed');
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const input = 'w-full border border-gray-300 rounded px-3 py-2 mb-4 focus:ring-2 focus:ring-blue-500 outline-none';
  const label = 'block text-sm font-semibold mb-1';

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-8 font-sans text-gray-900">
      <form onSubmit={submit} className="w-full max-w-lg bg-white p-8 rounded-xl shadow-sm border border-gray-200">
        <h1 className="text-2xl font-bold mb-1">Create an account</h1>
        <p className="text-gray-600 mb-6">Register as an author or a reviewer</p>
        {error && <div className="bg-red-100 text-red-800 p-3 rounded mb-4 text-sm font-medium">{error}</div>}

        <label className={label}>Full name</label>
        <input required className={input} value={form.name} onChange={(e) => set('name', e.target.value)} />
        <label className={label}>Email</label>
        <input required type="email" className={input} value={form.email} onChange={(e) => set('email', e.target.value)} />
        <label className={label}>Password (8+ characters, a letter and a digit)</label>
        <input required type="password" className={input} value={form.password} onChange={(e) => set('password', e.target.value)} />
        <label className={label}>I am a</label>
        <select className={input} value={form.role} onChange={(e) => set('role', e.target.value)}>
          <option value="author">Author (submit papers)</option>
          <option value="reviewer">Reviewer (review papers)</option>
        </select>

        {form.role === 'reviewer' && (
          <>
            <label className={label}>Affiliation</label>
            <input required className={input} value={form.affiliation} onChange={(e) => set('affiliation', e.target.value)} />
            <label className={label}>Areas of expertise</label>
            <textarea required rows={3} className={input} value={form.expertise_text} onChange={(e) => set('expertise_text', e.target.value)} />
            <label className={label}>Maximum papers at a time</label>
            <input type="number" min={1} max={10} className={input} value={form.max_workload} onChange={(e) => set('max_workload', e.target.value)} />
          </>
        )}

        <button type="submit" disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition disabled:opacity-60">
          {loading ? 'Creating...' : 'Create account'}
        </button>
        <p className="text-sm text-gray-600 mt-4 text-center">
          Already registered? <Link href="/login" className="text-blue-600 font-semibold">Log in</Link>
        </p>
      </form>
    </main>
  );
}
