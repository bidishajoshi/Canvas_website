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
  const [shippingRuleId, setShippingRuleId] = useState('free_1panel');
  const [bankTxnRef, setBankTxnRef] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('9779864029898');
  
  // Payment screenshot state
  const [paymentScreenshotUrl, setPaymentScreenshotUrl] = useState<string | null>(null);

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
    district: 'Kathmandu',
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

    // Check user authentication via session
    supabase.auth.getSession().then(({ data: sessionData }) => {
      if (sessionData?.session?.user) {
        setUser(sessionData.session.user);
        setAddress((prev) => ({
          ...prev,
          email: sessionData.session.user.email || prev.email,
          full_name: sessionData.session.user.user_metadata?.full_name || prev.full_name,
        }));
      }
      setCheckingAuth(false);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        setAddress((prev) => ({
          ...prev,
          email: session.user.email || prev.email,
          full_name: session.user.user_metadata?.full_name || prev.full_name,
        }));
      }
    });

    const defaultPayments: PaymentMethod[] = [
      {
        id: 'cod',
        name: 'Cash on Delivery (COD)',
        code: 'cod',
        instructions: 'Pay cash when your order arrives. Free delivery offer available for testing!',
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
      { id: 'free_1panel', zone_name: '🎁 1-Panel Special — FREE Delivery (First 15 Customers Offer)', charge_paisa: 0 },
      { id: 'ktm', zone_name: 'Kathmandu / Lalitpur / Bhaktapur Standard Delivery', charge_paisa: 0 },
      { id: 'out', zone_name: 'Outside Valley Delivery (Rs. 150)', charge_paisa: 15000 },
    ];

    supabase
      .from('shipping_rules')
      .select('id, zone_name, charge_paisa')
      .eq('active', true)
      .then(({ data }) => {
        if (data && data.length > 0) {
          const rules = [
            { id: 'free_1panel', zone_name: '🎁 1-Panel Special — FREE Delivery (First 15 Customers Offer)', charge_paisa: 0 },
            ...data,
          ];
          setShippingRules(rules);
          setShippingRuleId('free_1panel');
        } else {
          setShippingRules(defaultShipping);
          setShippingRuleId('free_1panel');
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

  function handleScreenshotFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      if (evt.target?.result) {
        setPaymentScreenshotUrl(evt.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  }

  const subtotalPaisa = cartSubtotalPaisa(items);
  const is1PanelInCart = items.some(
    (i) =>
      i.name?.toLowerCase().includes('1 panel') ||
      i.name?.toLowerCase().includes('single panel') ||
      i.sizeLabel?.toLowerCase().includes('1 panel')
  );
  const effectiveShippingRuleId = is1PanelInCart ? 'free_1panel' : shippingRuleId;
  const shippingChargePaisa =
    effectiveShippingRuleId === 'free_1panel'
      ? 0
      : shippingRules.find((r) => r.id === effectiveShippingRuleId)?.charge_paisa ?? 0;

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
      setError('Your cart is empty. Please add a product or canvas before checking out.');
      return;
    }

    if (!address.full_name.trim() || !address.phone.trim() || !address.address_line.trim()) {
      setError('Please complete required delivery details: Full Name, Contact Phone, and Street Address.');
      return;
    }

    const effectiveTxnRef = bankTxnRef.trim() || 'PAYMENT-STATEMENT-ATTACHED';

    setSubmitting(true);
    setError(null);

    let orderNumber = `AD-2026-${Math.floor(10000 + Math.random() * 90000)}`;

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
            bank_transaction_ref: effectiveTxnRef,
            payment_screenshot_url: paymentScreenshotUrl ? 'Attached in WhatsApp' : null,
          },
          paymentMethodId,
          shippingRuleId: effectiveShippingRuleId,
          couponCode: couponCode || null,
          discountPaisa,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.orderNumber) orderNumber = data.orderNumber;
      }
    } catch (err) {
      console.warn('API order sync notice', err);
    }

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
        paymentTxnRef: effectiveTxnRef,
        paymentScreenshotUrl: paymentScreenshotUrl ? '📷 Screenshot Photo Attached' : null,
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
    setSubmitting(false);
    router.push(`/track-order?orderNumber=${orderNumber}`);
  }

  return (
    <div className="container-page py-10">
      <div className="flex flex-col gap-2 mb-8">
        <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 w-fit">
          💳 Instant Checkout &amp; WhatsApp Order
        </span>
        <h1 className="font-display text-3xl font-extrabold text-text">Checkout &amp; Order Placement</h1>
        <p className="text-xs text-muted">
          Fill in your delivery address, attach payment screenshot (optional), and send your order directly to WhatsApp (**9864029898**).
        </p>
      </div>

      {/* User Auth Banner Notice (Non-blocking) */}
      {user ? (
        <div className="mb-8 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs flex items-center justify-between gap-4 shadow-sm text-emerald-800 dark:text-emerald-300">
          <p className="font-bold flex items-center gap-2">
            <span>✓</span> Logged In as <span className="underline font-mono">{user.email || user.user_metadata?.full_name || 'Customer'}</span> — Your order will sync to your dashboard.
          </p>
        </div>
      ) : (
        <div className="mb-8 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm text-amber-800 dark:text-amber-300">
          <p className="font-bold flex items-center gap-1.5">
            <span>⚡</span> Guest Checkout Active — Ordering is open to all visitors! (Optional: <Link href="/login?redirect=/checkout" className="underline font-extrabold hover:text-amber-600">Sign in to save order to account</Link>)
          </p>
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
            <TextField label="District / City *" value={address.district} onChange={(v) => setAddress((a) => ({ ...a, district: v }))} required />
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
              Shipping &amp; Delivery Zone
            </legend>

            {is1PanelInCart && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-bold text-emerald-700 dark:text-emerald-300 mb-2 flex items-center gap-2">
                <span>🎉</span> 1-Panel Canvas Offer Applied: FREE Delivery (First 15 Customers Promotion)!
              </div>
            )}

            <div className="space-y-2.5">
              {shippingRules.map((rule) => {
                const isSelected = effectiveShippingRuleId === rule.id;
                return (
                  <label key={rule.id} className={`flex items-center justify-between p-3.5 rounded-xl border transition-colors cursor-pointer text-xs font-semibold ${isSelected ? 'border-amber-500 bg-amber-500/5 font-bold' : 'border-border bg-bg hover:border-amber-600'}`}>
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="shipping"
                        checked={isSelected}
                        onChange={() => setShippingRuleId(rule.id)}
                        className="accent-amber-600"
                      />
                      <span>{rule.zone_name}</span>
                    </div>
                    <span className="font-extrabold text-amber-600">
                      {rule.charge_paisa === 0 ? 'FREE' : formatPaisa(rule.charge_paisa)}
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          {/* 3. Integrated Payment Options & QR Code Scan */}
          <fieldset className="rounded-2xl border border-border p-6 bg-surface shadow-sm space-y-4">
            <legend className="mb-3 text-base font-bold text-text flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-600 text-white text-xs font-bold">3</span>
              Payment Method, QR Scan &amp; Screenshot Upload
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

            {/* Payment Screenshot Upload Box */}
            <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-3 mt-4">
              <div className="flex items-center justify-between">
                <label className="font-bold text-xs text-text flex items-center gap-2">
                  <span>📸</span> Payment Receipt Screenshot Photo
                </label>
                {paymentScreenshotUrl && (
                  <button
                    type="button"
                    onClick={() => setPaymentScreenshotUrl(null)}
                    className="text-[11px] font-bold text-red-500 hover:underline"
                  >
                    Remove Photo
                  </button>
                )}
              </div>
              <p className="text-[11px] text-muted leading-relaxed">
                Upload your eSewa payment receipt screenshot or Bank transfer screenshot for instant order verification.
              </p>

              {paymentScreenshotUrl ? (
                <div className="relative rounded-xl overflow-hidden border border-amber-500/40 bg-white dark:bg-gray-900 p-2 text-center max-w-xs mx-auto shadow-sm">
                  <img
                    src={paymentScreenshotUrl}
                    alt="Payment Screenshot Receipt"
                    className="max-h-48 w-auto object-contain mx-auto rounded-lg shadow-sm"
                  />
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-2">
                    ✓ Screenshot Receipt Attached
                  </p>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-amber-500/30 hover:border-amber-500 rounded-xl cursor-pointer bg-bg hover:bg-surface transition-all text-center">
                  <span className="text-2xl mb-1">📷</span>
                  <span className="text-xs font-bold text-amber-600">Click to Select / Upload Payment Screenshot</span>
                  <span className="text-[10px] text-muted">Supports JPG, PNG, WEBP payment receipts</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleScreenshotFile}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Transaction Reference ID Entry */}
            <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 space-y-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-300">
                <span>📑</span> Payment Statement / Transaction Reference ID
              </div>
              <p className="text-[11px] text-muted leading-relaxed">
                Enter your eSewa transaction ID, bank reference, or payment statement number below.
              </p>
              <input
                type="text"
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
                  <span className="text-emerald-600 font-bold">FREE (15 Customers Special Offer)</span>
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
