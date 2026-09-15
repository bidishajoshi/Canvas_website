import Image from 'next/image';
import { requireAdminUser } from '@/lib/adminAuth';
import { createAdminClient } from '@/lib/supabase/admin';
import { formatPaisa } from '@/lib/utils';
import { filterDeleted } from '@/lib/adminStore';
import {
  addTShirtType,
  deleteTShirtType,
  addTShirtColor,
  deleteTShirtColor,
  addPrintLocation,
  deletePrintLocation,
  addTShirtDesign,
  deleteTShirtDesign,
} from './actions';

export default async function AdminTShirtBuilderPage() {
  await requireAdminUser();
  const supabase = createAdminClient();

  const [
    { data: tshirtTypesData },
    { data: colorsData },
    { data: sizesData },
    { data: printLocationsData },
    { data: designsData },
  ] = await Promise.all([
    supabase.from('tshirt_types').select('*').order('sort_order', { ascending: true }),
    supabase.from('tshirt_colors').select('*').order('sort_order', { ascending: true }),
    supabase.from('tshirt_sizes').select('*').order('sort_order', { ascending: true }),
    supabase.from('print_locations').select('*').order('sort_order', { ascending: true }),
    supabase.from('tshirt_designs').select('*').order('sort_order', { ascending: true }),
  ]);

  const tshirtTypes = filterDeleted(tshirtTypesData || []);
  const colors = filterDeleted(colorsData || []);
  const printLocations = filterDeleted(printLocationsData || []);
  const designs = filterDeleted(designsData || []);

  return (
    <div className="space-y-10 max-w-5xl">
      <div>
        <h1 className="font-display text-2xl font-bold">T-Shirt Builder Management</h1>
        <p className="text-xs text-muted mt-1">
          Manage custom T-shirt models, color palettes, print locations, and design templates. Add new models or delete items with real-time updates.
        </p>
      </div>

      {/* 1. T-Shirt Models & Base Prices */}
      <section className="rounded-2xl border border-border bg-surface p-6 space-y-6 shadow-sm">
        <h2 className="text-base font-bold flex items-center gap-2 text-text">
          <span>👕</span> 1. T-Shirt Models &amp; Base Prices ({tshirtTypes.length})
        </h2>

        {/* Add Model Form */}
        <form action={addTShirtType} className="p-4 rounded-xl bg-bg border border-border space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-600">+ Add New T-Shirt Model</h3>
          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted block mb-1">Model Name *</label>
              <input
                type="text"
                name="name"
                required
                placeholder="e.g. Premium Oversized Streetwear Tee"
                className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-xs focus:outline-none focus:ring-2 focus:ring-amber-600"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted block mb-1">Description</label>
              <input
                type="text"
                name="description"
                placeholder="240 GSM Combed Cotton Heavyweight"
                className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-xs focus:outline-none focus:ring-2 focus:ring-amber-600"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted block mb-1">Base Price (Rs.) *</label>
              <input
                type="number"
                name="base_price"
                required
                defaultValue={799}
                placeholder="799"
                className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-xs focus:outline-none focus:ring-2 focus:ring-amber-600"
              />
            </div>
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition-all"
          >
            Save T-Shirt Model
          </button>
        </form>

        {/* List of Models */}
        <div className="grid gap-3 sm:grid-cols-2">
          {tshirtTypes.map((type) => (
            <div key={type.id} className="p-4 rounded-xl border border-border bg-bg flex justify-between items-center text-xs">
              <div>
                <p className="font-bold text-text text-sm">{type.name}</p>
                <p className="text-muted">{type.description}</p>
                <p className="font-extrabold text-amber-600 mt-1">{formatPaisa(type.base_price_paisa)}</p>
              </div>
              <form action={deleteTShirtType.bind(null, type.id)}>
                <button type="submit" className="text-rose-600 font-bold hover:underline">
                  Delete
                </button>
              </form>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Color Palettes */}
      <section className="rounded-2xl border border-border bg-surface p-6 space-y-6 shadow-sm">
        <h2 className="text-base font-bold flex items-center gap-2 text-text">
          <span>🎨</span> 2. Color Palettes ({colors.length})
        </h2>

        {/* Add Color Form */}
        <form action={addTShirtColor} className="p-4 rounded-xl bg-bg border border-border space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-600">+ Add New Color Option</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted block mb-1">Color Name *</label>
              <input
                type="text"
                name="name"
                required
                placeholder="e.g. Sage Green"
                className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-xs focus:outline-none focus:ring-2 focus:ring-amber-600"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted block mb-1">HEX Code *</label>
              <input
                type="text"
                name="color_hex"
                required
                defaultValue="#87A96B"
                placeholder="#87A96B"
                className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-600"
              />
            </div>
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition-all"
          >
            Save Color Palette
          </button>
        </form>

        {/* List of Colors */}
        <div className="flex flex-wrap gap-3">
          {colors.map((color) => (
            <div key={color.id} className="flex items-center gap-2.5 p-3 rounded-xl border border-border bg-bg text-xs">
              <span className="h-5 w-5 rounded-full border border-black/20 shadow-sm shrink-0" style={{ backgroundColor: color.color_hex }} />
              <div>
                <span className="font-bold block">{color.name}</span>
                <span className="text-[10px] text-muted font-mono">{color.color_hex}</span>
              </div>
              <form action={deleteTShirtColor.bind(null, color.id)} className="ml-2">
                <button type="submit" className="text-rose-600 font-bold hover:underline text-[11px]">
                  ✕
                </button>
              </form>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Print Locations & Charges */}
      <section className="rounded-2xl border border-border bg-surface p-6 space-y-6 shadow-sm">
        <h2 className="text-base font-bold flex items-center gap-2 text-text">
          <span>📐</span> 3. Print Locations &amp; Charges ({printLocations.length})
        </h2>

        {/* Add Location Form */}
        <form action={addPrintLocation} className="p-4 rounded-xl bg-bg border border-border space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-600">+ Add Print Placement Area</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted block mb-1">Print Location Name *</label>
              <input
                type="text"
                name="name"
                required
                placeholder="e.g. Left Sleeve Logo"
                className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-xs focus:outline-none focus:ring-2 focus:ring-amber-600"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted block mb-1">Additional Charge (Rs.)</label>
              <input
                type="number"
                name="additional_price"
                defaultValue={150}
                placeholder="150"
                className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-xs focus:outline-none focus:ring-2 focus:ring-amber-600"
              />
            </div>
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition-all"
          >
            Save Print Location
          </button>
        </form>

        {/* List of Locations */}
        <div className="grid gap-3 sm:grid-cols-3">
          {printLocations.map((loc) => (
            <div key={loc.id} className="p-3.5 rounded-xl border border-border bg-bg text-xs flex justify-between items-center">
              <div>
                <span className="font-bold text-text block">{loc.name}</span>
                <span className="font-extrabold text-amber-600">+{formatPaisa(loc.additional_price_paisa)}</span>
              </div>
              <form action={deletePrintLocation.bind(null, loc.id)}>
                <button type="submit" className="text-rose-600 font-bold hover:underline">
                  Delete
                </button>
              </form>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Graphic Design Artwork Library */}
      <section className="rounded-2xl border border-border bg-surface p-6 space-y-6 shadow-sm">
        <h2 className="text-base font-bold flex items-center gap-2 text-text">
          <span>🖼️</span> 4. Graphic Design Artwork Library ({designs.length})
        </h2>

        {/* Add Artwork Form */}
        <form action={addTShirtDesign} className="p-4 rounded-xl bg-bg border border-border space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-600">+ Add New Artwork Design</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted block mb-1">Design Title *</label>
              <input
                type="text"
                name="name"
                required
                placeholder="e.g. Kathmandu Minimalist Skyline"
                className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-xs focus:outline-none focus:ring-2 focus:ring-amber-600"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted block mb-1">Theme / Category</label>
              <input
                type="text"
                name="theme"
                defaultValue="Urban"
                placeholder="Urban / Typography / Nepal"
                className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-xs focus:outline-none focus:ring-2 focus:ring-amber-600"
              />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted block mb-1">Artwork Image URL *</label>
              <input
                type="url"
                name="image_url"
                required
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-xs focus:outline-none focus:ring-2 focus:ring-amber-600"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted block mb-1">Extra Artwork Fee (Rs.)</label>
              <input
                type="number"
                name="price"
                defaultValue={0}
                placeholder="0"
                className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-xs focus:outline-none focus:ring-2 focus:ring-amber-600"
              />
            </div>
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition-all"
          >
            Save Artwork Design
          </button>
        </form>

        {/* List of Designs */}
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
          {designs.map((design) => (
            <div key={design.id} className="p-3 rounded-xl border border-border bg-bg text-xs space-y-2 flex flex-col justify-between">
              <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-zinc-900">
                <Image src={design.image_url} alt={design.name} fill className="object-cover" />
              </div>
              <div>
                <p className="font-bold text-text truncate">{design.name}</p>
                <p className="text-[10px] text-muted uppercase tracking-wider">{design.theme}</p>
                <p className="font-extrabold text-amber-600 mt-0.5">
                  {design.price_paisa > 0 ? `+${formatPaisa(design.price_paisa)}` : 'Free'}
                </p>
              </div>
              <form action={deleteTShirtDesign.bind(null, design.id)}>
                <button type="submit" className="w-full py-1 text-center text-rose-600 font-bold hover:underline text-[11px]">
                  Delete Design
                </button>
              </form>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
