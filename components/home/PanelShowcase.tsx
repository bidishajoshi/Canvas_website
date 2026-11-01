import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import type { HomepageSection, PanelType } from '@/lib/types';

interface ShowcasePanelItem {
  id: string;
  name: string;
  panel_count: number;
  badge: string;
  room: string;
  dimensions: string;
  startingPrice: string;
  description: string;
  preview_image_url: string;
}

const DEFAULT_SHOWCASE_PANELS: ShowcasePanelItem[] = [
  {
    id: 'panel-1',
    name: '1 Panel Solid Canvas',
    panel_count: 1,
    badge: 'Classic Single',
    room: 'Accent walls, entryways, bedrooms',
    dimensions: 'From 12"×18" to 36"×48"',
    startingPrice: 'Rs. 700',
    description: 'Clean single-piece gallery stretched canvas. Perfect focal point for compact walls and personal portraits.',
    preview_image_url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'panel-3',
    name: '3 Panel Split Triptych',
    panel_count: 3,
    badge: 'Most Popular',
    room: 'Standard 3-seater sofas, dining walls',
    dimensions: '48"×24" Total (3 @ 16"×24")',
    startingPrice: 'Rs. 2,100',
    description: 'Our #1 best-selling split. Slices any landscape, mountain panorama, or wedding photo into three harmonious vertical panels.',
    preview_image_url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'panel-5',
    name: '5 Panel Chevron Pentaptych',
    panel_count: 5,
    badge: 'Grand Statement',
    room: 'Living room main wall, master suites',
    dimensions: '60"×32" Staggered Graduated Height',
    startingPrice: 'Rs. 3,500',
    description: 'Breathtaking stepped height arrangement creating dramatic architectural depth above your living room furniture.',
    preview_image_url: '/images/shiva-parvati-5panel.png',
  },
  {
    id: 'panel-7',
    name: '7 Piece Panoramic Multi-Split',
    panel_count: 7,
    badge: 'Ultimate Panorama',
    room: 'Wide living rooms, offices, hotels',
    dimensions: '84"×36" Total (7 @ 12"×36")',
    startingPrice: 'Rs. 4,900',
    description: 'Expansive 7-piece continuous gallery statement piece. Famous for running horse Vastu and Himalayan mountain views.',
    preview_image_url: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&w=600&q=80',
  },
];

export async function PanelShowcase({ section }: { section?: HomepageSection }) {
  const supabase = createClient();
  const { data } = await supabase
    .from('panel_types')
    .select('*')
    .eq('status', 'published')
    .order('sort_order', { ascending: true });

  const panelList = DEFAULT_SHOWCASE_PANELS;

  return (
    <section className="container-page py-16 border-t border-border">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-amber-600 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
            Split Panel Layouts
          </span>
          <h2 className="font-display text-2xl sm:text-4xl font-extrabold tracking-tight text-text mt-2">
            {section?.title || 'Choose Your Custom Canvas Panel Split'}
          </h2>
          <p className="mt-2 text-sm text-muted max-w-2xl">
            {section?.subtitle ||
              'Transform your single favorite photo across 1 to 7 handcrafted pine wood canvas panels. Hand-stretched and delivered ready to hang.'}
          </p>
        </div>

        <Link
          href="/size-guide"
          className="shrink-0 px-5 py-2.5 rounded-xl border border-border hover:border-amber-600 bg-surface text-text hover:text-amber-600 font-bold text-xs shadow-sm transition-all flex items-center gap-2"
        >
          <span>📐 Open Full Size Guide</span>
          <span>→</span>
        </Link>
      </div>

      {/* Grid of 4 major panel splits */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {panelList.map((panel) => (
          <div
            key={panel.id}
            className="group rounded-3xl border border-border p-4 bg-surface hover:border-amber-600/70 hover:shadow-xl transition-all duration-200 flex flex-col justify-between"
          >
            <div>
              {/* Image Preview with badge */}
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-neutral-900 border border-border/80">
                <Image
                  src={panel.preview_image_url}
                  alt={panel.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
                <div className="absolute top-2.5 left-2.5">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/75 text-white backdrop-blur shadow-sm">
                    {panel.badge}
                  </span>
                </div>
                <div className="absolute bottom-2.5 right-2.5">
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-amber-600 text-white shadow-md">
                    {panel.startingPrice}
                  </span>
                </div>
              </div>

              {/* Title & Specs */}
              <div className="mt-4 space-y-2">
                <h3 className="font-display font-bold text-base sm:text-lg text-text group-hover:text-amber-600 transition-colors">
                  {panel.name}
                </h3>
                <div className="space-y-1 text-xs">
                  <p className="text-amber-600 font-semibold flex items-center gap-1.5">
                    <span>📏</span>
                    <span>{panel.dimensions}</span>
                  </p>
                  <p className="text-muted flex items-center gap-1.5">
                    <span>🛋️</span>
                    <span>{panel.room}</span>
                  </p>
                </div>
                <p className="text-xs text-muted leading-relaxed pt-1">
                  {panel.description}
                </p>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-5 pt-3 border-t border-border/60 flex items-center justify-between">
              <Link
                href={`/custom-canvas?panel=${panel.id}`}
                className="w-full text-center py-2.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-colors shadow-sm active:scale-95 block"
              >
                Customize {panel.panel_count} Panels →
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Helpful banner */}
      <div className="mt-10 rounded-2xl border border-border bg-surface p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="flex items-center gap-3">
          <span className="text-2xl p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">💡</span>
          <div>
            <h4 className="font-bold text-sm text-text">Not sure which panel count fits your sofa?</h4>
            <p className="text-xs text-muted">Use our interactive Size Guide with sofa &amp; bedroom placement diagrams.</p>
          </div>
        </div>
        <Link
          href="/size-guide"
          className="shrink-0 px-4 py-2 rounded-xl bg-surface-hover hover:bg-surface border border-border text-amber-600 font-bold text-xs transition-all"
        >
          Check Wall Measurement Rules →
        </Link>
      </div>
    </section>
  );
}
