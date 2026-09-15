'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@affordabledecoration.com');
  const [password, setPassword] = useState('Admin@12345');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function performLogin(loginEmail: string, loginPass: string) {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPass }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Login failed. Please check credentials.');
        return;
      }

      router.push('/admin/dashboard');
      router.refresh();
    } catch {
      setError('An error occurred during sign-in. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    performLogin(email, password);
  }

  function handleQuickLogin() {
    setEmail('admin@affordabledecoration.com');
    setPassword('Admin@12345');
    performLogin('admin@affordabledecoration.com', 'Admin@12345');
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white p-1.5 shadow-md mb-1 logo-glow border border-border overflow-hidden">
            <Image
              src="/images/logo.png"
              alt="Affordable Decoration Logo"
              width={56}
              height={56}
              priority
              className="object-contain w-full h-full"
            />
          </div>
          <h1 className="font-display text-2xl font-bold text-text">Affordable Decoration</h1>
          <p className="text-xs uppercase tracking-widest font-bold text-amber-600">
            Universal Admin Portal
          </p>
        </div>

        {/* Universal Admin Access Card */}
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 text-xs space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider text-[11px]">
              🔐 Universal Deployment Credentials
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-bold text-[10px]">
              Ready for Production
            </span>
          </div>

          <div className="space-y-1 font-mono text-[11px] bg-surface p-2.5 rounded-xl border border-border">
            <div><span className="text-muted">Email:</span> <strong className="text-amber-600">admin@affordabledecoration.com</strong></div>
            <div><span className="text-muted">Password:</span> <strong className="text-amber-600">Admin@12345</strong></div>
          </div>

          <button
            type="button"
            onClick={handleQuickLogin}
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow transition-all btn-glow active:scale-95 disabled:opacity-50"
          >
            ⚡ Instant One-Click Admin Sign In →
          </button>
        </div>

        {/* Standard Login Form Card */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-border bg-surface p-6 shadow-xl space-y-4"
        >
          <div>
            <label className="text-xs font-semibold text-muted mb-1 block">Admin Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-amber-600 transition-colors"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted mb-1 block">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-amber-600 transition-colors"
            />
          </div>

          {error && (
            <p className="text-xs text-red-600 p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 font-medium">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-amber-600 hover:bg-amber-700 py-3 text-sm font-bold text-white transition-colors shadow-md btn-glow disabled:opacity-50 active:scale-95"
          >
            {loading ? 'Signing In…' : 'Sign In to Admin Portal →'}
          </button>
        </form>
      </div>
    </div>
  );
}
