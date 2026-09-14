import { requireAdminUser } from '@/lib/adminAuth';
import { createAdminClient } from '@/lib/supabase/admin';
import { formatPaisa } from '@/lib/utils';
import { addCanvasSize, deleteCanvasSize } from './actions';
import type { CanvasSize } from '@/lib/types';

export default async function AdminCanvasSizesPage() {
  await requireAdminUser();
  const supabase = createAdminClient();

  const { data: dbSizes } = await supabase
    .from('canvas_sizes')
    .select('*')
    .order('sort_order', { ascending: true });

  const defaultCanvasSizes: CanvasSize[] = [
    { id: 'cs1', name: '8 × 10 inch Small Accent', width: 8, height: 10, unit: 'inch', panel_type_id: null, price_adjustment_paisa: 149000, is_recommended: false, active: true, sort_order: 1 },
    { id: 'cs2', name: '10 × 12 inch Small Gallery', width: 10, height: 12, unit: 'inch', panel_type_id: null, price_adjustment_paisa: 199000, is_recommended: false, active: true, sort_order: 2 },
    { id: 'cs3', name: '12 × 16 inch Standard Home', width: 12, height: 16, unit: 'inch', panel_type_id: null, price_adjustment_paisa: 249000, is_recommended: true, active: true, sort_order: 3 },
    { id: 'cs4', name: '16 × 20 inch Medium Living Room', width: 16, height: 20, unit: 'inch', panel_type_id: null, price_adjustment_paisa: 349000, is_recommended: true, active: true, sort_order: 4 },
    { id: 'cs5', name: '18 × 24 inch Large Focal Wall', width: 18, height: 24, unit: 'inch', panel_type_id: null, price_adjustment_paisa: 449000, is_recommended: true, active: true, sort_order: 5 },
    { id: 'cs6', name: '24 × 36 inch Grand Statement', width: 24, height: 36, unit: 'inch', panel_type_id: null, price_adjustment_paisa: 699000, is_recommended: false, active: true, sort_order: 6 },
  ];

  const sizes = dbSizes && dbSizes.length > 0 ? (dbSizes as CanvasSize[]) : defaultCanvasSizes;

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="font-display text-2xl font-bold">Canvas Sizes &amp; Pricing Management</h1>
        <p className="text-xs text-muted mt-1">
          Manage physical dimensions (8×10, 10×12, 12×16, 16×20, 18×24, 24×36 inch) and base price settings for custom canvas wall art.
        </p>
      </div>

      {/* Add New Size Form */}
      <form action={addCanvasSize} className="rounded-2xl border border-border bg-surface p-5 space-y-4 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-amber-600">Add New Canvas Size</h3>

        <div className="grid sm:grid-cols-4 gap-3">
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-muted block mb-1">Size Title *</label>
            <input
              type="text"
              name="name"
              required
              placeholder="e.g. 16 × 20 inch Living Room Focal"
              className="w-full px-3 py-2 rounded-xl border border-border bg-bg text-xs focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted block mb-1">Width (Inch) *</label>
            <input
              type="number"
              name="width"
              required
              defaultValue={16}
              className="w-full px-3 py-2 rounded-xl border border-border bg-bg text-xs focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted block mb-1">Height (Inch) *</label>
            <input
              type="number"
              name="height"
              required
              defaultValue={20}
              className="w-full px-3 py-2 rounded-xl border border-border bg-bg text-xs focus:outline-none"
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-muted block mb-1">Base Price (Rs.) *</label>
            <input
              type="number"
              name="price_rs"
              required
              defaultValue={3490}
              className="w-full px-3 py-2 rounded-xl border border-border bg-bg text-xs focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted block mb-1">Recommended Room</label>
            <input
              type="text"
              name="recommended_room"
              defaultValue="Living Room / Bedroom"
              className="w-full px-3 py-2 rounded-xl border border-border bg-bg text-xs focus:outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition-all active:scale-95"
        >
          + Save Canvas Size
        </button>
      </form>

      {/* Existing Canvas Sizes Table */}
      <div className="rounded-2xl border border-border bg-surface overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-border bg-bg/50 text-muted uppercase font-semibold">
            <tr>
              <th className="p-3.5">Size Title</th>
              <th className="p-3.5">Dimensions</th>
              <th className="p-3.5">Price</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sizes.map((s) => (
              <tr key={s.id} className="hover:bg-surface-hover">
                <td className="p-3.5 font-bold text-text">{s.name}</td>
                <td className="p-3.5 font-mono text-muted">{s.width} × {s.height} {s.unit || 'inch'}</td>
                <td className="p-3.5 font-bold text-amber-600">
                  {formatPaisa(s.price_paisa || s.price_adjustment_paisa)}
                </td>
                <td className="p-3.5 text-right">
                  <form action={deleteCanvasSize.bind(null, s.id)}>
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
