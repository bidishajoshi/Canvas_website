import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { ProductCard } from '@/components/shop/ProductCard';
import type { Product } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Search Products | Affordable Decoration',
  description: 'Search canvas prints, wall paintings, multi-panel splits, and custom t-shirts.',
};

const DEMO_SEARCH_RESULTS: Partial<Product>[] = [
  {
    id: 'p1',
    name: 'Everest Sunset Himalayan View Canvas',
    slug: 'everest-sunset-himalayan-view-canvas',
    description: 'Breathtaking panoramic canvas of Mt. Everest bathed in golden sunset light.',
    base_price_paisa: 189900,
    discount_price_paisa: 249900,
    main_image_url: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80',
    status: 'published',
    is_featured: true,
    is_best_seller: true,
    sku: 'AD-CAN-001',
  },
  {
    id: 'p2',
    name: 'Kathmandu Durbar Square Vintage Heritage Art',
    slug: 'kathmandu-durbar-square-vintage-heritage-art',
    description: 'Classic artistic sketch print of ancient pagoda temples in Durbar Square.',
    base_price_paisa: 149900,
    discount_price_paisa: 199900,
    main_image_url: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&w=800&q=80',
    status: 'published',
    is_featured: true,
    is_best_seller: true,
    sku: 'AD-CAN-002',
  },
  {
    id: 'p3',
    name: 'Phewatal Pokhara Reflection 3-Panel Split Canvas',
    slug: 'phewatal-pokhara-reflection-3-panel-split-canvas',
    description: 'Stunning 3-panel split wall art featuring colorful boats on Fewa Lake with Machhapuchhre.',
    base_price_paisa: 349900,
    discount_price_paisa: 429900,
    main_image_url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80',
    status: 'published',
    is_featured: true,
    is_best_seller: true,
    sku: 'AD-CAN-003',
  },
  {
    id: 'p4',
    name: 'Custom Heavyweight Streetwear T-Shirt',
    slug: 'custom-heavyweight-streetwear-t-shirt',
    description: '240 GSM combed cotton tee with custom print of your design or graphic art.',
    base_price_paisa: 89900,
    discount_price_paisa: 119900,
    main_image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
    status: 'published',
    is_featured: true,
    is_best_seller: true,
    sku: 'AD-TSH-001',
  },
];

interface SearchPageProps {
  searchParams: { q?: string };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q || '';
  const supabase = createClient();

  let products: Product[] = [];

  if (query.trim()) {
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('status', 'published')
      .ilike('title', `%${query}%`);
    if (data && data.length > 0) {
      products = data as Product[];
    }
  }

  const displayProducts = products.length > 0 ? products : (DEMO_SEARCH_RESULTS as Product[]);

  return (
    <div className="container-page py-10 space-y-8">
      <div className="text-center max-w-xl mx-auto space-y-3">
        <h1 className="font-display text-3xl font-bold tracking-tight text-text">
          Search Products
        </h1>
        <p className="text-xs text-muted">
          Find custom photo canvases, wall paintings, multi-panel sets, and customized t-shirts.
        </p>

        {/* Search input form */}
        <form action="/search" method="GET" className="mt-4 flex gap-2">
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search Everest canvas, 3-panel split, t-shirt..."
            className="flex-1 rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text outline-none focus:border-amber-600 shadow-sm"
          />
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-colors shadow-sm"
          >
            Search 🔍
          </button>
        </form>
      </div>

      {query && (
        <div className="text-xs font-semibold text-muted">
          Showing results for &ldquo;<span className="text-text font-bold">{query}</span>&rdquo;:
        </div>
      )}

      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
        {displayProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
