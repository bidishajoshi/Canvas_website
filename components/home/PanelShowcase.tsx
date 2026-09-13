import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import type { HomepageSection, PanelType } from '@/lib/types';

export async function PanelShowcase({ section }: { section: HomepageSection }) {
  const supabase = createClient();
  const { data: panelTypes } = await supabase
    .from('panel_types')
    .select('*')
    .eq('status', 'published')
    .order('sort_order', { ascending: true });

  if (!panelTypes || panelTypes.length === 0) return null;

  return (
    <section className="container-page py-14">
      {section.title && (
        <h2 className="font-display text-2xl font-semibold sm:text-3xl">
          {section.title}
        </h2>
      )}

      <div className="mt-8 grid gap-6 sm:grid-cols-3">
        {(panelTypes as PanelType[]).map((panel) => (
          <Link
            key={panel.id}
            href={`/custom-canvas?panel=${panel.id}`}
            className="group rounded-card border border-border p-4 transition-shadow hover:shadow-md"
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-card bg-surface">
              {panel.preview_image_url && (
                <Image
                  src={panel.preview_image_url}
                  alt={panel.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              )}
            </div>
            <h3 className="mt-3 font-semibold">{panel.name}</h3>
            {panel.description && (
              <p className="mt-1 text-sm text-muted">{panel.description}</p>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}
