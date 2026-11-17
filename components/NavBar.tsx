'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NavBar() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setUser(d?.user ?? null))
      .catch(() => setUser(null));
  }, []);

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  return (
    <nav className="bg-gray-900 text-white px-8 py-3 flex justify-between items-center">
      <span className="font-bold">Reviewer Assignment System</span>
      <div className="flex items-center gap-4 text-sm">
        {user && (
          <span>
            {user.name} <span className="ml-1 bg-gray-700 px-2 py-0.5 rounded text-xs uppercase">{user.role}</span>
          </span>
        )}
        <button onClick={logout} className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded font-semibold">
          Log out
        </button>
      </div>
    </nav>
  );
}
