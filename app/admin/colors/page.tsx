import { requireAdminUser } from '@/lib/adminAuth';
import { createAdminClient } from '@/lib/supabase/admin';
import { addTShirtColor, deleteTShirtColor } from './actions';
import type { TShirtColor } from '@/lib/types';
import { filterDeleted } from '@/lib/adminStore';

export default async function AdminColorsPage() {
  await requireAdminUser();
  const supabase = createAdminClient();

  const { data: dbColors } = await supabase
    .from('tshirt_colors')
    .select('*')
    .order('sort_order', { ascending: true });

  const defaultColors: TShirtColor[] = [
    { id: 'c1', name: 'White', color_hex: '#ffffff', additional_price_paisa: 0, active: true, sort_order: 1 },
    { id: 'c2', name: 'Charcoal Black', color_hex: '#18181b', additional_price_paisa: 0, active: true, sort_order: 2 },
    { id: 'c3', name: 'Heather Grey', color_hex: '#94a3b8', additional_price_paisa: 0, active: true, sort_order: 3 },
    { id: 'c4', name: 'Crimson Red', color_hex: '#991b1b', additional_price_paisa: 0, active: true, sort_order: 4 },
    { id: 'c5', name: 'Navy Blue', color_hex: '#1e3a8a', additional_price_paisa: 0, active: true, sort_order: 5 },
    { id: 'c6', name: 'Pastel Pink', color_hex: '#f472b6', additional_price_paisa: 0, active: true, sort_order: 6 },
    { id: 'c7', name: 'Beige / Cream', color_hex: '#fef3c7', additional_price_paisa: 0, active: true, sort_order: 7 },
  ];

  const colors = filterDeleted(dbColors && dbColors.length > 0 ? (dbColors as TShirtColor[]) : defaultColors);

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="font-display text-2xl font-bold">T-Shirt Colors Management</h1>
        <p className="text-xs text-muted mt-1">
          Add, edit, or delete available apparel colors and hex swatches for live mockup rendering.
        </p>
      </div>

      {/* Add New Color Form */}
      <form action={addTShirtColor} className="rounded-2xl border border-border bg-surface p-5 space-y-4 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-amber-600">Add New Color Swatch</h3>

        <div className="grid sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-semibold text-muted block mb-1">Color Name *</label>
            <input
              type="text"
              name="name"
              required
              placeholder="e.g. Pastel Pink"
              className="w-full px-3 py-2 rounded-xl border border-border bg-bg text-xs focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted block mb-1">Color Hex (#RRGGBB) *</label>
            <input
              type="text"
              name="color_hex"
              required
              defaultValue="#ffffff"
              placeholder="#ffffff"
              className="w-full px-3 py-2 rounded-xl border border-border bg-bg text-xs font-mono focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted block mb-1">Price Add-On (Rs.)</label>
            <input
              type="number"
              name="additional_price_rs"
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
          + Save Color Swatch
        </button>
      </form>

      {/* Colors Grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {colors.map((c) => (
          <div
            key={c.id}
            className="p-4 rounded-2xl border border-border bg-surface flex items-center justify-between shadow-sm"
          >
            <div className="flex items-center gap-3">
              <span
                className="h-8 w-8 rounded-full border border-black/20 shadow-inner"
                style={{ backgroundColor: c.color_hex }}
              />
              <div>
                <h4 className="font-bold text-text text-sm">{c.name}</h4>
                <span className="text-xs text-muted font-mono">{c.color_hex}</span>
              </div>
            </div>

            <form action={deleteTShirtColor.bind(null, c.id)}>
              <button type="submit" className="text-xs text-rose-600 font-bold hover:underline">
                Delete
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
