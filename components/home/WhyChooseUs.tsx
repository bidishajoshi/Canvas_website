import type { HomepageSection } from '@/lib/types';

interface ReasonItem {
  title: string;
  description: string;
  icon?: string;
}

const DEFAULT_REASONS: ReasonItem[] = [
  {
    title: 'Affordable & Premium Quality',
    description: 'Direct manufacturer pricing with archival pigment printing and pine wood framing.',
    icon: '✨',
  },
  {
    title: 'Live Room Wall Preview',
    description: 'See 1, 3, or 5 panel splits on realistic living room walls before you order.',
    icon: '🖼️',
  },
  {
    title: 'Personalized T-Shirts & Decor',
    description: 'Custom canvas prints and combed cotton t-shirts handcrafted for your space.',
    icon: '👕',
  },
  {
    title: 'Cash on Delivery Across Nepal',
    description: 'Fast, safe doorstep delivery across Kathmandu valley and all 77 districts.',
    icon: '🚚',
  },
];

export function WhyChooseUs({ section }: { section: HomepageSection }) {
  const items = (section.settings?.items as ReasonItem[] | undefined) ?? DEFAULT_REASONS;

  return (
    <section className="container-page py-16 border-t border-border">
      <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
        <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-text">
          {section.title || 'Why Nepal Chooses Affordable Decoration'}
        </h2>
        <p className="text-muted text-xs sm:text-sm">
          {section.subtitle || 'We bring gallery-quality art and custom prints to every home and workspace.'}
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item, i) => (
          <div
            key={i}
            className="rounded-2xl border border-border p-6 bg-surface shadow-sm card-hover flex flex-col justify-between space-y-4"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-2xl">
              {item.icon || '✨'}
            </div>
            <div>
              <h3 className="font-bold text-base text-text">{item.title}</h3>
              <p className="mt-2 text-xs text-muted leading-relaxed">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

