'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { cartSubtotalPaisa, clearCart, getCart, removeFromCart, type CartItem } from '@/lib/cart';
import { formatPaisa } from '@/lib/utils';
import { buildFullOrderWhatsAppLink } from '@/lib/whatsapp';

interface PaymentMethod {
  id: string;
  name: string;
  code: string;
  instructions: string | null;
  config?: {
    qr_code_url?: string;
  } | null;
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
  const [whatsappNumber, setWhatsappNumber] = useState('9779864029898');

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

    // Listen to cart updates
    const handleCartUpdate = () => {
      setItems(getCart());
    };
    window.addEventListener('cart-updated', handleCartUpdate);

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
        instructions: 'Pay cash when your order arrives. Advance delivery charge payment via eSewa QR below is required.',
      },
      {
        id: 'esewa',
        name: 'eSewa Mobile Wallet (Online Pay / QR)',
        code: 'esewa',
        instructions: 'Scan official eSewa QR code below to pay directly to Affordable Decoration.',
      },
      {
        id: 'bank_transfer',
        name: 'Direct Bank Transfer (NABIL / NIC Asia)',
        code: 'bank_transfer',
        instructions: 'Scan Bank QR below or send to NABIL Bank A/C: 0101017500001 (Affordable Decoration Pvt Ltd).',
      },
    ];

    supabase
      .from('payment_methods')
      .select('id, name, code, instructions, config')
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

    supabase
      .from('settings')
      .select('whatsapp_number')
      .single()
      .then(({ data }) => {
        if (data?.whatsapp_number) {
          setWhatsappNumber(data.whatsapp_number);
        }
      });

    return () => {
      window.removeEventListener('cart-updated', handleCartUpdate);
    };
  }, []);

  function handleRemoveItem(id: string) {
    removeFromCart(id);
    setItems(getCart());
  }

  const subtotalPaisa = cartSubtotalPaisa(items);
  const shippingChargePaisa = shippingRules.find((r) => r.id === shippingRuleId)?.charge_paisa ?? 0;
  const estimatedTotalPaisa = Math.max(0, subtotalPaisa - discountPaisa + shippingChargePaisa);

  const selectedPaymentMethod = paymentMethods.find((p) => p.id === paymentMethodId);

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

  async function handlePlaceOrder(target: 'whatsapp' | 'web', e?: FormEvent) {
    if (e) e.preventDefault();
    if (items.length === 0) {
      setError('Your cart is empty.');
      return;
    }

    if (!address.full_name.trim() || !address.phone.trim() || !address.address_line.trim() || !address.district.trim()) {
      setError('Please complete all required delivery details: Full Name, Contact Phone, District/City, and Street Address.');
      return;
    }

    if (!user) {
      setError('Please log in or create an account to place your order.');
      router.push('/login?redirect=/checkout');
      return;
    }

    if (!bankTxnRef.trim()) {
      setError(
        paymentMethodId === 'cod'
          ? 'Please enter your delivery fee payment statement / transaction reference ID to confirm COD.'
          : 'Please enter your payment statement / transaction reference ID.'
      );
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
            bank_transaction_ref: bankTxnRef,
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
      const orderNumber = data.orderNumber;

      if (target === 'whatsapp') {
        const selectedPayment = selectedPaymentMethod?.name || 'Standard Payment';
        const waUrl = buildFullOrderWhatsAppLink(whatsappNumber, {
          orderNumber,
          customerName: address.full_name,
          phone: address.phone,
          email: address.email,
          addressLine: address.address_line,
          toleArea: address.tole_area,
          municipality: address.municipality,
          district: address.district,
          province: address.province,
          landmark: address.landmark,
          paymentMethodName: selectedPayment,
          paymentTxnRef: bankTxnRef,
          items: items.map((i) => ({
            name: i.name,
            sizeLabel: i.sizeLabel,
            frameLabel: i.frameLabel,
            quantity: i.quantity,
            unitPricePaisa: i.unitPricePaisa,
          })),
          subtotalPaisa,
          shippingPaisa: shippingChargePaisa,
          discountPaisa,
          totalPaisa: estimatedTotalPaisa,
        });

        window.open(waUrl, '_blank');
      }

      clearCart();
      sessionStorage.removeItem('applied_promo');
      router.push(`/track-order?orderNumber=${orderNumber}`);
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
          Complete your delivery address, verify shipping charge, scan payment QR code, and send order directly to WhatsApp.
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

      <form onSubmit={(e) => handlePlaceOrder('whatsapp', e)} className="grid gap-8 lg:grid-cols-[1fr_380px]">
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
            <TextField label="District (e.g. Kathmandu) *" value={address.district} onChange={(v) => setAddress((a) => ({ ...a, district: v }))} required />
            <TextField label="Municipality / Local Area" value={address.municipality} onChange={(v) => setAddress((a) => ({ ...a, municipality: v }))} />
            <TextField label="Ward No." value={address.ward} onChange={(v) => setAddress((a) => ({ ...a, ward: v }))} />
            <TextField label="Tole / Area Name" value={address.tole_area} onChange={(v) => setAddress((a) => ({ ...a, tole_area: v }))} />
            <TextField label="Street Address *" value={address.address_line} onChange={(v) => setAddress((a) => ({ ...a, address_line: v }))} required className="sm:col-span-2" />
            <TextField label="Nearby Landmark" value={address.landmark} onChange={(v) => setAddress((a) => ({ ...a, landmark: v }))} className="sm:col-span-2" />
          </fieldset>

          {/* 2. Shipping Zone */}
          <fieldset className="rounded-2xl border border-border p-6 bg-surface shadow-sm space-y-3">
            <legend className="mb-3 text-base font-bold text-text flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-600 text-white text-xs font-bold">2</span>
              Shipping &amp; Delivery Zone (Admin Configured)
            </legend>
            <div className="space-y-2.5">
              {shippingRules.map((rule) => (
                <label key={rule.id} className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-bg hover:border-amber-600 cursor-pointer text-xs font-semibold transition-colors">
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

          {/* 3. Integrated Payment Options & Admin QR Code */}
          <fieldset className="rounded-2xl border border-border p-6 bg-surface shadow-sm space-y-4">
            <legend className="mb-3 text-base font-bold text-text flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-600 text-white text-xs font-bold">3</span>
              Payment Method &amp; QR Scan
            </legend>

            <div className="space-y-3">
              {paymentMethods.map((method) => {
                const isSelected = paymentMethodId === method.id;
                return (
                  <div
                    key={method.id}
                    onClick={() => setPaymentMethodId(method.id)}
                    className={`flex flex-col p-4 rounded-xl border transition-all cursor-pointer text-xs ${
                      isSelected
                        ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-500/5 font-semibold'
                        : 'border-border bg-bg hover:border-text/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
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
                      {method.config?.qr_code_url && (
                        <span className="text-[10px] font-bold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          📷 QR Available
                        </span>
                      )}
                    </div>

                    {method.instructions && (
                      <p className="text-xs text-muted ml-6 mt-1.5 leading-relaxed">
                        {method.instructions}
                      </p>
                    )}

                    {/* QR Code Display if Admin uploaded one */}
                    {isSelected && method.config?.qr_code_url && (
                      <div className="mt-4 p-4 bg-white dark:bg-gray-900 rounded-xl border border-amber-500/30 text-center max-w-xs mx-auto shadow-md">
                        <p className="text-xs font-bold text-gray-800 dark:text-gray-200 mb-2">
                          📲 Scan QR Code to Pay ({method.name})
                        </p>
                        <img
                          src={method.config.qr_code_url}
                          alt={`${method.name} QR Code`}
                          className="w-48 h-48 object-contain mx-auto rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm"
                        />
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-2">
                          Scan using your eSewa, Mobile Banking, or Fonepay App
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Payment Statement / Reference ID Entry */}
            <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 space-y-2.5 mt-4 text-xs">
              <div className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-300">
                <span>📑</span> Payment Statement &amp; Transaction Reference ID *
              </div>
              {paymentMethodId === 'cod' ? (
                <p className="text-[11px] text-muted leading-relaxed">
                  For Cash on Delivery (COD), please pay the advance delivery charge ({shippingChargePaisa === 0 ? 'FREE' : formatPaisa(shippingChargePaisa)}) via the QR code above, then enter your transaction statement reference ID below to finalize your order.
                </p>
              ) : (
                <p className="text-[11px] text-muted leading-relaxed">
                  After completing your eSewa / Bank payment via QR code, enter your transaction ID or payment statement reference below:
                </p>
              )}
              <input
                type="text"
                required
                value={bankTxnRef}
                onChange={(e) => setBankTxnRef(e.target.value)}
                placeholder="e.g. eSewa Txn #92847291 or NABIL Ref #00123"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-border bg-bg uppercase font-mono font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </fieldset>

          {/* Promo Code Input on Checkout */}
          <div className="rounded-2xl border border-border p-6 bg-surface shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-text flex items-center gap-1.5">
              <span>🎟️</span> Apply Promo Code
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
                  className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-border bg-bg uppercase font-mono font-bold"
                />
                <button
                  type="button"
                  onClick={handleApplyPromoCode}
                  disabled={applyingPromo || !couponCode.trim()}
                  className="px-4 py-2 rounded-xl bg-amber-500 text-white font-bold text-xs hover:bg-amber-600 disabled:opacity-50 transition-colors"
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
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="text-base font-bold text-text">Final Order Summary</h3>
            <span className="text-xs text-muted font-semibold">{items.length} {items.length === 1 ? 'item' : 'items'}</span>
          </div>

          {items.length === 0 ? (
            <p className="text-xs text-muted py-4 text-center">Your cart is empty. Add items to proceed.</p>
          ) : (
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between items-start text-xs border-b border-border/50 pb-2.5 gap-2">
                  <div className="flex-1">
                    <p className="font-bold text-text line-clamp-1">{item.name}</p>
                    <p className="text-muted text-[11px]">{item.sizeLabel || 'Standard'} × {item.quantity}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-amber-600">{formatPaisa(item.unitPricePaisa * item.quantity)}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      title="Remove from cart"
                      className="text-red-500 hover:text-red-700 p-1 text-xs font-bold rounded hover:bg-red-500/10 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

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

          {error && <p className="text-xs text-red-600 font-semibold p-3 rounded-xl bg-red-500/10 border border-red-500/20">{error}</p>}

          {user ? (
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={(e) => handlePlaceOrder('whatsapp', e)}
                disabled={submitting || items.length === 0}
                className="w-full rounded-xl bg-[#25D366] hover:bg-[#20bd5a] py-4 text-sm font-extrabold text-white transition-all disabled:opacity-50 shadow-lg hover:scale-[1.01] flex items-center justify-center gap-2"
              >
                <span className="text-base">💬</span>
                <span>{submitting ? 'Confirming Order…' : 'Order & Send via WhatsApp'}</span>
              </button>

              <button
                type="button"
                onClick={(e) => handlePlaceOrder('web', e)}
                disabled={submitting || items.length === 0}
                className="w-full rounded-xl border border-border bg-bg hover:bg-surface py-3 text-xs font-bold text-text transition-all disabled:opacity-50 shadow-sm"
              >
                Confirm Direct Web Order 💳
              </button>
            </div>
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
