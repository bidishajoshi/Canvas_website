import Image from 'next/image';
import Link from 'next/link';
import type { HomepageSection } from '@/lib/types';

export function HeroSection({ section }: { section: HomepageSection }) {
  const desktopImage =
    section.media?.desktop_image ||
    'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1200&q=80';
  const mobileImage = section.media?.mobile_image || desktopImage;

  const title = section.title || 'Turn Your Memories Into Beautiful Canvas';
  const subtitle =
    section.subtitle ||
    'Affordable canvas prints, wall décor and personalized products made for your space.';
  const ctaLabel = section.cta_label || 'Customize Canvas';
  const ctaHref = section.cta_href || '/custom-canvas';
  const secondaryCtaLabel = section.secondary_cta_label || 'Customize T-Shirt';
  const secondaryCtaHref = section.secondary_cta_href || '/custom-t-shirt';

  return (
    <section className="relative overflow-hidden bg-surface py-12 lg:py-20 border-b border-border">
      <div className="container-page grid items-center gap-10 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-xs">
            <span>✨</span>
            <span>Nepal's #1 Premium Canvas &amp; Decor Store</span>
          </div>

          <h1 className="font-display text-4xl font-bold leading-tight text-text sm:text-5xl lg:text-6xl tracking-tight">
            {title}
          </h1>

          <p className="max-w-xl text-base sm:text-lg text-muted leading-relaxed">
            {subtitle}
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              href={ctaHref}
              className="rounded-xl bg-amber-600 hover:bg-amber-700 px-6 py-3.5 text-sm font-bold text-white shadow-md transition-transform hover:scale-[1.02]"
            >
              {ctaLabel} →
            </Link>
            <Link
              href={secondaryCtaHref}
              className="rounded-xl border border-border bg-bg hover:bg-surface px-6 py-3.5 text-sm font-bold text-text transition-colors shadow-sm hover:border-amber-600"
            >
              {secondaryCtaLabel}
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border/60 text-xs font-medium text-muted">
            <div>
              <span className="block font-bold text-text text-sm sm:text-base">100% Quality</span>
              <span>HD Archival Print</span>
            </div>
            <div>
              <span className="block font-bold text-text text-sm sm:text-base">Free Preview</span>
              <span>Live 1/3/5 Panels</span>
            </div>
            <div>
              <span className="block font-bold text-text text-sm sm:text-base">Cash on Delivery</span>
              <span>All Across Nepal</span>
            </div>
          </div>
        </div>

        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border shadow-2xl group">
          <Image
            src={desktopImage}
            alt={title}
            fill
            className="hidden object-cover sm:block transition-transform duration-700 group-hover:scale-105"
            priority
          />
          <Image
            src={mobileImage}
            alt={title}
            fill
            className="block object-cover sm:hidden"
            priority
          />
        </div>
      </div>
    </section>
  );
}

