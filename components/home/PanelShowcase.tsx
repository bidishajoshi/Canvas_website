import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import type { HomepageSection, PanelType } from '@/lib/types';

const DEFAULT_PANELS: Partial<PanelType>[] = [
  {
    id: 'single',
    name: '1 Panel Single Canvas',
    description: 'Classic single-piece canvas print with gallery stretched depth.',
    preview_image_url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80',
    panel_count: 1,
    status: 'published',
    sort_order: 1,
  },
  {
    id: 'triptych',
    name: '3 Panel Split Triptych',
    description: 'Modern 3-piece canvas set that splits your photo into a dramatic centerpiece.',
    preview_image_url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80',
    panel_count: 3,
    status: 'published',
    sort_order: 2,
  },
  {
    id: 'pentaptych',
    name: '5 Panel Grand Statement',
    description: 'Breathtaking 5-piece staggered canvas set for living rooms & master bedrooms.',
    preview_image_url: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&w=600&q=80',
    panel_count: 5,
    status: 'published',
    sort_order: 3,
  },
];

export async function PanelShowcase({ section }: { section: HomepageSection }) {
  const supabase = createClient();
  const { data } = await supabase
    .from('panel_types')
    .select('*')
    .eq('status', 'published')
    .order('sort_order', { ascending: true });

  const panelTypes = data && data.length > 0 ? (data as PanelType[]) : (DEFAULT_PANELS as PanelType[]);

  return (
    <section className="container-page py-14 border-t border-border">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="font-display text-2xl font-bold sm:text-3xl tracking-tight text-text">
            {section.title || 'Choose Your Canvas Panel Layout'}
          </h2>
          <p className="mt-2 text-muted text-sm sm:text-base">
            From classic single-piece canvases to grand 5-panel wall splits, customize to fit your wall space.
          </p>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        {panelTypes.map((panel) => (
          <Link
            key={panel.id}
            href={`/custom-canvas?panel=${panel.id}`}
            className="group rounded-2xl border border-border p-4 bg-surface transition-all hover:border-amber-600 hover:shadow-lg flex flex-col justify-between"
          >
            <div>
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-bg">
                {panel.preview_image_url && (
                  <Image
                    src={panel.preview_image_url}
                    alt={panel.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}
              </div>
              <h3 className="mt-4 font-bold text-lg text-text group-hover:text-amber-600 transition-colors">
                {panel.name}
              </h3>
              {panel.description && (
                <p className="mt-1 text-xs text-muted leading-relaxed">{panel.description}</p>
              )}
            </div>
            <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs font-semibold text-amber-600">
              <span>Try Live Demo</span>
              <span>→</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

