'use me';
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatPaisa } from '@/lib/utils';
import { addToCart } from '@/lib/cart';
import { MultiPanelCanvasPreview } from '@/components/common/MultiPanelCanvasPreview';
import type { CanvasProduct } from '@/lib/types';

export function CanvasProductCard({ item }: { item: CanvasProduct }) {
  const [added, setAdded] = useState(false);

  const hasDiscount =
    item.discount_price_paisa != null &&
    item.discount_price_paisa < item.original_price_paisa;

  const currentPricePaisa = hasDiscount ? item.discount_price_paisa! : item.original_price_paisa;

  const discountPercent =
    item.discount_percentage ||
    (hasDiscount
      ? Math.round(
          ((item.original_price_paisa - item.discount_price_paisa!) /
            item.original_price_paisa) *
            100
        )
      : null);

  function handleQuickAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    addToCart({
      type: 'product',
      productId: item.id,
      name: item.name,
      imageUrl: item.main_image_url,
      sizeLabel: item.size_label,
      frameLabel: item.frame_label || 'Floating Frame',
      quantity: 1,
      unitPricePaisa: currentPricePaisa,
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-surface shadow-sm hover:shadow-xl hover:border-pink-500/40 transition-all duration-300">
      <Link href={`/product/${item.slug}`} className="block">
        {/* Main Artwork / Wall Mockup Image with MultiPanel Split View */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-950">
          <MultiPanelCanvasPreview
            imageUrl={item.main_image_url}
            panelCount={item.panel_count}
            alt={item.name}
            isPreRendered={item.main_image_url.includes('shiva-parvati-5panel')}
          />

          {/* Badges Overlay */}
          <div className="absolute left-3 top-3 flex flex-col gap-1.5 z-10">
            <span className="rounded-lg bg-pink-600 px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider text-white shadow-md">
              {item.panel_count} {item.panel_count === 1 ? 'Piece' : 'Pieces Staggered Split'}
            </span>

            {item.is_best_seller && (
              <span className="rounded-lg bg-amber-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
                ⭐ Best Seller
              </span>
            )}
          </div>

          {/* Discount Percentage Badge */}
          {discountPercent && discountPercent > 0 && (
            <div className="absolute right-3 top-3 z-10 rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-extrabold text-white shadow-md">
              {discountPercent}% OFF
            </div>
          )}
        </div>

        {/* Info Content */}
        <div className="p-4 space-y-2">
          <h3 className="line-clamp-1 text-sm sm:text-base font-bold text-text group-hover:text-pink-600 transition-colors">
            {item.name}
          </h3>

          <div className="flex flex-col gap-0.5 text-xs text-muted">
            <span className="font-mono text-text/80 font-medium">
              Size: {item.size_label}
            </span>
            {item.frame_label && (
              <span className="text-[11px]">Frame: {item.frame_label}</span>
            )}
          </div>

          {/* Pricing Row */}
          <div className="mt-3 flex items-baseline gap-2 pt-2 border-t border-border/50">
            <span className="text-base font-extrabold text-amber-600">
              {formatPaisa(currentPricePaisa)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-muted line-through">
                {formatPaisa(item.original_price_paisa)}
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Footer Add to Cart Button */}
      <div className="p-4 pt-0">
        <button
          type="button"
          onClick={handleQuickAddToCart}
          className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm ${
            added
              ? 'bg-emerald-600 text-white'
              : 'bg-amber-500 hover:bg-amber-600 text-white active:scale-95'
          }`}
        >
          {added ? (
            <>
              <span>✓</span> Added to Cart
            </>
          ) : (
            <>
              <span>🛒</span> Add Ready-Made Canvas
            </>
          )}
        </button>
      </div>
    </div>
  );
}
