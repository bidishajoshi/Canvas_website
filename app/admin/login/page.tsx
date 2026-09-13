'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@affordabledecoration.local');
  const [password, setPassword] = useState('Admin@12345');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Login failed. Please check credentials.');
        return;
      }

      router.push('/admin/dashboard');
      router.refresh();
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-600 text-white font-bold font-display text-xl shadow-md mb-1">
            AD
          </div>
          <h1 className="font-display text-2xl font-bold text-text">Affordable Decoration</h1>
          <p className="text-xs uppercase tracking-widest font-bold text-amber-600">
            Admin Portal
          </p>
        </div>

        {/* Local Dev Warning Notice Banner */}
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs space-y-1">
          <p className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1">
            <span>🔒</span> Local Development Demo Mode
          </p>
          <p className="text-muted leading-relaxed">
            Demo credentials are for local development only and MUST be changed before production.
          </p>
          <div className="pt-1 text-[11px] font-mono text-text/80">
            <span>Email: admin@affordabledecoration.local</span>
            <br />
            <span>Pass: Admin@12345</span>
          </div>
        </div>

        {/* Login Form Card */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-border bg-surface p-6 shadow-xl space-y-4"
        >
          <div>
            <label className="text-xs font-semibold text-muted mb-1 block">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-amber-600 transition-colors"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-muted">Password</label>
              <button
                type="button"
                onClick={() => alert('For local dev reset, use admin@affordabledecoration.local / Admin@12345')}
                className="text-[11px] font-semibold text-amber-600 hover:underline"
              >
                Forgot Password?
              </button>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-amber-600 transition-colors"
            />
          </div>

          {error && (
            <p className="text-xs text-red-600 p-2.5 rounded bg-red-500/10 border border-red-500/20 font-medium">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-amber-600 hover:bg-amber-700 py-3 text-sm font-bold text-white transition-colors shadow-md disabled:opacity-50"
          >
            {loading ? 'Signing In…' : 'Sign In to Admin Portal →'}
          </button>
        </form>
      </div>
    </div>
  );
}
