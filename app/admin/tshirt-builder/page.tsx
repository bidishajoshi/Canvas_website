import { requireAdminUser } from '@/lib/adminAuth';
import { createAdminClient } from '@/lib/supabase/admin';
import { formatPaisa } from '@/lib/utils';

export default async function AdminTShirtBuilderPage() {
  await requireAdminUser();
  const supabase = createAdminClient();

  const [
    { data: tshirtTypes },
    { data: colors },
    { data: sizes },
    { data: printLocations },
    { data: designs },
  ] = await Promise.all([
    supabase.from('tshirt_types').select('*').order('sort_order', { ascending: true }),
    supabase.from('tshirt_colors').select('*').order('sort_order', { ascending: true }),
    supabase.from('tshirt_sizes').select('*').order('sort_order', { ascending: true }),
    supabase.from('print_locations').select('*').order('sort_order', { ascending: true }),
    supabase.from('tshirt_designs').select('*').order('sort_order', { ascending: true }),
  ]);

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">T-Shirt Builder Management</h1>
          <p className="text-xs text-muted mt-1">
            Manage custom T-shirt models, color palettes, sizing adjustments, print locations, and design templates.
          </p>
        </div>
      </div>

      {/* T-Shirt Models */}
      <section className="rounded-xl border border-border p-6 bg-surface space-y-4">
        <h2 className="text-base font-bold">1. T-Shirt Models &amp; Base Prices</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {(tshirtTypes || []).map((type) => (
            <div key={type.id} className="p-3.5 rounded-lg border border-border bg-bg flex justify-between items-center text-sm">
              <div>
                <p className="font-bold text-text">{type.name}</p>
                <p className="text-xs text-muted">{type.description}</p>
              </div>
              <span className="font-bold text-amber-600">{formatPaisa(type.base_price_paisa)}</span>
            </div>
          ))}
          {(!tshirtTypes || tshirtTypes.length === 0) && (
            <p className="text-xs text-muted">No custom models added yet. Default seed model active.</p>
          )}
        </div>
      </section>

      {/* Colors & Palette */}
      <section className="rounded-xl border border-border p-6 bg-surface space-y-4">
        <h2 className="text-base font-bold">2. Color Palettes</h2>
        <div className="flex flex-wrap gap-3">
          {(colors || []).map((color) => (
            <div key={color.id} className="flex items-center gap-2 p-2.5 rounded-lg border border-border bg-bg text-xs">
              <span className="h-4 w-4 rounded-full border border-black/20" style={{ backgroundColor: color.color_hex }} />
              <span className="font-semibold">{color.name}</span>
            </div>
          ))}
          {(!colors || colors.length === 0) && (
            <p className="text-xs text-muted">Standard default palette active (Black, White, Grey, Red, Navy, Pink).</p>
          )}
        </div>
      </section>

      {/* Print Locations */}
      <section className="rounded-xl border border-border p-6 bg-surface space-y-4">
        <h2 className="text-base font-bold">3. Print Area Locations &amp; Charges</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {(printLocations || []).map((loc) => (
            <div key={loc.id} className="p-3 rounded-lg border border-border bg-bg text-xs flex justify-between items-center">
              <span className="font-semibold">{loc.name}</span>
              <span className="font-bold text-amber-600">+{formatPaisa(loc.additional_price_paisa)}</span>
            </div>
          ))}
          {(!printLocations || printLocations.length === 0) && (
            <p className="text-xs text-muted">Default print locations active (Front Chest, Back, Left Chest).</p>
          )}
        </div>
      </section>

      {/* Graphic Artwork Library */}
      <section className="rounded-xl border border-border p-6 bg-surface space-y-4">
        <h2 className="text-base font-bold">4. Graphic Design Artwork Library</h2>
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
          {(designs || []).map((design) => (
            <div key={design.id} className="p-3 rounded-lg border border-border bg-bg text-xs space-y-1">
              <p className="font-semibold text-text truncate">{design.name}</p>
              <p className="text-[10px] text-muted uppercase tracking-wider">{design.theme}</p>
              <p className="font-bold text-amber-600">{design.price_paisa > 0 ? `+${formatPaisa(design.price_paisa)}` : 'Free'}</p>
            </div>
          ))}
          {(!designs || designs.length === 0) && (
            <p className="text-xs text-muted col-span-full">Default artwork catalog active.</p>
          )}
        </div>
      </section>
    </div>
  );
}
