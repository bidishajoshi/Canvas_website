'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  cartSubtotalPaisa,
  getCart,
  removeFromCart,
  updateCartQuantity,
  type CartItem,
} from '@/lib/cart';
import { formatPaisa } from '@/lib/utils';

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    function refresh() {
      setItems(getCart());
    }
    refresh();
    window.addEventListener('cart-updated', refresh);
    return () => window.removeEventListener('cart-updated', refresh);
  }, []);

  const subtotal = cartSubtotalPaisa(items);

  return (
    <div className="container-page py-10">
      <h1 className="font-display text-3xl font-semibold">Your Cart</h1>

      {items.length === 0 ? (
        <div className="mt-8 rounded-card border border-dashed border-border p-10 text-center text-sm text-muted">
          Your cart is empty.{' '}
          <Link href="/shop" className="font-medium text-accent-yellow underline">
            Continue shopping
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
          <ul className="space-y-4">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex gap-4 rounded-card border border-border p-4"
              >
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-card bg-surface">
                  {item.imageUrl && (
                    <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold">{item.name}</h3>
                  <p className="mt-1 text-xs text-muted">
                    {[item.sizeLabel, item.frameLabel, item.finishLabel]
                      .filter(Boolean)
                      .join(' • ')}
                  </p>
                  <div className="mt-2 flex items-center gap-3">
                    <div className="flex items-center rounded-card border border-border">
                      <button
                        type="button"
                        onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                        className="px-2 py-1"
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="w-6 text-center text-xs">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                        className="px-2 py-1"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.id)}
                      className="text-xs text-muted underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <div className="text-sm font-semibold">
                  {formatPaisa(item.unitPricePaisa * item.quantity)}
                </div>
              </li>
            ))}
          </ul>

          <div className="h-fit rounded-card border border-border p-5">
            <div className="flex justify-between text-sm">
              <span className="text-muted">Subtotal</span>
              <span className="font-semibold">{formatPaisa(subtotal)}</span>
            </div>
            <p className="mt-1 text-xs text-muted">
              Shipping is calculated at checkout.
            </p>
            <Link
              href="/checkout"
              className="mt-4 block rounded-card bg-accent-yellow px-4 py-3 text-center text-sm font-semibold text-[color:var(--color-accent-yellow-contrast)]"
            >
              Proceed to Checkout
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
