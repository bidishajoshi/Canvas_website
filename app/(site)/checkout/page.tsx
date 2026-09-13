'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { cartSubtotalPaisa, clearCart, getCart, type CartItem } from '@/lib/cart';
import { formatPaisa } from '@/lib/utils';

interface PaymentMethod {
  id: string;
  name: string;
  code: string;
  instructions: string | null;
}
interface ShippingRule {
  id: string;
  zone_name: string;
  charge_paisa: number;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [shippingRules, setShippingRules] = useState<ShippingRule[]>([]);
  const [paymentMethodId, setPaymentMethodId] = useState('cod');
  const [shippingRuleId, setShippingRuleId] = useState('');
  const [bankTxnRef, setBankTxnRef] = useState('');

  // Promo Code States
  const [couponCode, setCouponCode] = useState('');
  const [discountPaisa, setDiscountPaisa] = useState(0);
  const [appliedPromoMsg, setAppliedPromoMsg] = useState<string | null>(null);
  const [applyingPromo, setApplyingPromo] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [user, setUser] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [address, setAddress] = useState({
    full_name: '',
    phone: '',
    email: '',
    province: '',
    district: '',
    municipality: '',
    ward: '',
    tole_area: '',
    address_line: '',
    landmark: '',
    delivery_notes: '',
  });

  useEffect(() => {
    const cartItems = getCart();
    setItems(cartItems);

    // Read stored promo from cart page if present
    const stored = sessionStorage.getItem('applied_promo');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setCouponCode(parsed.code);
        setDiscountPaisa(parsed.discountPaisa);
        setAppliedPromoMsg(`✓ Code ${parsed.code} applied!`);
      } catch (e) {
        // ignore
      }
    }

    const supabase = createClient();

