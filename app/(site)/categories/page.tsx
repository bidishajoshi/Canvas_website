import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import { filterDeleted, getCategoriesStore } from '@/lib/adminStore';
import type { Category } from '@/lib/types';

export const revalidate = 300;

export const metadata = {
  title: 'Explore Categories - Affordable Decoration Nepal',
  description: 'Browse our collection of Canvas Prints, Multi-Panel Canvas Art, Personalised Wall Decor, and Customised T-Shirts.',
};

export default async function CategoriesPage() {
  const supabase = createClient();
  const { data } = await supabase.from('categories').select('*').eq('status', 'published').order('sort_order', { ascending: true });
  
  const rawCategories = (data && data.length > 0) ? (data as Category[]) : getCategoriesStore();
  const displayCategories = filterDeleted(rawCategories);

  return (
    <div className="container-page py-10 sm:py-16">
      {/* Header */}
      <div className="max-w-3xl mb-12">
        <span className="inline-block text-xs font-bold uppercase tracking-widest text-amber-600 mb-2">
          Collections &amp; Categories
        </span>
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-text mb-4">
          Explore Our Wall Decor &amp; Apparel Categories
        </h1>
        <p className="text-muted text-base sm:text-lg">
          From multi-panel 7-piece canvas wall statements to custom photo t-shirts, select a category below to start browsing.
        </p>
      </div>

      {/* Grid of Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {displayCategories.map((cat: Category) => (
          <Link
            key={cat.id}
            href={`/shop?category=${encodeURIComponent(cat.slug || cat.name)}`}
            className="group relative rounded-2xl border border-border bg-surface overflow-hidden shadow-sm hover:shadow-xl hover:border-amber-600 transition-all flex flex-col sm:flex-row"
          >
            {/* Category Image */}
            <div className="relative w-full sm:w-1/2 aspect-[4/3] sm:aspect-auto shrink-0 bg-neutral-900 overflow-hidden">
              {cat.image_url ? (
                <Image
                  src={cat.image_url}
                  alt={cat.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, 300px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl bg-amber-500/10 text-amber-600 font-bold">
                  🎨
                </div>
              )}
            </div>

            {/* Category Details */}
            <div className="p-6 flex flex-col justify-between flex-1">
              <div>
                <h2 className="font-display text-xl font-bold text-text group-hover:text-amber-600 transition-colors mb-2">
                  {cat.name}
                </h2>
                <p className="text-sm text-muted line-clamp-3 leading-relaxed">
                  {cat.description || 'Discover hand-crafted decorative products for home & office.'}
                </p>
              </div>

              <div className="mt-6 flex items-center gap-2 text-sm font-bold text-amber-600 group-hover:translate-x-1 transition-transform">
                <span>Browse Products</span>
                <span>→</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
