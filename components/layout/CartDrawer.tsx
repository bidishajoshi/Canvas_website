'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getCart, removeFromCart, updateCartQuantity, cartSubtotalPaisa, type CartItem } from '@/lib/cart';
import { formatPaisa } from '@/lib/utils';

export function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const syncCart = () => {
      setItems(getCart());
    };
    if (open) {
      syncCart();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    window.addEventListener('cart-updated', syncCart);
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('cart-updated', syncCart);
    };
  }, [open]);

  if (!open) return null;

  const subtotalPaisa = cartSubtotalPaisa(items);
  const isFreeDelivery = subtotalPaisa >= 200000;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-fadeIn"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-bg border-l border-border shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-5 border-b border-border flex items-center justify-between bg-surface">
            <div className="flex items-center gap-2">
              <span className="text-xl">🛒</span>
              <h2 className="font-display font-bold text-lg text-text">Your Shopping Cart</h2>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 text-xs font-bold">
                {items.reduce((acc, i) => acc + i.quantity, 0)} Items
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="h-8 w-8 rounded-full border border-border flex items-center justify-center text-muted hover:text-text hover:border-amber-600 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="py-16 text-center space-y-4">
                <div className="text-5xl">🛍️</div>
                <h3 className="font-bold text-base text-text">Your cart is currently empty</h3>
                <p className="text-xs text-muted max-w-xs mx-auto">
                  Browse our canvas wall art prints, multi-panel layouts, or customized t-shirts to add items.
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-block px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition-colors"
                >
                  Start Shopping Now →
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl border border-border bg-surface flex gap-3 shadow-sm hover:border-amber-600/30 transition-colors"
                >
                  {/* Item Image */}
                  <div className="relative h-20 w-20 shrink-0 rounded-xl bg-surface-hover overflow-hidden border border-border">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">
                        🖼️
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between text-xs">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-bold text-text line-clamp-1">{item.name}</h4>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          className="text-muted hover:text-rose-600 text-sm font-bold"
                          title="Remove item"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="text-[11px] text-muted space-y-0.5 mt-0.5">
                        {item.sizeLabel && <div>Size: {item.sizeLabel}</div>}
                        {item.frameLabel && <div>Frame: {item.frameLabel}</div>}
                        {item.colorLabel && <div>Color: {item.colorLabel}</div>}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-border/50">
                      <div className="flex items-center gap-1.5 border border-border rounded-lg bg-bg px-2 py-0.5">
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                          className="text-muted hover:text-text font-bold px-1"
                        >
                          -
                        </button>
                        <span className="font-bold text-text text-xs px-1">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                          className="text-muted hover:text-text font-bold px-1"
                        >
                          +
                        </button>
                      </div>

                      <span className="font-bold text-amber-600 text-sm">
                        {formatPaisa(item.unitPricePaisa * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Summary & Checkout */}
          {items.length > 0 && (
            <div className="p-5 border-t border-border bg-surface space-y-3">
              {/* Delivery Progress */}
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300">
                {isFreeDelivery ? (
                  <span className="font-bold">🎉 Congratulations! You qualify for FREE Kathmandu Delivery.</span>
                ) : (
                  <span>
                    Add <strong className="font-bold">{formatPaisa(200000 - subtotalPaisa)}</strong> more for FREE delivery in KTM!
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted font-semibold">Subtotal:</span>
                <span className="font-mono text-xl font-extrabold text-amber-600">
                  {formatPaisa(subtotalPaisa)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  href="/cart"
                  onClick={onClose}
                  className="w-full py-3 rounded-xl border border-border bg-bg hover:border-amber-600 text-text font-bold text-xs text-center transition-colors shadow-sm"
                >
                  View Full Cart
                </Link>

                <Link
                  href="/checkout"
                  onClick={onClose}
                  className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs text-center transition-colors shadow-md"
                >
                  Checkout Now 💳
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
