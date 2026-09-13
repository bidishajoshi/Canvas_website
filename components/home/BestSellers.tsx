import { createClient } from '@/lib/supabase/server';
import { ProductCard } from '@/components/shop/ProductCard';
import type { HomepageSection, Product } from '@/lib/types';

export async function BestSellers({ section }: { section: HomepageSection }) {
  const supabase = createClient();
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('status', 'published')
    .eq('is_best_seller', true)
    .limit(8);

  if (!products || products.length === 0) return null;

  return (
    <section className="container-page py-14">
      {section.title && (
        <h2 className="font-display text-2xl font-semibold sm:text-3xl">
          {section.title}
        </h2>
      )}
      {section.subtitle && <p className="mt-2 text-muted">{section.subtitle}</p>}

      <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
        {(products as Product[]).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
