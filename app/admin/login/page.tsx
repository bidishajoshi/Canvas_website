'use client';

import { useState, type FormEvent } from 'react';
import Image from 'next/image';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please enter both your admin email address and password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password: password.trim() }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Login failed. Please verify your admin credentials.');
        setLoading(false);
        return;
      }

      // Hard redirect ensures cookie is sent and server layout loads instantly
      window.location.href = data.redirect || '/admin/dashboard';
    } catch {
      setError('Network error occurred during sign-in. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white p-2 shadow-lg logo-glow border border-border overflow-hidden">
            <Image
              src="/images/logo.png"
              alt="Affordable Decoration Logo"
              width={64}
              height={64}
              priority
              className="object-contain w-full h-full"
            />
          </div>
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-text tracking-tight">
              Affordable Decoration
            </h1>
            <p className="text-xs uppercase tracking-widest font-bold text-amber-600 mt-1">
              Admin Control Panel
            </p>
          </div>
        </div>

        {/* Secure Admin Sign In Card */}
        <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-2xl space-y-5">
          <div className="border-b border-border pb-4">
            <h2 className="font-display text-lg font-bold text-text">Sign In to Admin Portal</h2>
            <p className="text-xs text-muted mt-0.5">
              Enter your official store administrator credentials to manage products, orders, and storefront settings.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-600 font-semibold flex items-center gap-2">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-text mb-1.5 block">
                Admin Email Address
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                placeholder="admin@affordabledecoration.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-border bg-bg px-3.5 py-2.5 text-xs sm:text-sm text-text outline-none focus:ring-2 focus:ring-amber-600 focus:border-amber-600 transition-colors"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-text block">Password</label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[11px] font-semibold text-amber-600 hover:underline"
                >
                  {showPassword ? 'Hide Password' : 'Show Password'}
                </button>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-border bg-bg px-3.5 py-2.5 text-xs sm:text-sm text-text outline-none focus:ring-2 focus:ring-amber-600 focus:border-amber-600 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-amber-600 hover:bg-amber-700 py-3.5 text-xs sm:text-sm font-bold text-white transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Signing In…</span>
                </>
              ) : (
                <span>Sign In to Admin Portal →</span>
              )}
            </button>
          </form>
        </div>

        <div className="text-center text-[11px] text-muted font-medium">
          Protected Store Management System • Affordable Decoration Nepal
        </div>
      </div>
    </div>
  );
}
