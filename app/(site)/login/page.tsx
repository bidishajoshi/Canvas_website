'use client';

import { useState, type FormEvent, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') ?? '/account';

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('a@affordabledecoration.com');
  const [password, setPassword] = useState('password123');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function saveDemoSession(userEmail: string) {
    document.cookie = `ad_demo_user=${encodeURIComponent(userEmail)}; path=/; max-age=864000`;
    try {
      localStorage.setItem('ad_user_session', JSON.stringify({ email: userEmail, full_name: fullName || userEmail.split('@')[0] }));
    } catch {}
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      if (isSignUp) {
        const { error: signUpErr } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } },
        });

        if (signUpErr && !signUpErr.message.includes('fetch')) {
          setError(signUpErr.message);
          setLoading(false);
          return;
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError && !signInError.message.includes('fetch')) {
          setError(signInError.message);
          setLoading(false);
          return;
        }
      }

      // Save session fallback & redirect smoothly
      saveDemoSession(email);
      router.push(redirectTo);
      router.refresh();
    } catch {
      // Graceful fallback for network / demo environment
      saveDemoSession(email);
      router.push(redirectTo);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  function handleQuickDemo() {
    setLoading(true);
    saveDemoSession('customer@affordabledecoration.com');
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-xl space-y-6">
      <div className="text-center space-y-1">
        <h1 className="font-display text-2xl font-bold text-text">
          {isSignUp ? 'Create Account' : 'Sign In to Your Account'}
        </h1>
        <p className="text-xs text-muted">
          Access your orders, custom canvas inquiries, and saved wishlist items.
        </p>
      </div>

      <div className="flex rounded-xl bg-bg p-1 border border-border text-xs font-semibold">
        <button
          type="button"
          onClick={() => { setIsSignUp(false); setError(null); }}
          className={`flex-1 py-2 rounded-lg transition-all ${
            !isSignUp ? 'bg-surface text-amber-600 font-bold shadow-sm' : 'text-muted hover:text-text'
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => { setIsSignUp(true); setError(null); }}
          className={`flex-1 py-2 rounded-lg transition-all ${
            isSignUp ? 'bg-surface text-amber-600 font-bold shadow-sm' : 'text-muted hover:text-text'
          }`}
        >
          Register / Sign Up
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {isSignUp && (
          <div>
            <label htmlFor="fullName" className="text-xs font-medium text-muted">
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              required
              placeholder="e.g. Ram Bahadur"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-border bg-bg px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        )}

        <div>
          <label htmlFor="email" className="text-xs font-medium text-muted">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-xl border border-border bg-bg px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div>
          <label htmlFor="password" className="text-xs font-medium text-muted">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-xl border border-border bg-bg px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {error && <p className="text-xs font-medium text-red-600 bg-red-500/10 p-2.5 rounded-lg border border-red-500/20">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-amber-600 hover:bg-amber-700 px-4 py-3 text-sm font-bold text-white shadow-md transition-all active:scale-95 disabled:opacity-50"
        >
          {loading ? 'Processing…' : isSignUp ? 'Create Account & Sign In' : 'Sign In'}
        </button>
      </form>

      <div className="relative border-t border-border pt-4 text-center">
        <span className="text-[11px] text-muted uppercase tracking-wider block mb-3 font-semibold">
          Or instant sign in
        </span>
        <button
          type="button"
          onClick={handleQuickDemo}
          className="w-full py-2.5 px-4 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold text-xs transition-all flex items-center justify-center gap-2"
        >
          <span>⚡</span> Quick Guest / Customer Sign In
        </button>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="container-page flex min-h-[65vh] items-center justify-center py-12">
      <Suspense fallback={<div className="text-sm text-muted">Loading sign in...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
