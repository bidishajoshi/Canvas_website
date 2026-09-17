import Link from 'next/link';
import { formatPaisa } from '@/lib/utils';
import { MultiPanelCanvasPreview } from '@/components/common/MultiPanelCanvasPreview';
import type { Product } from '@/lib/types';

export function ProductCard({ product }: { product: Partial<Product> & { title?: string; primary_image_url?: string } }) {
  const hasDiscount =
    product.discount_price_paisa != null &&
    product.base_price_paisa != null &&
    product.discount_price_paisa < product.base_price_paisa;

  const title = product.name || product.title || 'Custom Decor Product';
  const imageUrl = product.main_image_url || product.primary_image_url || '/images/shiva-parvati-5panel.png';

  // Infer panel count from product info
  let panelCount = 1;
  const lowerName = title.toLowerCase();
  const lowerDim = (product.dimensions || '').toLowerCase();
  if (lowerName.includes('5-panel') || lowerName.includes('5 piece') || lowerDim.includes('5 panel')) {
    panelCount = 5;
  } else if (lowerName.includes('3-panel') || lowerName.includes('triptych') || lowerName.includes('3 piece')) {
    panelCount = 3;
  } else if (lowerName.includes('7-panel') || lowerName.includes('7 piece') || lowerName.includes('vastu')) {
    panelCount = 5; // default staggered 5-panel look for Vastu artwork
  }

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group block overflow-hidden rounded-2xl border border-border bg-surface shadow-sm hover:shadow-xl hover:border-amber-600/60 active:scale-[0.98] transition-all duration-200"
    >
      <div className="relative aspect-[4/3] sm:aspect-square w-full overflow-hidden bg-neutral-950">
        <MultiPanelCanvasPreview
          imageUrl={imageUrl}
          panelCount={panelCount}
          alt={title}
          isPreRendered={imageUrl.includes('shiva-parvati-5panel')}
        />

        {/* Badges */}
        <div className="absolute left-2.5 top-2.5 flex flex-col gap-1.5 z-10">
          {panelCount > 1 && (
            <span className="rounded-md bg-amber-600 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-md">
              {panelCount} Panel Split
            </span>
          )}
          {product.is_best_seller && (
            <span className="rounded-md bg-amber-500 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-sm">
              Best Seller
            </span>
          )}
          {product.is_new_arrival && (
            <span className="rounded-md bg-emerald-600 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-sm">
              New Arrival
            </span>
          )}
          {hasDiscount && (
            <span className="rounded-md bg-rose-600 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-sm">
              {Math.max(1, Math.round(((product.base_price_paisa! - product.discount_price_paisa!) / product.base_price_paisa!) * 100))}% OFF
            </span>
          )}
        </div>
      </div>

      <div className="p-4">
        {product.material && (
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted mb-1">
            {product.material}
          </p>
        )}
        <h3 className="line-clamp-1 text-sm sm:text-base font-semibold text-text group-hover:text-amber-600 transition-colors">
          {title}
        </h3>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-base font-bold text-amber-600">
            {formatPaisa(hasDiscount ? product.discount_price_paisa! : product.base_price_paisa || 149900)}
          </span>
          {hasDiscount && (
            <span className="text-xs text-muted line-through">
              {formatPaisa(product.base_price_paisa!)}
            </span>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-2.5">
          <span className="text-xs font-semibold text-amber-600 group-hover:underline transition-all flex items-center gap-1">
            <span>View 5-Panel Options</span>
            <span>→</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
