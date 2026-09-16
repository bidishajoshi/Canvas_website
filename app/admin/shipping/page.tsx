import { requireAdminUser } from '@/lib/adminAuth';
import { createAdminClient } from '@/lib/supabase/admin';
import { formatPaisa } from '@/lib/utils';
import { createShippingRule, deleteShippingRule, toggleShippingRuleActive } from './actions';
import { filterDeleted } from '@/lib/adminStore';

interface ShippingRule {
  id: string;
  zone_name: string;
  charge_paisa: number;
  free_shipping_threshold_paisa: number | null;
  estimated_days_min: number | null;
  estimated_days_max: number | null;
  active: boolean;
  sort_order: number;
}

const DEFAULT_SHIPPING_RULES: ShippingRule[] = [
  {
    id: 'ktm',
    zone_name: 'Kathmandu / Lalitpur / Bhaktapur',
    charge_paisa: 0,
    free_shipping_threshold_paisa: 200000,
    estimated_days_min: 1,
    estimated_days_max: 2,
    active: true,
    sort_order: 1,
  },
  {
    id: 'out',
    zone_name: 'Outside Valley Delivery (Major Cities in Nepal)',
    charge_paisa: 15000,
    free_shipping_threshold_paisa: 350000,
    estimated_days_min: 3,
    estimated_days_max: 5,
    active: true,
    sort_order: 2,
  },
  {
    id: 'remote',
    zone_name: 'Remote Mountain / Hill Locations',
    charge_paisa: 25000,
    free_shipping_threshold_paisa: 500000,
    estimated_days_min: 5,
    estimated_days_max: 7,
    active: true,
    sort_order: 3,
  },
];

export default async function AdminShippingPage() {
  await requireAdminUser();
  const supabase = createAdminClient();

  const { data } = await supabase
    .from('shipping_rules')
    .select('*')
    .order('sort_order', { ascending: true });

  const shippingRules = filterDeleted(
    data && data.length > 0 ? (data as ShippingRule[]) : DEFAULT_SHIPPING_RULES
  );

  return (
    <div className="space-y-10 max-w-4xl">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
          🚚 Delivery &amp; Shipping CMS
        </span>
        <h1 className="font-display text-2xl font-extrabold text-text mt-2">
          Location-Based Shipping Rules &amp; Charges
        </h1>
        <p className="text-xs text-muted mt-1">
          Manage delivery charges by location (Kathmandu Valley, Outside Valley, Remote Districts) and configure free delivery thresholds.
        </p>
      </div>

      {/* Existing Shipping Rules */}
      <section className="rounded-xl border border-border bg-surface/50 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h2 className="font-bold text-lg text-text flex items-center gap-2">
            <span>📍</span> Delivery Zones &amp; Rates
          </h2>
          <span className="text-xs font-bold text-amber-600 bg-amber-500/10 px-2.5 py-1 rounded-md">
            {shippingRules.length} Delivery Zones
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {shippingRules.map((rule) => (
            <div
              key={rule.id}
              className={`flex flex-col justify-between p-4 rounded-xl border transition-all ${
                rule.active ? 'border-border bg-surface shadow-sm' : 'border-border/60 bg-surface/30 opacity-70'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-sm text-text">{rule.zone_name}</h3>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                      rule.active
                        ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                        : 'bg-zinc-500/10 text-zinc-500 border border-zinc-500/20'
                    }`}
                  >
                    {rule.active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="text-xs space-y-1">
                  <p className="font-extrabold text-base text-amber-600">
                    {rule.charge_paisa === 0 ? 'FREE Delivery' : formatPaisa(rule.charge_paisa)}
                  </p>

                  {rule.free_shipping_threshold_paisa != null && (
                    <p className="text-emerald-600 font-semibold text-[11px]">
                      ✨ Free shipping over {formatPaisa(rule.free_shipping_threshold_paisa)}
                    </p>
                  )}

                  {rule.estimated_days_min && rule.estimated_days_max && (
                    <p className="text-muted text-[11px]">
                      ⏱️ Estimated Delivery: {rule.estimated_days_min} – {rule.estimated_days_max} Days
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 mt-3 border-t border-border/50 text-xs">
                <form action={toggleShippingRuleActive.bind(null, rule.id, !rule.active)}>
                  <button type="submit" className="font-semibold text-amber-600 hover:underline">
                    {rule.active ? 'Deactivate' : 'Activate'}
                  </button>
                </form>

                <form action={deleteShippingRule.bind(null, rule.id)}>
                  <button type="submit" className="font-semibold text-red-600 hover:underline">
                    Delete
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Add New Shipping Zone Form */}
      <section className="rounded-xl border border-border bg-surface/50 p-6 space-y-4">
        <h2 className="font-bold text-lg text-text flex items-center gap-2 border-b border-border pb-3">
          <span>➕</span> Add New Delivery Location Zone
        </h2>

        <form action={createShippingRule} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="text-xs text-muted font-medium">Location Zone Name *</label>
            <input
              name="zone_name"
              type="text"
              required
              placeholder="e.g. Chitwan / Pokhara Valley or Outside Valley Delivery"
              className="mt-1 block w-full rounded-xl border border-border bg-bg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="text-xs text-muted font-medium">Shipping Charge (NPR) *</label>
            <input
              name="charge_rs"
              type="number"
              step="1"
              required
              defaultValue="150"
              placeholder="e.g. 150 (0 for Free Delivery)"
              className="mt-1 block w-full rounded-xl border border-border bg-bg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="text-xs text-muted font-medium">Free Shipping Threshold (NPR, Optional)</label>
            <input
              name="free_shipping_threshold_rs"
              type="number"
              step="1"
              placeholder="e.g. 2000 (Free over Rs. 2,000)"
              className="mt-1 block w-full rounded-xl border border-border bg-bg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="text-xs text-muted font-medium">Min Delivery Days</label>
            <input
              name="estimated_days_min"
              type="number"
              defaultValue="1"
              className="mt-1 block w-full rounded-xl border border-border bg-bg px-3.5 py-2.5 text-sm"
            />
          </div>

          <div>
            <label className="text-xs text-muted font-medium">Max Delivery Days</label>
            <input
              name="estimated_days_max"
              type="number"
              defaultValue="3"
              className="mt-1 block w-full rounded-xl border border-border bg-bg px-3.5 py-2.5 text-sm"
            />
          </div>

          <div className="sm:col-span-2 pt-2">
            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-sm shadow-md transition-all"
            >
              + Create Delivery Zone Rule
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
