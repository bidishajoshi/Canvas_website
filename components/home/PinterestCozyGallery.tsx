import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { filterDeleted, getGalleryStore } from '@/lib/adminStore';
import type { GalleryItem } from '@/lib/types';

export async function PinterestCozyGallery() {
  const supabase = createClient();
  const { data } = await supabase
    .from('gallery_items')
    .select('*')
    .eq('status', 'published')
    .order('sort_order', { ascending: true })
    .limit(6);

  const rawGallery = data && data.length > 0 ? (data as GalleryItem[]) : getGalleryStore();
  const items = filterDeleted(rawGallery).slice(0, 6);

  return (
    <section className="container-page py-16 border-t border-border">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-amber-600 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
            ✨ Aesthetic Room Inspiration
          </span>
          <h2 className="font-display text-2xl sm:text-4xl font-bold tracking-tight text-text mt-2">
            Pinterest-Inspired Cozy Decor Collections
          </h2>
          <p className="mt-2 text-muted text-sm sm:text-base max-w-xl">
            From soft pink girl room galleries to warm couple memory walls, discover aesthetic layout ideas for your living space.
          </p>
        </div>

        <Link
          href="/gallery"
          className="shrink-0 px-6 py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition-all active:scale-95"
        >
          View Full Photo Gallery →
        </Link>
      </div>

      {/* Editorial Pinterest Masonry / Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item, index) => {
          const aspectRatios = ['aspect-[3/4]', 'aspect-square', 'aspect-[4/5]', 'aspect-[3/4]', 'aspect-square', 'aspect-[4/3]'];
          const aspect = aspectRatios[index % aspectRatios.length];

          return (
            <div
              key={item.id}
              className="group relative rounded-3xl border border-border bg-surface overflow-hidden shadow-sm hover:shadow-xl hover:border-amber-600/50 transition-all duration-300 flex flex-col justify-between"
            >
              {/* Image Container */}
              <div className={`relative w-full ${aspect} overflow-hidden bg-neutral-900`}>
                <Image
                  src={item.image_url}
                  alt={item.caption || 'Cozy Decor Canvas'}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute top-3 left-3">
                  <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-black/60 text-white backdrop-blur shadow">
                    {item.category || 'Gallery Decor'}
                  </span>
                </div>
              </div>

              {/* Details & CTA */}
              <div className="p-5 space-y-2">
                <h3 className="font-display font-bold text-lg text-text group-hover:text-amber-600 transition-colors">
                  {item.caption || 'Custom Photo Canvas'}
                </h3>
                <p className="text-xs text-muted leading-relaxed line-clamp-2">
                  High-definition archival canvas print stretched over handcrafted solid pine wood frame.
                </p>
                <div className="pt-2 flex items-center justify-between text-xs font-bold text-amber-600 group-hover:translate-x-1 transition-transform">
                  <span>Explore Canvas Details</span>
                  <span>→</span>
                </div>
              </div>

              <Link href="/gallery" className="absolute inset-0 z-10" aria-label={item.caption || 'Gallery Link'} />
            </div>
          );
        })}
      </div>
    </section>
  );
}
