import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import type { HomepageSection, Category } from '@/lib/types';

const DEFAULT_CATEGORIES: Partial<Category>[] = [
  { id: 'cat-1', name: 'Canvas Prints', slug: 'canvas-prints', image_url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=600&q=80' },
  { id: 'cat-2', name: 'Multi-Panel Canvas', slug: 'multi-panel', image_url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80' },
  { id: 'cat-3', name: 'Personal Portraits', slug: 'personal-portraits', image_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80' },
  { id: 'cat-4', name: 'Customized T-Shirts', slug: 'custom-tshirts', image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80' },
  { id: 'cat-5', name: 'Wall Paintings', slug: 'wall-paintings', image_url: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&w=600&q=80' },
  { id: 'cat-6', name: 'Framed Artworks', slug: 'framed-art', image_url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80' },
];

export async function CategoryGrid({ section }: { section: HomepageSection }) {
  const supabase = createClient();
  const { data } = await supabase
    .from('categories')
    .select('*')
    .eq('status', 'published')
    .order('sort_order', { ascending: true })
    .limit(8);

  const categories = data && data.length > 0 ? (data as Category[]) : (DEFAULT_CATEGORIES as Category[]);

  return (
    <section className="container-page py-14">
      <h2 className="font-display text-2xl font-bold sm:text-3xl tracking-tight text-text">
        {section.title || 'Shop by Category'}
      </h2>
      <p className="mt-2 text-muted text-sm sm:text-base">
        {section.subtitle || 'Explore our high resolution canvas prints, multi-panels, custom portraits, and customized t-shirts.'}
      </p>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/shop?category=${category.slug}`}
            className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-surface shadow-sm transition-all hover:border-amber-600 hover:shadow-md"
          >
            {category.image_url && (
              <Image
                src={category.image_url}
                alt={category.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-3 flex items-end">
              <span className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                {category.name}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

