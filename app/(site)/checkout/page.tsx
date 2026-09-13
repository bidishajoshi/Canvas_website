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
  const [paymentMethodId, setPaymentMethodId] = useState('');
  const [shippingRuleId, setShippingRuleId] = useState('');
  const [couponCode, setCouponCode] = useState('');
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
    setItems(getCart());

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
          // Default payment options if DB is unseeded
          const defaultPayments = [
            { id: 'cod', name: 'Cash on Delivery (Nepal)', code: 'cod', instructions: 'Pay cash when your canvas is delivered to your door.' },
            { id: 'esewa', name: 'eSewa Mobile Wallet', code: 'esewa', instructions: 'Pay securely via eSewa online transfer.' },
            { id: 'khalti', name: 'Khalti Wallet', code: 'khalti', instructions: 'Pay via Khalti digital wallet.' },
            { id: 'bank', name: 'Direct Bank Transfer', code: 'bank_transfer', instructions: 'Transfer directly to our Nabil/Global IME Bank account.' },
          ];
          setPaymentMethods(defaultPayments);
          setPaymentMethodId('cod');
        }
      });

    supabase
      .from('shipping_rules')
      .select('id, zone_name, charge_paisa')
      .eq('active', true)
      .then(({ data }) => {
        if (data && data.length > 0) {
          setShippingRules(data);
          setShippingRuleId(data[0].id);
        } else {
          // Default shipping options if DB is unseeded
          const defaultShipping = [
            { id: 'ktm', zone_name: 'Inside Kathmandu Valley (Rs. 150)', charge_paisa: 15000 },
            { id: 'out', zone_name: 'Outside Kathmandu Valley / Other Districts (Rs. 250)', charge_paisa: 25000 },
          ];
          setShippingRules(defaultShipping);
          setShippingRuleId('ktm');
        }
      });
  }, []);

  const subtotal = cartSubtotalPaisa(items);
  const shippingCharge = shippingRules.find((r) => r.id === shippingRuleId)?.charge_paisa ?? 0;
  const estimatedTotal = subtotal + shippingCharge;

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
          shippingAddress: address,
          paymentMethodId,
          shippingRuleId,
          couponCode: couponCode || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? 'Could not place your order. Please try again.');
        return;
      }

      const data = await res.json();
      clearCart();
      router.push(`/track-order?orderNumber=${data.orderNumber}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container-page py-10">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="font-display text-3xl font-semibold">Checkout &amp; Order Confirmation</h1>
        <p className="text-xs text-muted">
          Complete your delivery details &amp; payment choice to confirm your canvas order.
        </p>
      </div>

      {/* User Auth Banner Notice */}
      {!user && !checkingAuth && (
        <div className="mb-8 rounded-xl border border-amber-500/30 bg-amber-500/10 p-5 text-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
              <span>🔒</span> User Login Required for Order Placement
            </p>
            <p className="text-xs text-muted">
              You can freely browse our products &amp; design custom canvases, but placing an order requires signing into your account.
            </p>
          </div>
          <Link
            href="/login?redirect=/checkout"
            className="shrink-0 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition-colors shadow-sm"
          >
            Log In / Register Now →
          </Link>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="space-y-8">
          <fieldset className="grid gap-4 sm:grid-cols-2 rounded-xl border border-border p-5 bg-surface">
            <legend className="mb-2 text-sm font-semibold px-2 text-text">
              1. Delivery Address (Nepal)
            </legend>
            <TextField label="Full Name *" value={address.full_name} onChange={(v) => setAddress((a) => ({ ...a, full_name: v }))} required />
            <TextField label="Phone Number *" value={address.phone} onChange={(v) => setAddress((a) => ({ ...a, phone: v }))} required type="tel" />
            <TextField label="Email Address" value={address.email} onChange={(v) => setAddress((a) => ({ ...a, email: v }))} type="email" />
            <TextField label="Province (e.g. Bagmati)" value={address.province} onChange={(v) => setAddress((a) => ({ ...a, province: v }))} />
            <TextField label="District (e.g. Kathmandu)" value={address.district} onChange={(v) => setAddress((a) => ({ ...a, district: v }))} />
            <TextField label="Municipality / Local Body" value={address.municipality} onChange={(v) => setAddress((a) => ({ ...a, municipality: v }))} />
            <TextField label="Ward No." value={address.ward} onChange={(v) => setAddress((a) => ({ ...a, ward: v }))} />
            <TextField label="Tole / Area Name" value={address.tole_area} onChange={(v) => setAddress((a) => ({ ...a, tole_area: v }))} />
            <TextField label="Street Address" value={address.address_line} onChange={(v) => setAddress((a) => ({ ...a, address_line: v }))} className="sm:col-span-2" />
            <TextField label="Nearby Landmark" value={address.landmark} onChange={(v) => setAddress((a) => ({ ...a, landmark: v }))} className="sm:col-span-2" />
            <TextField label="Special Delivery Instructions" value={address.delivery_notes} onChange={(v) => setAddress((a) => ({ ...a, delivery_notes: v }))} className="sm:col-span-2" />
          </fieldset>

          <fieldset className="rounded-xl border border-border p-5 bg-surface space-y-3">
            <legend className="mb-2 text-sm font-semibold px-2 text-text">
              2. Shipping Zone &amp; Delivery
            </legend>
            <div className="space-y-2.5">
              {shippingRules.map((rule) => (
                <label key={rule.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-bg hover:border-amber-600 cursor-pointer text-sm font-medium">
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
                  <span className="font-bold text-amber-600">{formatPaisa(rule.charge_paisa)}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="rounded-xl border border-border p-5 bg-surface space-y-3">
            <legend className="mb-2 text-sm font-semibold px-2 text-text">
              3. Payment Options
            </legend>
            <div className="space-y-2.5">
              {paymentMethods.map((method) => (
                <label key={method.id} className="flex flex-col p-3 rounded-lg border border-border bg-bg hover:border-amber-600 cursor-pointer text-sm font-medium">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethodId === method.id}
                      onChange={() => setPaymentMethodId(method.id)}
                      className="accent-amber-600"
                    />
                    <span className="font-semibold">{method.name}</span>
                  </div>
                  {method.instructions && (
                    <p className="text-xs text-muted ml-6 mt-1">{method.instructions}</p>
                  )}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="rounded-xl border border-border p-5 bg-surface">
            <TextField
              label="Promo Code or Discount Coupon"
              value={couponCode}
              onChange={setCouponCode}
            />
          </div>
        </div>

        {/* Order Summary sidebar */}
        <div className="h-fit space-y-4 rounded-xl border border-border p-6 bg-surface shadow-sm sticky top-24">
          <h3 className="text-base font-semibold border-b border-border pb-3">Order Summary</h3>

          <div className="space-y-3">
            {items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-start text-xs border-b border-border/50 pb-2">
                <div>
                  <p className="font-semibold text-text line-clamp-1">{item.name}</p>
                  <p className="text-muted">{item.sizeLabel || 'Standard'} × {item.quantity}</p>
                </div>
                <span className="font-semibold text-text">{formatPaisa(item.unitPricePaisa * item.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="pt-2 space-y-2 text-xs">
            <div className="flex justify-between text-muted">
              <span>Subtotal</span>
              <span className="font-semibold text-text">{formatPaisa(subtotal)}</span>
            </div>
            <div className="flex justify-between text-muted">
              <span>Shipping Fee</span>
              <span className="font-semibold text-text">{formatPaisa(shippingCharge)}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-3 text-base font-bold text-text">
              <span>Total Payable</span>
              <span className="text-amber-600">{formatPaisa(estimatedTotal)}</span>
            </div>
          </div>

          {error && <p className="text-xs text-red-600 font-medium p-2 rounded bg-red-500/10 border border-red-500/20">{error}</p>}

          {user ? (
            <button
              type="submit"
              disabled={submitting || items.length === 0}
              className="w-full rounded-lg bg-amber-600 px-4 py-3.5 text-sm font-bold text-white hover:bg-amber-700 transition-colors disabled:opacity-50 shadow-sm"
            >
              {submitting ? 'Confirming Order…' : 'Confirm & Place Order'}
            </button>
          ) : (
            <Link
              href="/login?redirect=/checkout"
              className="block w-full text-center rounded-lg bg-amber-600 px-4 py-3.5 text-sm font-bold text-white hover:bg-amber-700 transition-colors shadow-sm"
            >
              Log In to Complete Payment
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
        className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text outline-none focus:border-amber-600 transition-colors"
      />
    </div>
  );
}
