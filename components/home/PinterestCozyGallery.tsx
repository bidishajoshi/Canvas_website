import Image from 'next/image';
import Link from 'next/link';

interface CozyInspirationItem {
  id: string;
  title: string;
  categoryTag: string;
  imageUrl: string;
  aspectRatio: string;
  description: string;
  href: string;
}

const PINTEREST_DECOR_ITEMS: CozyInspirationItem[] = [
  {
    id: 'cozy-1',
    title: 'Cozy Pink Bedroom Wall Gallery',
    categoryTag: 'Girl Room Decor',
    imageUrl: 'https://images.unsplash.com/photo-1582562124811-c09040d0a901?auto=format&fit=crop&w=800&q=80',
    aspectRatio: 'aspect-[3/4]',
    description: 'Soft aesthetic bedroom wall setup with pastel tones and floating photo canvas frames.',
    href: '/custom-canvas',
  },
  {
    id: 'cozy-2',
    title: 'Polaroid Memory Canvas Arrangement',
    categoryTag: 'Couple Room Decor',
    imageUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80',
    aspectRatio: 'aspect-square',
    description: 'Personalized multi-panel family and anniversary memories arranged continuously.',
    href: '/custom-canvas',
  },
  {
    id: 'cozy-3',
    title: 'Minimalist Quote Wall Art',
    categoryTag: 'Study Corner',
    imageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
    aspectRatio: 'aspect-[4/5]',
    description: 'Clean typography canvas for peaceful study nooks, home office, or dorm rooms.',
    href: '/shop',
  },
  {
    id: 'cozy-4',
    title: 'Dreamy Fairy Light Gallery Wall',
    categoryTag: 'Bedroom Decor',
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    aspectRatio: 'aspect-[3/4]',
    description: 'Warm lighting paired with 3-piece landscape canvas splits for bedroom walls.',
    href: '/custom-canvas',
  },
  {
    id: 'cozy-5',
    title: 'Custom Photo Collage Canvas',
    categoryTag: 'Friendship Wall',
    imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80',
    aspectRatio: 'aspect-square',
    description: 'Capture unforgettable trip moments and friendship milestones on stretched canvas.',
    href: '/custom-canvas',
  },
  {
    id: 'cozy-6',
    title: 'Botanical & Aesthetic Art Slices',
    categoryTag: 'Cozy Living',
    imageUrl: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&w=800&q=80',
    aspectRatio: 'aspect-[4/3]',
    description: 'Nature-inspired 5-panel split artwork for relaxing living spaces.',
    href: '/shop',
  },
];

export function PinterestCozyGallery() {
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
          href="/custom-canvas"
          className="shrink-0 px-6 py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition-all active:scale-95"
        >
          Create Your Wall Gallery →
        </Link>
      </div>

      {/* Editorial Pinterest Masonry / Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {PINTEREST_DECOR_ITEMS.map((item) => (
          <div
            key={item.id}
            className="group relative rounded-3xl border border-border bg-surface overflow-hidden shadow-sm hover:shadow-xl hover:border-amber-600/50 transition-all duration-300 flex flex-col justify-between"
          >
            {/* Image Container */}
            <div className={`relative w-full ${item.aspectRatio} overflow-hidden bg-neutral-900`}>
              <Image
                src={item.imageUrl}
                alt={item.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute top-3 left-3">
                <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-black/60 text-white backdrop-blur shadow">
                  {item.categoryTag}
                </span>
              </div>
            </div>

            {/* Details & CTA */}
            <div className="p-5 space-y-2">
              <h3 className="font-display font-bold text-lg text-text group-hover:text-amber-600 transition-colors">
                {item.title}
              </h3>
              <p className="text-xs text-muted leading-relaxed line-clamp-2">
                {item.description}
              </p>
              <div className="pt-2 flex items-center justify-between text-xs font-bold text-amber-600 group-hover:translate-x-1 transition-transform">
                <span>Recreate This Style</span>
                <span>→</span>
              </div>
            </div>

            <Link href={item.href} className="absolute inset-0 z-10" aria-label={item.title} />
          </div>
        ))}
      </div>
    </section>
  );
}
