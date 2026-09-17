import { createClient } from '@/lib/supabase/server';
import { ProductCard } from '@/components/shop/ProductCard';
import type { HomepageSection, Product } from '@/lib/types';
import { filterDeleted, getProductsStore } from '@/lib/adminStore';

export async function BestSellers({ section }: { section: HomepageSection }) {
  const supabase = createClient();
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('status', 'published')
    .eq('is_best_seller', true)
    .limit(8);

  const rawProducts = data && data.length > 0 ? (data as Product[]) : getProductsStore();
  const products = filterDeleted(rawProducts).filter((p) => p.is_best_seller || p.is_featured);

  return (
    <section className="container-page py-14 border-t border-border">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
            🔥 Customer Favorites
          </span>
          <h2 className="font-display text-2xl font-bold sm:text-3xl tracking-tight text-text mt-2">
            {section?.title || 'Best Selling Ready-Made Canvases'}
          </h2>
          <p className="mt-2 text-muted text-sm sm:text-base">
            {section?.subtitle ||
              'Most loved canvas prints and wall split art ordered across Kathmandu & Nepal.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
