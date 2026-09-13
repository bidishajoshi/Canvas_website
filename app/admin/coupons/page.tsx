import { requireAdminUser } from '@/lib/adminAuth';
import { createAdminClient } from '@/lib/supabase/admin';
import { formatPaisa } from '@/lib/utils';
import { createCoupon, deleteCoupon, toggleCouponActive } from './actions';
import type { CouponCode } from '@/lib/types';

const DEMO_COUPONS: CouponCode[] = [
  {
    id: 'demo-1',
    code: 'WELCOME10',
    discount_type: 'percentage',
    discount_value: 10,
    min_order_paisa: 100000,
    used_count: 14,
    active: true,
  },
  {
    id: 'demo-2',
    code: 'FESTIVE20',
    discount_type: 'percentage',
    discount_value: 20,
    min_order_paisa: 250000,
    used_count: 28,
    active: true,
  },
  {
    id: 'demo-3',
    code: 'DECOR500',
    discount_type: 'fixed',
    discount_value: 500,
    min_order_paisa: 200000,
    used_count: 9,
    active: true,
  },
];

export default async function AdminCouponsPage() {
  await requireAdminUser();
  const supabase = createAdminClient();

  const { data } = await supabase
    .from('coupon_codes')
    .select('*')
    .order('created_at', { ascending: false });

  const coupons = data && data.length > 0 ? (data as CouponCode[]) : DEMO_COUPONS;

  return (
    <div className="space-y-10">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
          🎟️ Discounts &amp; Promo Codes CMS
        </span>
        <h1 className="font-display text-2xl font-extrabold text-text mt-2">
          Promo Code &amp; Coupon Manager
        </h1>
        <p className="text-xs text-muted mt-1">
          Create, edit, activate/deactivate promo codes with percentage or fixed NPR discounts, minimum order requirements, and usage limits.
        </p>
      </div>

      {/* Existing Coupons List */}
      <section className="rounded-xl border border-border bg-surface/50 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h2 className="font-bold text-lg text-text flex items-center gap-2">
            <span>🏷️</span> Active &amp; Past Promo Codes
          </h2>
          <span className="text-xs font-bold text-amber-600 bg-amber-500/10 px-2.5 py-1 rounded-md">
            {coupons.length} Promo Codes
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {coupons.map((c) => (
            <div
              key={c.id}
              className={`flex flex-col justify-between p-4 rounded-xl border transition-all ${
                c.active ? 'border-border bg-surface shadow-sm' : 'border-border/60 bg-surface/30 opacity-70'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-extrabold text-base text-pink-600 bg-pink-500/10 px-2.5 py-1 rounded-md border border-pink-500/20">
                    {c.code}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      c.active
                        ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                        : 'bg-zinc-500/10 text-zinc-500 border border-zinc-500/20'
                    }`}
                  >
                    {c.active ? '● Active' : '○ Inactive'}
                  </span>
                </div>

                <div className="text-xs text-text space-y-1 pt-1">
                  <p className="font-bold text-sm text-amber-600">
                    {c.discount_type === 'percentage'
                      ? `${c.discount_value}% OFF`
                      : `Rs. ${c.discount_value} OFF`}
                  </p>
                  <p className="text-muted">
                    Min Order: {c.min_order_paisa > 0 ? formatPaisa(c.min_order_paisa) : 'None'}
                  </p>
                  <p className="text-muted">Used: {c.used_count} times</p>
                  {c.expiry_date && (
                    <p className="text-muted">
                      Expires: {new Date(c.expiry_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 mt-3 border-t border-border/50 text-xs">
                <form action={toggleCouponActive.bind(null, c.id, !c.active)}>
                  <button type="submit" className="font-semibold text-amber-600 hover:underline">
                    {c.active ? 'Deactivate' : 'Activate'}
                  </button>
                </form>

                <form action={deleteCoupon.bind(null, c.id)}>
                  <button type="submit" className="font-semibold text-red-600 hover:underline">
                    Delete
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Create New Coupon Form */}
      <section className="rounded-xl border border-border bg-surface/50 p-6 space-y-4">
        <h2 className="font-bold text-lg text-text flex items-center gap-2 border-b border-border pb-3">
          <span>➕</span> Create New Promo Code
        </h2>

        <form action={createCoupon} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <LabeledInput label="Promo Code String" name="code" placeholder="e.g. DASHAIN25" required />

          <div>
            <label className="text-xs text-muted font-medium">Discount Type</label>
            <select
              name="discount_type"
              className="mt-1 w-full rounded-xl border border-border bg-bg px-3 py-2 text-sm"
            >
              <option value="percentage">Percentage Discount (%)</option>
              <option value="fixed">Fixed Amount Discount (Rs.)</option>
            </select>
          </div>

          <LabeledInput label="Discount Value" name="discount_value" type="number" step="1" placeholder="e.g. 20 (for 20%) or 500 (for Rs. 500)" required />

          <LabeledInput label="Minimum Order Subtotal (NPR)" name="min_order_rs" type="number" step="1" placeholder="e.g. 2000" defaultValue="1000" />
          <LabeledInput label="Max Discount Limit (NPR, optional for %)" name="max_discount_rs" type="number" step="1" placeholder="e.g. 1500" />
          <LabeledInput label="Expiry Date (Optional)" name="expiry_date" type="date" />

          <LabeledInput label="Max Usage Limit (Optional)" name="usage_limit" type="number" placeholder="e.g. 100" />

          <div className="md:col-span-3 pt-2">
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-sm shadow-md transition-all"
            >
              + Create Promo Code
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function LabeledInput({
  label,
  name,
  type = 'text',
  step,
  defaultValue,
  placeholder,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  step?: string;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="text-xs text-muted font-medium">{label}</label>
      <input
        name={name}
        type={type}
        step={step}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        className="mt-1 block w-full rounded-xl border border-border bg-bg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
      />
    </div>
  );
}
