'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CanvasProductCard } from '@/components/shop/CanvasProductCard';
import type { CanvasProduct, HomepageSection } from '@/lib/types';

const DEMO_READY_CANVASES: CanvasProduct[] = [
  {
    id: 'rp-1',
    name: '7 Running Horses Vastu Wall Canvas',
    slug: '7-running-horses-vastu-wall-canvas',
    description: 'Breathtaking 5-piece staggered Vastu horse canvas for positive energy in living room.',
    main_image_url: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&w=800&q=80',
    panel_count: 5,
    size_label: '60" × 32" Total (5 @ 12×32" max)',
    frame_label: 'Black Floating Frame',
    original_price_paisa: 690000, // Rs. 6900
    discount_price_paisa: 552000, // Rs. 5520 (20% OFF)
    discount_percentage: 20,
    is_best_seller: true,
    is_featured: true,
    is_new_arrival: false,
    show_on_homepage: true,
    status: 'published',
    sort_order: 1,
  },
  {
    id: 'rp-2',
    name: 'Himalayan Sunrise Mountain Triptych',
    slug: 'himalayan-sunrise-mountain-triptych',
    description: 'Serene 3-piece mountain peak panorama in warm morning light.',
    main_image_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    panel_count: 3,
    size_label: '48" × 24" Total (3 @ 16×24" each)',
    frame_label: 'Natural Wood Frame',
    original_price_paisa: 480000, // Rs. 4800
    discount_price_paisa: 399000, // Rs. 3990 (17% OFF)
    discount_percentage: 17,
    is_best_seller: true,
    is_featured: true,
    is_new_arrival: true,
    show_on_homepage: true,
    status: 'published',
    sort_order: 2,
  },
  {
    id: 'rp-3',
    name: 'Serene Temple Lotus Buddha Art',
    slug: 'serene-temple-lotus-buddha-art',
    description: 'Tranquil single focal canvas print for peaceful living rooms & prayer corners.',
    main_image_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    panel_count: 1,
    size_label: '24" × 36" Single Canvas',
    frame_label: 'Luxury Gold Frame',
    original_price_paisa: 450000, // Rs. 4500
    discount_price_paisa: 382500, // Rs. 3825 (15% OFF)
    discount_percentage: 15,
    is_best_seller: false,
    is_featured: true,
    is_new_arrival: true,
    show_on_homepage: true,
    status: 'published',
    sort_order: 3,
  },
  {
    id: 'rp-4',
    name: 'Golden Liquid Fluid Abstract Set',
    slug: 'golden-liquid-fluid-abstract-set',
    description: 'Expansive 7-piece panoramic statement art piece for luxury dining rooms & lobbies.',
    main_image_url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
    panel_count: 7,
    size_label: '84" × 36" Total (7 @ 12×36" each)',
    original_price_paisa: 1190000, // Rs. 11900
    discount_price_paisa: 892500, // Rs. 8925 (25% OFF)
    discount_percentage: 25,
    is_best_seller: true,
    is_featured: true,
    is_new_arrival: false,
    show_on_homepage: true,
    status: 'published',
    sort_order: 4,
  },
  {
    id: 'rp-5',
    name: 'Custom Normal Photo Canvas (12" × 18")',
    slug: 'custom-normal-photo-canvas-12x18',
    description: 'Personalized high-definition photo canvas print on premium cotton canvas.',
    main_image_url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80',
    panel_count: 1,
    size_label: '12" × 18" Single Canvas',
    frame_label: 'Unframed Canvas',
    original_price_paisa: 100000, // Rs. 1000
    discount_price_paisa: 95000, // Rs. 950 (5% OFF)
    discount_percentage: 5,
    is_best_seller: true,
    is_featured: true,
    is_new_arrival: true,
    show_on_homepage: true,
    status: 'published',
    sort_order: 5,
  },
];

export function CozyCanvasCollection({ section }: { section?: HomepageSection }) {
  const [activeFilter, setActiveFilter] = useState<number | 'all'>('all');

  const filtered =
    activeFilter === 'all'
      ? DEMO_READY_CANVASES
      : DEMO_READY_CANVASES.filter((item) => item.panel_count === activeFilter);

  return (
    <section className="container-page py-16 border-t border-border bg-surface-hover/20">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-pink-600 bg-pink-500/10 px-3 py-1 rounded-full border border-pink-500/20">
            🛋️ Pinterest-Style Cozy Décor
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-text mt-3 tracking-tight">
            {section?.title || 'Canvas for Your Space'}
          </h2>
          <p className="mt-2 text-muted text-sm sm:text-base max-w-2xl">
            {section?.subtitle ||
              'Transform your living rooms, bedrooms, and home offices with our ready-made multi-panel wall compositions.'}
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeFilter === 'all'
                ? 'bg-amber-500 text-white shadow-md'
                : 'bg-surface text-muted hover:text-text border border-border'
            }`}
          >
            All Canvases
          </button>
          {[1, 3, 5, 7].map((pc) => (
            <button
              key={pc}
              type="button"
              onClick={() => setActiveFilter(pc)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeFilter === pc
                  ? 'bg-pink-600 text-white shadow-md'
                  : 'bg-surface text-muted hover:text-text border border-border'
              }`}
            >
              {pc} {pc === 1 ? 'Piece' : 'Pieces'}
            </button>
          ))}
        </div>
      </div>

      {/* Product Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filtered.map((item) => (
          <CanvasProductCard key={item.id} item={item} />
        ))}
      </div>

      {/* CTA Footer */}
      <div className="mt-12 text-center">
        <Link
          href="/shop"
          className="inline-flex items-center justify-center px-6 py-3 rounded-2xl bg-surface border border-border hover:border-pink-500 text-text font-bold text-sm shadow-sm transition-all hover:-translate-y-0.5"
        >
          Explore All Cozy Canvas Sets →
        </Link>
      </div>
    </section>
  );
}
