import { createClient } from '@/lib/supabase/server';
import { ProductCard } from '@/components/shop/ProductCard';
import type { HomepageSection, Product } from '@/lib/types';

const DEFAULT_PRODUCTS: Partial<Product>[] = [
  {
    id: 'p1',
    name: '7 Running Horses Vastu 5-Panel Wall Canvas',
    slug: '7-running-horses-vastu-5-panel-wall-canvas',
    description: 'Breathtaking 5-piece staggered Vastu horse canvas for positive energy & prosperity.',
    base_price_paisa: 690000,
    discount_price_paisa: 552000,
    main_image_url: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&w=800&q=80',
    status: 'published',
    is_featured: true,
    is_best_seller: true,
    material: '5 Pieces Split Canvas',
    sku: 'AD-CAN-7HORSES',
  },
  {
    id: 'p2',
    name: 'Everest Sunset Himalayan View Triptych Canvas',
    slug: 'everest-sunset-himalayan-view-triptych-canvas',
    description: 'Breathtaking 3-panel panoramic canvas of Mt. Everest bathed in golden sunset light.',
    base_price_paisa: 480000,
    discount_price_paisa: 399000,
    main_image_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    status: 'published',
    is_featured: true,
    is_best_seller: true,
    material: '3 Pieces Triptych',
    sku: 'AD-CAN-001',
  },
  {
    id: 'p3',
    name: 'Serene Temple Lotus Buddha Single Focal Canvas',
    slug: 'serene-temple-lotus-buddha-single-focal-canvas',
    description: 'Tranquil single focal canvas print for peaceful living rooms & prayer corners.',
    base_price_paisa: 450000,
    discount_price_paisa: 382500,
    main_image_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    status: 'published',
    is_featured: true,
    is_best_seller: true,
    material: 'Single Panel Canvas',
    sku: 'AD-CAN-002',
  },
  {
    id: 'p4',
    name: 'Golden Liquid Fluid Abstract 7-Panel Canvas',
    slug: 'golden-liquid-fluid-abstract-7-panel-canvas',
    description: 'Expansive 7-piece panoramic statement art piece for luxury dining rooms & lobbies.',
    base_price_paisa: 1190000,
    discount_price_paisa: 892500,
    main_image_url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
    status: 'published',
    is_featured: true,
    is_best_seller: true,
    material: '7 Pieces Panoramic',
    sku: 'AD-CAN-004',
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
