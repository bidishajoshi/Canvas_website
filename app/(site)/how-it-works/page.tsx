import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'How It Works | Affordable Decoration',
  description:
    'Learn how to customize your photo canvas prints and t-shirts in Nepal. Simple ordering, live previews, archival quality, and fast cash on delivery.',
};

export default function HowItWorksPage() {
  return (
    <div className="container-page py-12 space-y-16">
      {/* Header Banner */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="text-xs uppercase font-bold tracking-wider text-amber-600 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
          Simple Step-by-Step Guide
        </span>
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-text">
          How Ordering Works
        </h1>
        <p className="text-sm text-muted">
          From selecting your canvas split to receiving your handcrafted decor in Kathmandu or anywhere in Nepal.
        </p>
      </div>

      {/* Step Process Cards */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-border p-6 bg-surface shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-600 text-white font-bold text-base shadow-sm">
              1
            </span>
            <h3 className="font-bold text-lg text-text">Upload or Pick Artwork</h3>
            <p className="text-xs text-muted leading-relaxed">
              Upload your favorite family, wedding, or trip photo in high quality, or select from our curated artwork collection.
            </p>
          </div>
          <span className="text-amber-600 font-semibold text-xs">PNG, JPG or WebP Supported</span>
        </div>

        <div className="rounded-2xl border border-border p-6 bg-surface shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-600 text-white font-bold text-base shadow-sm">
              2
            </span>
            <h3 className="font-bold text-lg text-text">Live Wall Preview</h3>
            <p className="text-xs text-muted leading-relaxed">
              Select 1-panel, 3-panel, or 5-panel splits. Pick your frame color and canvas size, and see live previews on wall mockups.
            </p>
          </div>
          <span className="text-amber-600 font-semibold text-xs">Instant Quality Indicator</span>
        </div>

        <div className="rounded-2xl border border-border p-6 bg-surface shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-600 text-white font-bold text-base shadow-sm">
              3
            </span>
            <h3 className="font-bold text-lg text-text">Handcrafted Printing</h3>
            <p className="text-xs text-muted leading-relaxed">
              Our experts print your design using HD pigment inks on museum-grade canvas, gallery-stretched on solid wood frames.
            </p>
          </div>
          <span className="text-amber-600 font-semibold text-xs">Fade-Resistant Archival Quality</span>
        </div>

        <div className="rounded-2xl border border-border p-6 bg-surface shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-600 text-white font-bold text-base shadow-sm">
              4
            </span>
            <h3 className="font-bold text-lg text-text">Doorstep Delivery</h3>
            <p className="text-xs text-muted leading-relaxed">
              Carefully wrapped in multi-layer bubble padding and delivered across Kathmandu Valley &amp; all Nepal districts.
            </p>
          </div>
          <span className="text-amber-600 font-semibold text-xs">Cash on Delivery Available</span>
        </div>
      </div>

      {/* Quick Builder CTA */}
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-8 text-center space-y-4 max-w-3xl mx-auto">
        <h2 className="font-display text-2xl font-bold text-text">Ready to Decorate Your Space?</h2>
        <p className="text-xs text-muted">Try our live customizers right now with zero commitment.</p>
        <div className="flex flex-wrap justify-center gap-4 pt-2">
          <Link
            href="/custom-canvas"
            className="px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition-colors"
          >
            Start Custom Canvas →
          </Link>
          <Link
            href="/custom-t-shirt"
            className="px-6 py-3 rounded-xl border border-border bg-bg hover:bg-surface text-text font-bold text-xs shadow-sm transition-colors"
          >
            Customize T-Shirt →
          </Link>
        </div>
      </div>
    </div>
  );
}
