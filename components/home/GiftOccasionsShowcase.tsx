import Link from 'next/link';

interface OccasionCard {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  ctaText: string;
  ctaHref: string;
  emoji: string;
}

const OCCASIONS: OccasionCard[] = [
  {
    id: 'anniversary',
    badge: 'Couples & Weddings',
    title: 'Anniversaries & Weddings',
    subtitle: 'From vows to golden years',
    description: 'Transform wedding photos, engagement sessions, and couple snapshots into romantic 3-panel split wall art.',
    ctaText: 'Build Couple Canvas',
    ctaHref: '/custom-canvas',
    emoji: '💍',
  },
  {
    id: 'housewarming',
    badge: 'Griha Pravesh & Decor',
    title: 'Housewarming & Vastu Art',
    subtitle: 'Blessings for your new home',
    description: 'Breathtaking 7-piece running horse landscapes and serene Buddha prints believed to attract prosperity and positive vibes.',
    ctaText: 'Explore Vastu Decor',
    ctaHref: '/categories',
    emoji: '🏡',
  },
  {
    id: 'birthday',
    badge: 'Milestone Surprises',
    title: 'Birthday Surprises',
    subtitle: 'A gift they will never forget',
    description: 'Personalized memory photo grids and custom-printed graphic tees featuring inside jokes, memories, and custom names.',
    ctaText: 'Design Birthday Gift',
    ctaHref: '/custom-canvas',
    emoji: '🎁',
  },
  {
    id: 'family',
    badge: 'Generations of Love',
    title: 'Family & Baby Portraits',
    subtitle: 'Capture fleeting childhood moments',
    description: 'High-definition portraits of newborns, kids, and grandparents stretched on museum cotton for living room centerpieces.',
    ctaText: 'Order Family Canvas',
    ctaHref: '/custom-canvas',
    emoji: '👶',
  },
  {
    id: 'corporate',
    badge: 'Offices & Bulk',
    title: 'Corporate & Bulk Gifts',
    subtitle: 'Customized for teams & events',
    description: 'Branded company logo canvas panels, employee recognition plaques, and custom corporate event t-shirts with volume discounts.',
    ctaText: 'Request Bulk Quote',
    ctaHref: '/bulk-orders',
    emoji: '🏢',
  },
];

export function GiftOccasionsShowcase() {
  return (
    <section className="container-page py-16 border-t border-border">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-amber-600 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
            Gift Finder &amp; Occasions
          </span>
          <h2 className="font-display text-2xl sm:text-4xl font-extrabold tracking-tight text-text mt-2">
            The Perfect Personalized Gift for Every Celebration
          </h2>
          <p className="mt-2 text-sm text-muted max-w-xl">
            Surprise your loved ones with gifts that hold deep emotional meaning. Handcrafted in Nepal and delivered with gift packaging options.
          </p>
        </div>

        <Link
          href="/gift-guide"
          className="shrink-0 px-6 py-3 rounded-2xl bg-surface-hover hover:bg-surface border border-border hover:border-amber-600 text-text font-bold text-xs shadow-sm transition-all active:scale-95 flex items-center gap-2"
        >
          <span>View All Occasion Ideas</span>
          <span>→</span>
        </Link>
      </div>

      {/* Occasion Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {OCCASIONS.map((occ) => (
          <div
            key={occ.id}
            className="group rounded-2xl border border-border bg-surface p-5 hover:border-amber-600 hover:shadow-xl transition-all duration-200 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-3xl p-2 rounded-xl bg-surface-hover inline-block">
                  {occ.emoji}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  {occ.badge}
                </span>
              </div>

              <h3 className="font-display font-bold text-base text-text group-hover:text-amber-600 transition-colors">
                {occ.title}
              </h3>
              <p className="text-[11px] font-medium text-amber-600 mt-0.5">
                {occ.subtitle}
              </p>
              <p className="mt-2 text-xs text-muted leading-relaxed">
                {occ.description}
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-border/60">
              <Link
                href={occ.ctaHref}
                className="w-full text-center py-2 px-3 rounded-xl bg-amber-600/10 group-hover:bg-amber-600 text-amber-600 group-hover:text-white font-bold text-xs transition-colors block shadow-xs"
              >
                {occ.ctaText} →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
