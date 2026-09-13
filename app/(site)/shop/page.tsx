import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { ProductCard } from '@/components/shop/ProductCard';
import { ShopFilters } from '@/components/shop/ShopFilters';
import type { Product, Category } from '@/lib/types';

export const metadata: Metadata = { title: 'Shop' };

interface ShopPageProps {
  searchParams: {
    category?: string;
    sort?: string;
    featured?: string;
  };
}

const SORT_OPTIONS: Record<string, { column: string; ascending: boolean }> = {
  newest: { column: 'created_at', ascending: false },
  price_low: { column: 'base_price_paisa', ascending: true },
  price_high: { column: 'base_price_paisa', ascending: false },
};

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const supabase = createClient();

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('status', 'published')
    .order('sort_order', { ascending: true });

  let query = supabase.from('products').select('*').eq('status', 'published');

  if (searchParams.category) {
    const category = (categories as Category[] | null)?.find(
      (c) => c.slug === searchParams.category
    );
    if (category) query = query.eq('category_id', category.id);
  }

  if (searchParams.featured === 'true') {
    query = query.eq('is_featured', true);
  }

  const sort = SORT_OPTIONS[searchParams.sort ?? 'newest'] ?? SORT_OPTIONS.newest;
  query = query.order(sort.column, { ascending: sort.ascending });

  const { data: products } = await query;

  return (
    <div className="container-page py-10">
      <h1 className="font-display text-3xl font-semibold">Shop</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[240px_1fr]">
        <ShopFilters
          categories={(categories as Category[]) ?? []}
          activeCategory={searchParams.category}
          activeSort={searchParams.sort}
        />

        <div>
          {products && products.length > 0 ? (
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 xl:grid-cols-4">
              {(products as Product[]).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted">
              No products found. Try a different category or check back soon.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
