import { createClient } from '@/lib/supabase/server';
import { ProductCard } from '@/components/shop/ProductCard';
import type { HomepageSection, Product } from '@/lib/types';

const DEFAULT_PRODUCTS: Partial<Product>[] = [
  {
    id: 'p1',
    name: 'Custom Photo Canvas Single Focal (12" × 18")',
    slug: 'custom-photo-canvas-single-focal-12x18',
    description: 'High-definition personalized single photo canvas printed on premium cotton canvas.',
    base_price_paisa: 100000,
    discount_price_paisa: 95000,
    main_image_url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80',
    status: 'published',
    is_featured: true,
    is_best_seller: true,
    material: '1 Panel Photo Canvas',
    sku: 'AD-CAN-PHOTO-01',
  },
  {
    id: 'p2',
    name: 'Pinterest Aesthetic Bedroom Photo Canvas (24" × 36")',
    slug: 'pinterest-aesthetic-bedroom-photo-canvas',
    description: 'Cozy Pinterest-inspired wall photo canvas split for warm living rooms & bedrooms.',
    base_price_paisa: 200000,
    discount_price_paisa: 190000,
    main_image_url: 'https://images.unsplash.com/photo-1582562124811-c09040d0a901?auto=format&fit=crop&w=800&q=80',
    status: 'published',
    is_featured: true,
    is_best_seller: true,
    material: 'Aesthetic Canvas Print',
    sku: 'AD-CAN-PIN-02',
  },
  {
    id: 'p3',
    name: '7 Running Horses Vastu 5-Panel Wall Canvas (60" × 32")',
    slug: '7-running-horses-vastu-5-panel-wall-canvas',
    description: 'Breathtaking 5-piece staggered Vastu horse canvas for positive energy & prosperity.',
    base_price_paisa: 300000,
    discount_price_paisa: 285000,
    main_image_url: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&w=800&q=80',
    status: 'published',
    is_featured: true,
    is_best_seller: true,
    material: '5 Pieces Split Canvas',
    sku: 'AD-CAN-7HORSES',
  },
  {
    id: 'p4',
    name: 'Everest Sunset Himalayan Triptych Canvas (48" × 24")',
    slug: 'everest-sunset-himalayan-triptych-canvas',
    description: 'Breathtaking 3-panel panoramic canvas of Mt. Everest bathed in golden sunset light.',
    base_price_paisa: 250000,
    discount_price_paisa: 237500,
    main_image_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    status: 'published',
    is_featured: true,
    is_best_seller: true,
    material: '3 Pieces Triptych',
    sku: 'AD-CAN-001',
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
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
            🔥 Customer Favorites
          </span>
          <h2 className="font-display text-2xl font-bold sm:text-3xl tracking-tight text-text mt-2">
            {section?.title || 'Best Selling Ready-Made Canvases'}
          </h2>
          <p className="mt-2 text-muted text-sm sm:text-base">
            {section?.subtitle || 'Customer favorite multi-panel wall canvas decor handcrafted in Nepal.'}
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
