import Link from 'next/link';
import type { HomepageSection } from '@/lib/types';

export function CustomCanvasCta({ section }: { section: HomepageSection }) {
  return (
    <section className="bg-surface-hover/60 border-y border-border py-16">
      <div className="container-page grid gap-8 md:grid-cols-2">
        {/* Custom Canvas Banner */}
        <div className="flex flex-col items-start justify-between p-8 rounded-2xl border border-border bg-surface card-hover">
          <div className="space-y-3">
            <span className="text-2xl">🖼️</span>
            <h2 className="font-display text-2xl font-bold text-text sm:text-3xl">
              Turn Your Memories Into Canvas
            </h2>
            <p className="text-sm text-muted leading-relaxed">
              Upload your favourite photo, choose 1, 3, or 5 panel splits, select your frame &amp; size, and preview your artwork live!
            </p>
          </div>
          <Link
            href="/custom-canvas"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-amber-600 px-6 py-3 text-sm font-bold text-white hover:bg-amber-700 transition-colors shadow-sm"
          >
            Create Custom Canvas →
          </Link>
        </div>

        {/* Custom T-Shirt Banner */}
        <div className="flex flex-col items-start justify-between p-8 rounded-2xl border border-amber-500/30 bg-amber-500/5 card-hover">
          <div className="space-y-3">
            <span className="text-2xl">👕</span>
            <h2 className="font-display text-2xl font-bold text-text sm:text-3xl">
              Create Your Own T-Shirt
            </h2>
            <p className="text-sm text-muted leading-relaxed">
              Choose a design from our artwork library or upload your own photo. Customize colors, add custom text, and wear your style!
            </p>
          </div>
          <Link
            href="/customize-tshirt"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-text px-6 py-3 text-sm font-bold text-bg hover:opacity-90 transition-opacity shadow-sm"
          >
            Customize T-Shirt Now →
          </Link>
        </div>
      </div>
    </section>
  );
}
