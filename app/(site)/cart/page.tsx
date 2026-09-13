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
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    discountPaisa: number;
    message: string;
  } | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    function refresh() {
      setItems(getCart());
    }
    refresh();
    window.addEventListener('cart-updated', refresh);
    return () => window.removeEventListener('cart-updated', refresh);
  }, []);

  const subtotalPaisa = cartSubtotalPaisa(items);
  const discountPaisa = appliedPromo?.discountPaisa || 0;
  const deliveryFeePaisa = subtotalPaisa >= 200000 ? 0 : 15000; // Free over Rs. 2,000
  const finalTotalPaisa = Math.max(0, subtotalPaisa - discountPaisa + deliveryFeePaisa);

  async function handleApplyPromo(e: React.FormEvent) {
    e.preventDefault();
    if (!promoCode.trim()) return;

    setApplying(true);
    setPromoError(null);

    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: promoCode,
          subtotalPaisa,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.valid) {
        setPromoError(data.error || 'Invalid promo code.');
        setAppliedPromo(null);
      } else {
        setAppliedPromo({
          code: data.code,
          discountPaisa: data.discountPaisa,
          message: data.message,
        });
        sessionStorage.setItem(
          'applied_promo',
          JSON.stringify({
            code: data.code,
            discountPaisa: data.discountPaisa,
          })
        );
      }
    } catch (err) {
      setPromoError('Failed to apply promo code.');
    } finally {
      setApplying(false);
    }
  }

  function handleRemovePromo() {
    setAppliedPromo(null);
    setPromoCode('');
    setPromoError(null);
    sessionStorage.removeItem('applied_promo');
  }

  return (
    <div className="container-page py-10">
      <div className="flex items-center justify-between border-b border-border pb-4 mb-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
            🛒 Shopping Cart
          </span>
          <h1 className="font-display text-3xl font-extrabold text-text mt-2">Your Cart</h1>
        </div>
        <Link href="/shop" className="text-xs font-bold text-amber-600 hover:underline">
          ← Continue Shopping
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center bg-surface/50 space-y-4">
          <span className="text-4xl block">🛍️</span>
          <p className="text-base font-bold text-text">Your shopping cart is currently empty.</p>
          <p className="text-xs text-muted">Browse our ready-made canvas collection or design custom wall art.</p>
          <div className="flex justify-center gap-3 pt-2">
            <Link href="/shop" className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md">
              Browse Canvas Shop
            </Link>
            <Link href="/custom-canvas" className="px-5 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs shadow-md">
              Create Custom Canvas
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          {/* Cart Item List */}
          <ul className="space-y-4">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-2xl border border-border p-4 bg-surface shadow-sm"
              >
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-surface-hover">
                  {item.imageUrl && (
                    <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                  )}
                </div>

                <div className="flex-1 space-y-1">
                  <h3 className="text-sm font-bold text-text">{item.name}</h3>
                  <p className="text-xs text-muted font-medium">
                    {[item.sizeLabel, item.frameLabel, item.finishLabel, item.colorLabel]
                      .filter(Boolean)
                      .join(' • ')}
                  </p>

                  <div className="mt-2 flex items-center gap-4 pt-1">
                    <div className="flex items-center rounded-lg border border-border bg-bg text-xs font-bold">
                      <button
                        type="button"
                        onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                        className="px-3 py-1 text-muted hover:text-text"
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="w-8 text-center font-mono">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                        className="px-3 py-1 text-muted hover:text-text"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFromCart(item.id)}
                      className="text-xs text-red-600 hover:underline font-semibold"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                <div className="text-base font-extrabold text-amber-600 sm:text-right">
                  {formatPaisa(item.unitPricePaisa * item.quantity)}
                </div>
              </li>
            ))}
          </ul>

          {/* Cart Summary & Promo Box */}
          <div className="space-y-6">
            {/* Promo Code Form */}
            <div className="rounded-2xl border border-border p-5 bg-surface shadow-sm space-y-3">
              <label className="text-xs font-bold text-text flex items-center gap-1.5">
                <span>🎟️</span> Have a Promo Code?
              </label>

              {appliedPromo ? (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold text-emerald-700 dark:text-emerald-300">
                    <span>Code: {appliedPromo.code}</span>
                    <button
                      type="button"
                      onClick={handleRemovePromo}
                      className="text-red-600 hover:underline text-[11px]"
                    >
                      Remove
                    </button>
                  </div>
                  <p className="text-[11px] text-emerald-600">{appliedPromo.message}</p>
                </div>
              ) : (
                <form onSubmit={handleApplyPromo} className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="e.g. FESTIVE20"
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-border bg-bg uppercase font-mono font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <button
                    type="submit"
                    disabled={applying || !promoCode.trim()}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs disabled:opacity-50 transition-all shadow-sm"
                  >
                    {applying ? 'Applying...' : 'Apply'}
                  </button>
                </form>
              )}

              {promoError && (
                <p className="text-xs text-red-600 font-semibold">{promoError}</p>
              )}
            </div>

            {/* Order Totals */}
            <div className="rounded-2xl border border-border p-5 bg-surface shadow-sm space-y-3 text-xs">
              <h3 className="font-bold text-sm text-text border-b border-border pb-2">Order Summary</h3>

              <div className="flex justify-between">
                <span className="text-muted">Subtotal:</span>
                <span className="font-semibold text-text">{formatPaisa(subtotalPaisa)}</span>
              </div>

              {discountPaisa > 0 && (
                <div className="flex justify-between font-bold text-emerald-600">
                  <span>Promo Discount ({appliedPromo?.code}):</span>
                  <span>−{formatPaisa(discountPaisa)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-muted">Delivery Fee:</span>
                <span className="font-semibold text-text">
                  {deliveryFeePaisa === 0 ? (
                    <span className="text-emerald-600 font-bold">FREE (Kathmandu Valley)</span>
                  ) : (
                    formatPaisa(deliveryFeePaisa)
                  )}
                </span>
              </div>

              <div className="flex justify-between items-center border-t border-border pt-3 text-sm">
                <span className="font-bold text-text">Final Total:</span>
                <span className="font-extrabold text-xl text-amber-600">{formatPaisa(finalTotalPaisa)}</span>
              </div>

              <Link
                href="/checkout"
                className="mt-4 block w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-center font-extrabold text-sm shadow-md transition-all hover:scale-[1.01]"
              >
                Proceed to Checkout →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
