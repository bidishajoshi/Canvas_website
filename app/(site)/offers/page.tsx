import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import type { CouponCode } from '@/lib/types';

export const metadata = {
  title: 'Special Offers & Coupons - Affordable Decoration Nepal',
  description: 'Save on custom canvas prints and customized t-shirts with active discount codes and promotions.',
};

export default async function OffersPage() {
  const supabase = createClient();
  const { data } = await supabase.from('coupon_codes').select('*').eq('active', true);
  const dbCoupons: CouponCode[] = (data as CouponCode[]) || [];

  const activePromos: CouponCode[] = dbCoupons.length > 0 ? dbCoupons : [
    {
      id: 'demo-1',
      code: 'WELCOME10',
      discount_type: 'percentage',
      discount_value: 10,
      min_order_paisa: 150000,
      max_discount_paisa: 50000,
      expiry_date: '2026-12-31',
      usage_limit: null,
      used_count: 0,
      active: true,
    },
    {
      id: 'demo-2',
      code: 'DECOR20',
      discount_type: 'percentage',
      discount_value: 20,
      min_order_paisa: 300000,
      max_discount_paisa: 100000,
      expiry_date: '2026-12-31',
      usage_limit: null,
      used_count: 0,
      active: true,
    },
    {
      id: 'demo-3',
      code: 'FESTIVE500',
      discount_type: 'fixed',
      discount_value: 500, // Rs 500
      min_order_paisa: 250000,
      expiry_date: '2026-12-31',
      usage_limit: null,
      used_count: 0,
      active: true,
    },
  ];

  return (
    <div className="container-page py-10 sm:py-16">
      {/* Page Header */}
      <div className="max-w-3xl mb-12">
        <span className="inline-block text-xs font-bold uppercase tracking-widest text-amber-600 mb-2">
          Deals &amp; Savings
        </span>
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-text mb-4">
          Active Offers &amp; Promo Codes
        </h1>
        <p className="text-muted text-base sm:text-lg">
          Apply any of these coupon codes at checkout to enjoy discounts on your custom canvas and wall decor orders.
        </p>
      </div>

      {/* Grid of Coupon Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        {activePromos.map((coupon: CouponCode) => (
          <div
            key={coupon.id}
            className="relative rounded-2xl border-2 border-dashed border-amber-500/40 bg-surface p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-4">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600">
                  {coupon.discount_type === 'percentage'
                    ? `${coupon.discount_value}% OFF`
                    : `Rs. ${coupon.discount_value} OFF`}
                </span>
                <span className="text-xs text-muted font-medium">Valid until Dec 2026</span>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-500/20 text-center mb-4">
                <span className="text-xs text-muted uppercase font-bold tracking-wider block mb-1">
                  Promo Code
                </span>
                <span className="font-mono text-2xl font-extrabold tracking-wider text-amber-600 select-all">
                  {coupon.code}
                </span>
              </div>

              <p className="text-xs text-muted mb-4">
                {coupon.min_order_paisa > 0 && (
                  <span>Min order: Rs. {(coupon.min_order_paisa / 100).toLocaleString('en-IN')}. </span>
                )}
                {coupon.max_discount_paisa && (
                  <span>Max discount: Rs. {(coupon.max_discount_paisa / 100).toLocaleString('en-IN')}.</span>
                )}
              </p>
            </div>

            <Link
              href="/custom-canvas"
              className="w-full text-center py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-colors shadow-sm"
            >
              Use Code Now →
            </Link>
          </div>
        ))}
      </div>

      {/* Free Delivery Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-amber-600 to-amber-700 text-white p-8 sm:p-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white uppercase tracking-wider mb-3">
            Kathmandu Special
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-bold mb-2">
            FREE Delivery on Orders Above Rs. 2,000!
          </h2>
          <p className="text-amber-100 text-sm sm:text-base max-w-xl">
            We deliver safely across Kathmandu Valley (Kathmandu, Lalitpur, Bhaktapur) with cash on delivery or online payment.
          </p>
        </div>

        <Link
          href="/shop"
          className="shrink-0 px-8 py-3.5 rounded-xl bg-white text-amber-700 hover:bg-amber-50 font-bold text-sm shadow-md transition-colors"
        >
          Shop Products Now
        </Link>
      </div>
    </div>
  );
}
