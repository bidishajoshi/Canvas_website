import { requireAdminUser } from '@/lib/adminAuth';
import { createAdminClient } from '@/lib/supabase/admin';
import { formatPaisa } from '@/lib/utils';
import { addTShirtSize, deleteTShirtSize } from './actions';
import type { TShirtSize } from '@/lib/types';

export default async function AdminSizesPage() {
  await requireAdminUser();
  const supabase = createAdminClient();

  const { data: dbSizes } = await supabase
    .from('tshirt_sizes')
    .select('*')
    .order('sort_order', { ascending: true });

  const defaultSizes: TShirtSize[] = [
    { id: 's1', name: 'Small (S)', code: 'S', price_adjustment_paisa: 0, active: true, sort_order: 1 },
    { id: 's2', name: 'Medium (M)', code: 'M', price_adjustment_paisa: 0, active: true, sort_order: 2 },
    { id: 's3', name: 'Large (L)', code: 'L', price_adjustment_paisa: 0, active: true, sort_order: 3 },
    { id: 's4', name: 'Extra Large (XL)', code: 'XL', price_adjustment_paisa: 0, active: true, sort_order: 4 },
    { id: 's5', name: 'Double XL (2XL)', code: 'XXL', price_adjustment_paisa: 10000, active: true, sort_order: 5 },
    { id: 's6', name: 'Triple XL (3XL)', code: '3XL', price_adjustment_paisa: 15000, active: true, sort_order: 6 },
  ];

  const sizes = dbSizes && dbSizes.length > 0 ? (dbSizes as TShirtSize[]) : defaultSizes;

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="font-display text-2xl font-bold">T-Shirt Sizes Management</h1>
        <p className="text-xs text-muted mt-1">
          Add, edit, or delete available apparel sizes (XS, S, M, L, XL, XXL, 3XL) and set size price adjustments.
        </p>
      </div>

      {/* Add New Size Form */}
      <form action={addTShirtSize} className="rounded-2xl border border-border bg-surface p-5 space-y-4 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-amber-600">Add New Apparel Size</h3>

        <div className="grid sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-semibold text-muted block mb-1">Size Display Name *</label>
            <input
              type="text"
              name="name"
              required
              placeholder="e.g. Extra Large (XL)"
              className="w-full px-3 py-2 rounded-xl border border-border bg-bg text-xs focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted block mb-1">Size Code *</label>
            <input
              type="text"
              name="code"
              required
              placeholder="e.g. XL"
              className="w-full px-3 py-2 rounded-xl border border-border bg-bg text-xs font-mono uppercase focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted block mb-1">Price Add-On (Rs.)</label>
            <input
              type="number"
              name="price_adjustment_rs"
              defaultValue={0}
              placeholder="0"
              className="w-full px-3 py-2 rounded-xl border border-border bg-bg text-xs focus:outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition-all active:scale-95"
        >
          + Save Apparel Size
        </button>
      </form>

      {/* Existing Sizes List */}
      <div className="rounded-2xl border border-border bg-surface overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-border bg-bg/50 text-muted uppercase font-semibold">
            <tr>
              <th className="p-3.5">Size Code</th>
              <th className="p-3.5">Display Name</th>
              <th className="p-3.5">Price Adjustment</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sizes.map((s) => (
              <tr key={s.id} className="hover:bg-surface-hover">
                <td className="p-3.5 font-mono font-bold text-amber-600">{s.code}</td>
                <td className="p-3.5 font-bold text-text">{s.name}</td>
                <td className="p-3.5 text-muted">
                  {s.price_adjustment_paisa > 0 ? `+${formatPaisa(s.price_adjustment_paisa)}` : 'Standard Price'}
                </td>
                <td className="p-3.5 text-right">
                  <form action={deleteTShirtSize.bind(null, s.id)}>
                    <button type="submit" className="text-rose-600 font-bold hover:underline">
                      Delete
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
