import Image from 'next/image';
import Link from 'next/link';
import { formatPaisa } from '@/lib/utils';
import type { Product } from '@/lib/types';

export function ProductCard({ product }: { product: Product }) {
  const hasDiscount =
    product.discount_price_paisa != null &&
    product.discount_price_paisa < product.base_price_paisa;

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group block overflow-hidden rounded-xl border border-border bg-surface card-hover transition-all"
    >
      <div className="relative aspect-[4/3] sm:aspect-square w-full overflow-hidden bg-surface-hover">
        {product.main_image_url ? (
          <Image
            src={product.main_image_url}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-108"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-3xl text-muted">
            🖼️
          </div>
        )}

        {/* Badges */}
        <div className="absolute left-2.5 top-2.5 flex flex-col gap-1.5 z-10">
          {product.is_best_seller && (
            <span className="rounded-md bg-amber-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
              Best Seller
            </span>
          )}
          {product.is_new_arrival && (
            <span className="rounded-md bg-emerald-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
              New Arrival
            </span>
          )}
          {hasDiscount && (
            <span className="rounded-md bg-rose-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
              Sale
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
          {product.name}
        </h3>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-base font-bold text-amber-600">
            {formatPaisa(hasDiscount ? product.discount_price_paisa! : product.base_price_paisa)}
          </span>
          {hasDiscount && (
            <span className="text-xs text-muted line-through">
              {formatPaisa(product.base_price_paisa)}
            </span>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-2.5">
          <span className="text-xs font-medium text-muted group-hover:text-text transition-colors">
            Configure Sizes &amp; Frames →
          </span>
        </div>
      </div>
    </Link>
  );
}
