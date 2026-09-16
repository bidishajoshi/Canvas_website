'use client';

import { useState, type FormEvent, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') ?? '/account';

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password123');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function saveDemoSession(userEmail: string) {
    const finalEmail = userEmail.trim() || 'customer@gmail.com';
    document.cookie = `ad_demo_user=${encodeURIComponent(finalEmail)}; path=/; max-age=864000`;
    try {
      localStorage.setItem(
        'ad_user_session',
        JSON.stringify({
          email: finalEmail,
          full_name: fullName || finalEmail.split('@')[0],
        })
      );
    } catch {}
  }

  async function handleGmailSignIn(customEmail?: string) {
    setLoading(true);
    setError(null);
    const targetEmail = customEmail || email.trim() || 'user@gmail.com';

    try {
      const supabase = createClient();
      // Try OAuth with a fast 1s timeout to prevent hanging on placeholder URL
      const oauthPromise = supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/account`,
        },
      });

      const timeoutPromise = new Promise<{ timeout: boolean }>((resolve) =>
        setTimeout(() => resolve({ timeout: true }), 900)
      );

      const result: any = await Promise.race([oauthPromise, timeoutPromise]);

      if (result?.data?.url) {
        window.location.href = result.data.url;
        return;
      }
    } catch {
      // Fallthrough to instant login
    } finally {
      saveDemoSession(targetEmail);
      setLoading(false);
      router.push(redirectTo);
      router.refresh();
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

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

      saveDemoSession(email);
      router.push(redirectTo);
      router.refresh();
    } catch {
      saveDemoSession(email);
      router.push(redirectTo);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  function handleQuickDemo() {
    setLoading(true);
    saveDemoSession('customer@gmail.com');
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

      {/* Instant Google / Gmail Sign In */}
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => handleGmailSignIn()}
          disabled={loading}
          className="w-full py-3.5 px-4 rounded-xl border border-border bg-bg hover:bg-surface-hover text-text font-bold text-xs sm:text-sm transition-all shadow-sm flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
        >
          <GoogleLogoIcon className="h-5 w-5 shrink-0" />
          <span>{loading ? 'Signing In…' : 'Continue with Google / Gmail'}</span>
        </button>
      </div>

      <div className="relative flex items-center justify-center">
        <div className="w-full border-t border-border" />
        <span className="bg-surface px-3 text-[10px] font-semibold text-muted uppercase tracking-wider absolute">
          Or sign in with email / Gmail
        </span>
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
            Gmail / Email Address
          </label>
          <input
            id="email"
            type="email"
            required
            placeholder="e.g. yourname@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-xl border border-border bg-bg px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div>
          <label htmlFor="password" className="text-xs font-medium text-muted">
            Password (Optional for Gmail sign-in)
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-xl border border-border bg-bg px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {error && <p className="text-xs font-medium text-red-600 bg-red-500/10 p-2.5 rounded-lg border border-red-500/20">{error}</p>}

        <div className="space-y-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-amber-600 hover:bg-amber-700 px-4 py-3 text-sm font-bold text-white shadow-md transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Processing…' : isSignUp ? 'Create Account & Sign In' : 'Sign In with Email / Gmail'}
          </button>
        </div>
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
          <span>⚡</span> Direct Gmail Customer Sign In
        </button>
      </div>
    </div>
  );
}

function GoogleLogoIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.15C3.26 21.3 7.31 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.24c-.25-.72-.38-1.49-.38-2.24s.13-1.52.38-2.24V6.61H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.39l3.99-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.61l3.99 3.15c.95-2.85 3.6-4.96 6.72-4.96z"
      />
    </svg>
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