    // Check user authentication
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user) {
        setAddress((prev) => ({
          ...prev,
          email: data.user?.email || prev.email,
          full_name: data.user?.user_metadata?.full_name || prev.full_name,
        }));
      }
      setCheckingAuth(false);
    });

    const defaultPayments: PaymentMethod[] = [
      {
        id: 'cod',
        name: 'Cash on Delivery (COD)',
        code: 'cod',
        instructions: 'Pay cash when your order is delivered to your address in Nepal.',
      },
      {
        id: 'esewa',
        name: 'eSewa Mobile Wallet (Online Pay / QR)',
        code: 'esewa',
        instructions: 'Scan eSewa QR or send to eSewa ID: 9800000000 (Affordable Decoration Nepal).',
      },
      {
        id: 'bank_transfer',
        name: 'Direct Bank Transfer (NABIL / NIC Asia)',
        code: 'bank_transfer',
        instructions: 'NABIL Bank A/C: 0101017500001 (Affordable Decoration Pvt Ltd). Enter transaction reference below.',
      },
    ];

    supabase
      .from('payment_methods')
      .select('id, name, code, instructions')
      .eq('active', true)
      .order('sort_order', { ascending: true })
      .then(({ data }) => {
        if (data && data.length > 0) {
          setPaymentMethods(data);
          setPaymentMethodId(data[0].id);
        } else {
          setPaymentMethods(defaultPayments);
          setPaymentMethodId('cod');
        }
      });

    const defaultShipping: ShippingRule[] = [
      { id: 'ktm', zone_name: 'Kathmandu / Lalitpur / Bhaktapur (Free over Rs. 2,000)', charge_paisa: 0 },
      { id: 'out', zone_name: 'Outside Valley Delivery (Rs. 150)', charge_paisa: 15000 },
    ];

    supabase
      .from('shipping_rules')
      .select('id, zone_name, charge_paisa')
      .eq('active', true)
      .then(({ data }) => {
        if (data && data.length > 0) {
          setShippingRules(data);
          setShippingRuleId(data[0].id);
        } else {
          setShippingRules(defaultShipping);
          setShippingRuleId('ktm');
        }
      });
  }, []);

  const subtotalPaisa = cartSubtotalPaisa(items);
  const shippingChargePaisa = shippingRules.find((r) => r.id === shippingRuleId)?.charge_paisa ?? 0;
  const estimatedTotalPaisa = Math.max(0, subtotalPaisa - discountPaisa + shippingChargePaisa);

  async function handleApplyPromoCode(e: React.FormEvent) {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setApplyingPromo(true);
    setPromoError(null);

    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCode,
          subtotalPaisa,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.valid) {
        setPromoError(data.error || 'Invalid promo code.');
        setDiscountPaisa(0);
        setAppliedPromoMsg(null);
      } else {
        setDiscountPaisa(data.discountPaisa);
        setAppliedPromoMsg(data.message);
        sessionStorage.setItem(
          'applied_promo',
          JSON.stringify({
            code: data.code,
            discountPaisa: data.discountPaisa,
          })
        );
      }
    } catch (err) {
      setPromoError('Could not validate promo code.');
    } finally {
      setApplyingPromo(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (items.length === 0) {
      setError('Your cart is empty.');
      return;
    }

    if (!user) {
      setError('Please log in or create an account to place your order.');
      router.push('/login?redirect=/checkout');
      return;
    }

    if (paymentMethodId === 'bank_transfer' && !bankTxnRef.trim()) {
      setError('Please enter your Bank / eSewa transaction reference ID.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          guestName: address.full_name,
          guestPhone: address.phone,
          guestEmail: address.email || null,
          shippingAddress: {
            ...address,
            bank_transaction_ref: bankTxnRef || null,
          },
          paymentMethodId,
          shippingRuleId,
          couponCode: couponCode || null,
          discountPaisa,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? 'Could not place your order. Please try again.');
        return;
      }

      const data = await res.json();
      clearCart();
      sessionStorage.removeItem('applied_promo');
      router.push(`/track-order?orderNumber=${data.orderNumber}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container-page py-10">
      <div className="flex flex-col gap-2 mb-8">
        <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 w-fit">
          💳 Secure Checkout
        </span>
        <h1 className="font-display text-3xl font-extrabold text-text">Checkout &amp; Order Placement</h1>
        <p className="text-xs text-muted">
          Complete your delivery address and choose your payment method (eSewa, Bank Transfer, or COD).
        </p>
      </div>

      {/* User Auth Banner Notice */}
      {!user && !checkingAuth && (
        <div className="mb-8 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 text-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="space-y-1">
            <p className="font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
              <span>🔒</span> Sign In Required to Confirm Order
            </p>
            <p className="text-xs text-muted">
              Please sign into your account so we can track your order status and send delivery updates.
            </p>
          </div>
          <Link
            href="/login?redirect=/checkout"
            className="shrink-0 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-colors shadow-md"
          >
            Log In / Register Now →
          </Link>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-8">
          {/* 1. Address Form */}
          <fieldset className="grid gap-4 sm:grid-cols-2 rounded-2xl border border-border p-6 bg-surface shadow-sm">
            <legend className="mb-3 text-base font-bold text-text flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-600 text-white text-xs font-bold">1</span>
              Delivery Address (Nepal)
            </legend>
            <TextField label="Full Name *" value={address.full_name} onChange={(v) => setAddress((a) => ({ ...a, full_name: v }))} required />
            <TextField label="Phone Number (NTC/Ncell) *" value={address.phone} onChange={(v) => setAddress((a) => ({ ...a, phone: v }))} required type="tel" />
            <TextField label="Email Address" value={address.email} onChange={(v) => setAddress((a) => ({ ...a, email: v }))} type="email" />
            <TextField label="Province (e.g. Bagmati)" value={address.province} onChange={(v) => setAddress((a) => ({ ...a, province: v }))} />
            <TextField label="District (e.g. Kathmandu)" value={address.district} onChange={(v) => setAddress((a) => ({ ...a, district: v }))} />
            <TextField label="Municipality / Local Area" value={address.municipality} onChange={(v) => setAddress((a) => ({ ...a, municipality: v }))} />
            <TextField label="Ward No." value={address.ward} onChange={(v) => setAddress((a) => ({ ...a, ward: v }))} />
            <TextField label="Tole / Area Name" value={address.tole_area} onChange={(v) => setAddress((a) => ({ ...a, tole_area: v }))} />
            <TextField label="Street Address" value={address.address_line} onChange={(v) => setAddress((a) => ({ ...a, address_line: v }))} className="sm:col-span-2" />
            <TextField label="Nearby Landmark" value={address.landmark} onChange={(v) => setAddress((a) => ({ ...a, landmark: v }))} className="sm:col-span-2" />
          </fieldset>

          {/* 2. Shipping Zone */}
          <fieldset className="rounded-2xl border border-border p-6 bg-surface shadow-sm space-y-3">
            <legend className="mb-3 text-base font-bold text-text flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-600 text-white text-xs font-bold">2</span>
              Shipping &amp; Delivery Zone
            </legend>
            <div className="space-y-2.5">
              {shippingRules.map((rule) => (
                <label key={rule.id} className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-bg hover:border-amber-600 cursor-pointer text-xs font-semibold">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="shipping"
                      checked={shippingRuleId === rule.id}
                      onChange={() => setShippingRuleId(rule.id)}
                      className="accent-amber-600"
                    />
                    <span>{rule.zone_name}</span>
                  </div>
                  <span className="font-extrabold text-amber-600">
                    {rule.charge_paisa === 0 ? 'FREE' : formatPaisa(rule.charge_paisa)}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          {/* 3. Integrated Payment Options (eSewa & Bank Transfer) */}
          <fieldset className="rounded-2xl border border-border p-6 bg-surface shadow-sm space-y-4">
            <legend className="mb-3 text-base font-bold text-text flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-600 text-white text-xs font-bold">3</span>
              Payment Method (eSewa, Bank Transfer, COD)
            </legend>

            <div className="space-y-3">
              {paymentMethods.map((method) => {
                const isSelected = paymentMethodId === method.id;
                return (
                  <label
                    key={method.id}
                    className={`flex flex-col p-4 rounded-xl border transition-all cursor-pointer text-xs ${
                      isSelected
                        ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-500/5 font-semibold'
                        : 'border-border bg-bg hover:border-text/30'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="payment"
                        checked={isSelected}
                        onChange={() => setPaymentMethodId(method.id)}
                        className="accent-amber-600"
                      />
                      <span className="font-bold text-sm text-text">{method.name}</span>
                    </div>

                    {method.instructions && (
                      <p className="text-xs text-muted ml-6 mt-1.5 leading-relaxed">
                        {method.instructions}
                      </p>
                    )}
                  </label>
                );
              })}
            </div>

            {/* If Bank Transfer / eSewa is selected, prompt transaction ref */}
            {(paymentMethodId === 'bank_transfer' || paymentMethodId === 'esewa') && (
              <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 space-y-2 mt-4 text-xs">
                <label className="font-bold text-amber-800 dark:text-amber-300 block">
                  Transaction Reference / Bank Ref ID *
                </label>
                <p className="text-[11px] text-muted">
                  After completing your eSewa / Bank transfer, enter your transaction ID or reference number below:
                </p>
                <input
                  type="text"
                  value={bankTxnRef}
                  onChange={(e) => setBankTxnRef(e.target.value)}
                  placeholder="e.g. eSewa Txn #92847291 or NABIL Ref #00123"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-bg uppercase font-mono font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            )}
          </fieldset>

          {/* Promo Code Input on Checkout */}
          <div className="rounded-2xl border border-border p-6 bg-surface shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-text flex items-center gap-1.5">
              <span>🎟️</span> Promo Code
            </h3>
            {appliedPromoMsg ? (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                {appliedPromoMsg}
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Enter code"
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-border bg-bg uppercase font-mono font-bold"
                />
                <button
                  type="button"
                  onClick={handleApplyPromoCode}
                  disabled={applyingPromo || !couponCode.trim()}
                  className="px-4 py-2 rounded-xl bg-amber-500 text-white font-bold text-xs hover:bg-amber-600 disabled:opacity-50"
                >
                  {applyingPromo ? 'Validating...' : 'Apply Code'}
                </button>
              </div>
            )}
            {promoError && <p className="text-xs text-red-600 font-semibold">{promoError}</p>}
          </div>
        </div>

        {/* Order Summary sidebar */}
        <div className="h-fit space-y-4 rounded-2xl border border-border p-6 bg-surface shadow-sm sticky top-24">
          <h3 className="text-base font-bold text-text border-b border-border pb-3">Final Order Summary</h3>

          <div className="space-y-3">
            {items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-start text-xs border-b border-border/50 pb-2">
                <div>
                  <p className="font-bold text-text line-clamp-1">{item.name}</p>
                  <p className="text-muted text-[11px]">{item.sizeLabel || 'Standard'} × {item.quantity}</p>
                </div>
                <span className="font-extrabold text-amber-600">{formatPaisa(item.unitPricePaisa * item.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="pt-2 space-y-2 text-xs">
            <div className="flex justify-between text-muted">
              <span>Subtotal:</span>
              <span className="font-semibold text-text">{formatPaisa(subtotalPaisa)}</span>
            </div>

            {discountPaisa > 0 && (
              <div className="flex justify-between font-bold text-emerald-600">
                <span>Promo Discount:</span>
                <span>−{formatPaisa(discountPaisa)}</span>
              </div>
            )}

            <div className="flex justify-between text-muted">
              <span>Shipping Fee:</span>
              <span className="font-semibold text-text">
                {shippingChargePaisa === 0 ? (
                  <span className="text-emerald-600 font-bold">FREE</span>
                ) : (
                  formatPaisa(shippingChargePaisa)
                )}
              </span>
            </div>

            <div className="flex justify-between items-center border-t border-border pt-3 text-base font-bold text-text">
              <span>Total Amount:</span>
              <span className="text-amber-600 font-extrabold text-xl">{formatPaisa(estimatedTotalPaisa)}</span>
            </div>
          </div>

          {error && <p className="text-xs text-red-600 font-semibold p-2.5 rounded-xl bg-red-500/10 border border-red-500/20">{error}</p>}

          {user ? (
            <button
              type="submit"
              disabled={submitting || items.length === 0}
              className="w-full rounded-xl bg-amber-500 hover:bg-amber-600 py-4 text-sm font-extrabold text-white transition-all disabled:opacity-50 shadow-md hover:scale-[1.01]"
            >
              {submitting ? 'Confirming Order…' : 'Confirm & Place Order →'}
            </button>
          ) : (
            <Link
              href="/login?redirect=/checkout"
              className="block w-full text-center rounded-xl bg-amber-500 hover:bg-amber-600 py-4 text-sm font-extrabold text-white transition-all shadow-md"
            >
              Log In to Complete Order
            </Link>
          )}
        </div>
      </form>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  required,
  type = 'text',
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  type?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="text-xs font-semibold text-muted mb-1 block">{label}</label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-border bg-bg px-3.5 py-2.5 text-sm text-text outline-none focus:ring-2 focus:ring-amber-500 transition-all"
      />
    </div>
  );
}
