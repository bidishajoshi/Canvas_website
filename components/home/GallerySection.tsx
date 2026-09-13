import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import type { HomepageSection } from '@/lib/types';

export async function GallerySection({ section }: { section: HomepageSection }) {
  const supabase = createClient();
  const { data: items } = await supabase
    .from('gallery_items')
    .select('*')
    .eq('status', 'published')
    .order('sort_order', { ascending: true })
    .limit(12);

  if (!items || items.length === 0) return null;

  return (
    <section className="container-page py-14">
      {section.title && (
        <h2 className="font-display text-2xl font-semibold sm:text-3xl">
          {section.title}
        </h2>
      )}

      <div className="mt-8 columns-2 gap-3 sm:columns-3 lg:columns-4 [&>*]:mb-3">
        {items.map((item) => (
          <div key={item.id} className="relative overflow-hidden rounded-card">
            <Image
              src={item.image_url}
              alt={item.caption ?? 'Customer canvas'}
              width={400}
              height={400}
              className="w-full object-cover transition-transform duration-300 hover:scale-105"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
