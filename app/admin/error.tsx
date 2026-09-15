'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Admin panel runtime error:', error);
  }, [error]);

  return (
    <div className="p-8 max-w-xl mx-auto space-y-4 text-center">
      <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-6 space-y-3">
        <h2 className="font-display text-xl font-bold text-rose-700 dark:text-rose-400">
          Admin Portal Error
        </h2>
        <p className="text-xs text-muted">
          An error occurred while loading this section of the admin portal.
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm"
          >
            Retry Section
          </button>
          <Link
            href="/admin/dashboard"
            className="px-4 py-2 rounded-xl border border-border bg-surface hover:bg-bg text-text font-bold text-xs"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
