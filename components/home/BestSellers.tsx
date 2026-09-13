import { createClient } from '@/lib/supabase/server';
import { ProductCard } from '@/components/shop/ProductCard';
import type { HomepageSection, Product } from '@/lib/types';

const DEFAULT_PRODUCTS: Partial<Product>[] = [
  {
    id: 'p1',
    title: 'Everest Sunset Himalayan View Canvas',
    slug: 'everest-sunset-himalayan-view-canvas',
    description: 'Breathtaking panoramic canvas of Mt. Everest bathed in golden sunset light.',
    base_price_paisa: 189900,
    compare_at_price_paisa: 249900,
    primary_image_url: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80',
    status: 'published',
    is_featured: true,
    is_best_seller: true,
    sku: 'AD-CAN-001',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'p2',
    title: 'Kathmandu Durbar Square Vintage Heritage Art',
    slug: 'kathmandu-durbar-square-vintage-heritage-art',
    description: 'Classic artistic sketch print of ancient pagoda temples in Durbar Square.',
    base_price_paisa: 149900,
    compare_at_price_paisa: 199900,
    primary_image_url: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&w=800&q=80',
    status: 'published',
    is_featured: true,
    is_best_seller: true,
    sku: 'AD-CAN-002',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'p3',
    title: 'Phewatal Pokhara Reflection 3-Panel Split Canvas',
    slug: 'phewatal-pokhara-reflection-3-panel-split-canvas',
    description: 'Stunning 3-panel split wall art featuring colorful boats on Fewa Lake with Machhapuchhre.',
    base_price_paisa: 349900,
    compare_at_price_paisa: 429900,
    primary_image_url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80',
    status: 'published',
    is_featured: true,
    is_best_seller: true,
    sku: 'AD-CAN-003',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'p4',
    title: 'Custom Heavyweight Streetwear T-Shirt',
    slug: 'custom-heavyweight-streetwear-t-shirt',
    description: '240 GSM combed cotton tee with custom print of your design or graphic art.',
    base_price_paisa: 89900,
    compare_at_price_paisa: 119900,
    primary_image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
    status: 'published',
    is_featured: true,
    is_best_seller: true,
    sku: 'AD-TSH-001',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export async function BestSellers({ section }: { section: HomepageSection }) {
  const supabase = createClient();
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('status', 'published')
    .eq('is_best_seller', true)
    .limit(8);

  const products = data && data.length > 0 ? (data as Product[]) : (DEFAULT_PRODUCTS as Product[]);

  return (
    <section className="container-page py-14 border-t border-border">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="font-display text-2xl font-bold sm:text-3xl tracking-tight text-text">
            {section.title || 'Best Selling Canvases & Wall Decor'}
          </h2>
          <p className="mt-2 text-muted text-sm sm:text-base">
            {section.subtitle || 'Customer favorite wall decor and personalized products handcrafted in Nepal.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

