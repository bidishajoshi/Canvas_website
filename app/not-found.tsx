import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6 text-center">
      <div className="max-w-md space-y-5 rounded-2xl border border-border bg-surface p-8 shadow-xl">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 font-display text-2xl font-bold border border-amber-500/20">
          404
        </div>

        <h1 className="font-display text-2xl font-bold text-text">Page Not Found</h1>

        <p className="text-xs text-muted leading-relaxed">
          The page or product you are looking for may have been moved, renamed, or is currently unavailable.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link
            href="/shop"
            className="flex-1 py-3 px-5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition-all active:scale-95"
          >
            🛒 Browse Shop
          </Link>
          <Link
            href="/"
            className="flex-1 py-3 px-5 rounded-xl border border-border bg-bg hover:bg-surface text-text font-bold text-xs transition-colors"
          >
            🏠 Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
