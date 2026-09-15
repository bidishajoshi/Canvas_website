'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled runtime error:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6 text-center">
      <div className="max-w-md space-y-5 rounded-2xl border border-border bg-surface p-8 shadow-xl">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 text-3xl font-bold border border-amber-500/20">
          ⚠️
        </div>

        <h1 className="font-display text-2xl font-bold text-text">Something went wrong</h1>

        <p className="text-xs text-muted leading-relaxed">
          We encountered a temporary error loading this page. Please try refreshing or return to our storefront.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="flex-1 py-3 px-5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition-all active:scale-95"
          >
            🔄 Try Again
          </button>
          <Link
            href="/"
            className="flex-1 py-3 px-5 rounded-xl border border-border bg-bg hover:bg-surface text-text font-bold text-xs transition-colors"
          >
            🏠 Back to Store
          </Link>
        </div>
      </div>
    </div>
  );
}
