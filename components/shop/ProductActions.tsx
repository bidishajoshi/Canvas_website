'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { addToCart } from '@/lib/cart';
import { createClient } from '@/lib/supabase/client';
import { formatPaisa } from '@/lib/utils';
import type { Product } from '@/lib/types';

interface ProductActionsProps {
  product: Product;
  whatsappNumber: string | null;
}

export function ProductActions({ product, whatsappNumber }: ProductActionsProps) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);

  const unitPrice =
    product.discount_price_paisa != null && product.discount_price_paisa < product.base_price_paisa
      ? product.discount_price_paisa
      : product.base_price_paisa;

  function handleAddToCart() {
    addToCart({
      type: 'product',
      productId: product.id,
      name: product.name,
      imageUrl: product.main_image_url ?? undefined,
      quantity,
      unitPricePaisa: unitPrice,
    });
    setAdded(true);
  }

  function handleBuyNow() {
    handleAddToCart();
    router.push('/checkout');
  }

  async function handleWishlist() {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push(`/login?redirect=/product/${product.slug}`);
      return;
    }

    const { error } = await supabase
      .from('wishlist_items')
      .insert({ customer_id: user.id, product_id: product.id });

    if (!error) setWishlisted(true);
  }

  const whatsappHref = whatsappNumber
    ? `https://wa.me/${whatsappNumber.replace(/[^\d]/g, '')}?text=${encodeURIComponent(
        `Hello, I'm interested in "${product.name}" (${formatPaisa(unitPrice)}). Is it available?`
      )}`
    : null;

  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-sm">Quantity</span>
        <div className="flex items-center rounded-card border border-border">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="px-3 py-1 text-lg"
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className="w-8 text-center text-sm">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((q) => q + 1)}
            className="px-3 py-1 text-lg"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleAddToCart}
          className="rounded-card border border-border px-5 py-3 text-sm font-semibold hover:bg-surface"
        >
          Add to Cart
        </button>
        <button
          type="button"
          onClick={handleBuyNow}
          className="rounded-card bg-accent-yellow px-5 py-3 text-sm font-semibold text-[color:var(--color-accent-yellow-contrast)]"
        >
          Buy Now
        </button>
        <button
          type="button"
          onClick={handleWishlist}
          disabled={wishlisted}
          aria-label={wishlisted ? 'Saved to wishlist' : 'Add to wishlist'}
          className="rounded-card border border-border px-4 py-3 text-sm hover:bg-surface disabled:opacity-60"
        >
          {wishlisted ? '♥' : '♡'}
        </button>
      </div>

      {whatsappHref && (
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block rounded-card bg-[#25D366] px-5 py-3 text-sm font-semibold text-white"
        >
          Ask on WhatsApp
        </a>
      )}

      {added && <p className="text-xs text-accent-yellow">Added to your cart.</p>}
    </div>
  );
}
