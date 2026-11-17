'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        router.push(data.redirect);
        router.refresh();
      } else {
        setError(data.error || 'Login failed');
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-8 font-sans text-gray-900">
      <form onSubmit={submit} className="w-full max-w-md bg-white p-8 rounded-xl shadow-sm border border-gray-200">
        <h1 className="text-2xl font-bold mb-1">Reviewer Assignment System</h1>
        <p className="text-gray-600 mb-6">Log in to continue</p>

        {error && <div className="bg-red-100 text-red-800 p-3 rounded mb-4 text-sm font-medium">{error}</div>}

        <label className="block text-sm font-semibold mb-1" htmlFor="email">Email</label>
        <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 mb-4 focus:ring-2 focus:ring-blue-500 outline-none" />

        <label className="block text-sm font-semibold mb-1" htmlFor="password">Password</label>
        <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 mb-6 focus:ring-2 focus:ring-blue-500 outline-none" />

        <button type="submit" disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition disabled:opacity-60">
          {loading ? 'Logging in...' : 'Log in'}
        </button>
        <p className="text-sm text-gray-600 mt-4 text-center">
          New here? <Link href="/register" className="text-blue-600 font-semibold">Create an account</Link>
        </p>
      </form>
    </main>
  );
}
