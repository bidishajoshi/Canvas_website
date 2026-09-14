import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';

export const metadata = {
  title: 'Explore Categories - Affordable Decoration Nepal',
  description: 'Browse our collection of Canvas Prints, Multi-Panel Canvas Art, Personalised Wall Decor, and Customised T-Shirts.',
};

interface CategoryItem {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  image_url?: string;
}

export default async function CategoriesPage() {
  const supabase = createClient();
  const { data } = await supabase.from('categories').select('*');
  const dbCategories: CategoryItem[] = (data as CategoryItem[]) || [];

  // Curated categories if DB list is empty
  const displayCategories: CategoryItem[] = dbCategories.length > 0 ? dbCategories : [
    {
      id: 'cat-1',
      name: 'Single Canvas Prints',
      slug: 'single-canvas-prints',
      description: 'High-resolution premium canvas art wrapped over durable pine wood stretchers.',
      image_url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'cat-2',
      name: 'Multi-Panel Canvas Splits',
      slug: 'multi-panel-canvas-splits',
      description: 'Dramatic 3, 5, or 7 panel wall statements continuous across staggered heights.',
      image_url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'cat-3',
      name: 'Personalized Photo Canvas',
      slug: 'personalized-photo-canvas',
      description: 'Turn your family photos, wedding moments, and travel memories into canvas gallery walls.',
      image_url: 'https://images.unsplash.com/photo-1582562124811-c09040d0a901?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'cat-4',
      name: 'Customized T-Shirts',
      slug: 'customized-t-shirts',
      description: 'Premium cotton t-shirts customized with photo prints, typography, and graphic logos.',
      image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
    },
  ];

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
        {displayCategories.map((cat: CategoryItem) => (
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
