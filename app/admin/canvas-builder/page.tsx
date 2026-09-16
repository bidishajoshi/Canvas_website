import { requireAdminUser } from '@/lib/adminAuth';
import { createAdminClient } from '@/lib/supabase/admin';
import { formatPaisa } from '@/lib/utils';
import {
  createCanvasCategory,
  deleteCanvasCategory,
  createPanelType,
  deletePanelType,
  createCanvasSize,
  deleteCanvasSize,
  createFrame,
  deleteFrame,
  createFinish,
  deleteFinish,
} from './actions';
import { filterDeleted, getCustomCanvasCategories } from '@/lib/adminStore';

const DEFAULT_CANVAS_TYPES = [
  { id: 'vastu_horses', name: '7 Running Horses (Vastu)', icon: '🐎' },
  { id: 'buddha', name: 'Buddha & Spiritual', icon: '🪷' },
  { id: 'portrait', name: 'Personal Portrait', icon: '🖼️' },
  { id: 'family', name: 'Family & Memories', icon: '👨‍👩‍👧‍👦' },
  { id: 'couple', name: 'Couple & Romance', icon: '❤️' },
  { id: 'landscape', name: 'Landscape & Nature', icon: '🏞️' },
  { id: 'abstract', name: 'Modern Abstract', icon: '🎨' },
  { id: 'other', name: 'Custom Design', icon: '✨' },
];

export default async function CanvasBuilderAdminPage() {
  await requireAdminUser();
  const supabase = createAdminClient();

  const [
    { data: rawCategories },
    { data: rawPanelTypes },
    { data: rawSizes },
    { data: rawFrames },
    { data: rawFinishes },
  ] = await Promise.all([
    supabase.from('categories').select('*').order('sort_order', { ascending: true }),
    supabase.from('panel_types').select('*').order('sort_order', { ascending: true }),
    supabase
      .from('canvas_sizes')
      .select('*, panel_types(name)')
      .order('sort_order', { ascending: true }),
    supabase.from('frames').select('*').order('sort_order', { ascending: true }),
    supabase.from('finishes').select('*').order('sort_order', { ascending: true }),
  ]);

  const customCats = getCustomCanvasCategories();
  const dbCats = (rawCategories ?? []).map((c: any) => ({
    id: c.id,
    name: c.name,
    icon: c.description?.includes('|') ? c.description.split('|')[0] : '🖼️',
    description: c.description?.includes('|') ? c.description.split('|')[1] : c.description,
  }));

  // Combine default categories with custom & database categories
  const categoriesMap = new Map<string, { id: string; name: string; icon: string; description?: string }>();
  for (const item of [...DEFAULT_CANVAS_TYPES, ...customCats, ...dbCats]) {
    categoriesMap.set(item.id, item);
  }
  const categoriesList = filterDeleted(Array.from(categoriesMap.values()));

  const panelTypes = filterDeleted(rawPanelTypes ?? []);
  const sizes = filterDeleted(rawSizes ?? []);
  const frames = filterDeleted(rawFrames ?? []);
  const finishes = filterDeleted(rawFinishes ?? []);

  return (
    <div className="space-y-10">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
          ⚙️ Admin CMS Control Panel
        </span>
        <h1 className="font-display text-2xl font-extrabold text-text mt-2">
          Canvas Builder Configuration CMS
        </h1>
        <p className="text-xs text-muted mt-1">
          Manage Canvas Categories, 1 to 7 Panel layouts, canvas sizes, floating frames, and finishes.
        </p>
      </div>

      {/* CANVAS CATEGORIES MANAGEMENT */}
      <section className="rounded-xl border border-border bg-surface/50 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h2 className="font-bold text-lg text-text flex items-center gap-2">
              <span>🖼️</span> Canvas Builder Categories
            </h2>
            <p className="text-xs text-muted">
              Add new categories with custom icons to be chosen by customers in Step 1 of the Custom Canvas Builder.
            </p>
          </div>
          <span className="text-xs font-bold text-amber-600 bg-amber-500/10 px-2.5 py-1 rounded-md">
            {categoriesList.length} Categories
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {categoriesList.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center justify-between rounded-xl border border-border bg-surface p-3 text-sm shadow-sm"
            >
              <div className="flex items-center gap-2.5 overflow-hidden">
                <span className="text-xl shrink-0">{cat.icon}</span>
                <span className="font-bold text-text truncate">{cat.name}</span>
              </div>
              <form action={deleteCanvasCategory.bind(null, cat.id)}>
                <button
                  type="submit"
                  className="text-xs text-red-600 hover:text-red-700 font-semibold hover:underline shrink-0 ml-1"
                >
                  Delete
                </button>
              </form>
            </div>
          ))}
        </div>

        {/* Add Canvas Category Form */}
        <div className="mt-4 pt-4 border-t border-border">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted mb-3">
            Add New Canvas Category
          </h3>
          <form action={createCanvasCategory} className="flex flex-wrap items-end gap-3">
            <LabeledInput label="Category Name" name="name" placeholder="e.g. Vintage Floral Art" required />
            <LabeledInput label="Emoji / Icon" name="icon" defaultValue="🖼️" placeholder="e.g. 🌸" required />
            <LabeledInput label="Description (Optional)" name="description" placeholder="e.g. Classic retro floral decor" />
            <SubmitButton>+ Add Category</SubmitButton>
          </form>
        </div>
      </section>

      {/* PANEL TYPES (1, 2, 3, 4, 5, 7 Panels) */}
      <section className="rounded-xl border border-border bg-surface/50 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h2 className="font-bold text-lg text-text flex items-center gap-2">
              <span>🖼️</span> Panel Configurations (1, 2, 3, 4, 5, 7 Panels)
            </h2>
            <p className="text-xs text-muted">
              Enable or add new multi-piece split canvas configurations.
            </p>
          </div>
          <span className="text-xs font-bold text-amber-600 bg-amber-500/10 px-2.5 py-1 rounded-md">
            {(panelTypes ?? []).length} Active Layouts
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {(panelTypes ?? []).map((p) => (
            <div key={p.id} className="relative flex flex-col justify-between rounded-xl border border-border bg-surface p-4 text-sm shadow-sm space-y-3">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-text">{p.name}</span>
                  <span className="px-2 py-0.5 rounded bg-pink-500/10 text-pink-600 border border-pink-500/20 font-mono text-xs font-bold">
                    {p.panel_count}P
                  </span>
                </div>
                <p className="text-xs text-muted mt-1">
                  {p.description || `${p.panel_count} split canvas panels.`}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs">
                <span className="text-emerald-600 font-semibold">● Published</span>
                <form action={deletePanelType.bind(null, p.id)}>
                  <button type="submit" className="text-red-600 hover:text-red-700 font-semibold hover:underline">
                    Delete
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>

        {/* Add Panel Form */}
        <div className="mt-4 pt-4 border-t border-border">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted mb-3">
            Add New Panel Configuration
          </h3>
          <form action={createPanelType} className="flex flex-wrap items-end gap-3">
            <LabeledInput label="Layout Name" name="name" placeholder="e.g. 7 Piece (Panoramic Multi)" required />
            <LabeledInput label="Panel Count" name="panel_count" type="number" defaultValue="1" min="1" max="10" required />
            <LabeledInput label="Description" name="description" placeholder="e.g. Panoramic wide wall layout" />
            <SubmitButton>+ Add Panel Layout</SubmitButton>
          </form>
        </div>
      </section>

      {/* CANVAS SIZES */}
      <section className="rounded-xl border border-border bg-surface/50 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h2 className="font-bold text-lg text-text flex items-center gap-2">
              <span>📏</span> Canvas Sizes &amp; Per-Panel Dimensions
            </h2>
            <p className="text-xs text-muted">
              Configure width/height, price adjustment, per-panel breakdown, and recommended room.
            </p>
          </div>
          <span className="text-xs font-bold text-amber-600 bg-amber-500/10 px-2.5 py-1 rounded-md">
            {(sizes ?? []).length} Sizes Defined
          </span>
        </div>

        <div className="space-y-3">
          {(sizes ?? []).map((s: any) => (
            <div key={s.id} className="flex flex-col sm:flex-row sm:items-center justify-between rounded-xl border border-border bg-surface p-4 text-sm gap-3 shadow-sm">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-text">{s.name}</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-600">
                    {s.panel_types?.name ?? 'Panel Layout'}
                  </span>
                  {s.sizing_mode && (
                    <span className="text-[10px] font-mono text-muted bg-surface-hover px-1.5 py-0.5 rounded border border-border">
                      {s.sizing_mode}
                    </span>
                  )}
                </div>
                {s.each_panel_size && (
                  <p className="text-xs text-pink-600 font-mono">
                    Per Panel: {s.each_panel_size}
                  </p>
                )}
                {s.recommended_room && (
                  <p className="text-xs text-emerald-600 font-medium">
                    Best for: {s.recommended_room}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-4">
                <span className="font-extrabold text-amber-600 font-mono text-base">
                  {formatPaisa(s.price_adjustment_paisa)}
                </span>
                <form action={deleteCanvasSize.bind(null, s.id)}>
                  <button type="submit" className="text-xs text-red-600 hover:text-red-700 font-semibold hover:underline">
                    Delete
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>

        {/* Add Canvas Size Form */}
        <div className="mt-4 pt-4 border-t border-border">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted mb-3">
            Add New Canvas Size
          </h3>
          <form action={createCanvasSize} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 items-end">
            <LabeledInput label="Size Label" name="name" placeholder="60 x 30 Quad Split" required />
            <div>
              <label className="text-xs text-muted font-medium">Panel Layout</label>
              <select name="panel_type_id" required className="mt-1 w-full rounded-xl border border-border bg-bg px-3 py-2 text-sm">
                {(panelTypes ?? []).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.panel_count}P)
                  </option>
                ))}
              </select>
            </div>
            <LabeledInput label="Overall Width (Inches)" name="width" type="number" step="0.1" required />
            <LabeledInput label="Overall Height (Inches)" name="height" type="number" step="0.1" required />
            <div>
              <label className="text-xs text-muted font-medium">Sizing Mode</label>
              <select name="sizing_mode" className="mt-1 w-full rounded-xl border border-border bg-bg px-3 py-2 text-sm">
                <option value="overall_combined">Total Overall Combined Dimensions</option>
                <option value="per_panel">Per-Panel Individual Dimensions</option>
              </select>
            </div>
            <LabeledInput label="Per Panel Breakdown" name="each_panel_size" placeholder="4 @ 15x30 in each" />
            <LabeledInput label="Recommended Room" name="recommended_room" placeholder="Living Room Sofa Wall" />
            <LabeledInput label="Price (NPR)" name="price" type="number" step="1" required />
            <div className="sm:col-span-2 md:col-span-4">
              <SubmitButton>+ Add Canvas Size</SubmitButton>
            </div>
          </form>
        </div>
      </section>

      {/* FRAMES & FINISHES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* FRAMES */}
        <section className="rounded-xl border border-border bg-surface/50 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 className="font-bold text-lg text-text flex items-center gap-2">
              <span>🖼️</span> Outer Frames
            </h2>
            <span className="text-xs font-bold text-amber-600 bg-amber-500/10 px-2.5 py-1 rounded-md">
              {(frames ?? []).length} Options
            </span>
          </div>

          <ul className="space-y-2">
            {(frames ?? []).map((f) => (
              <li key={f.id} className="flex items-center justify-between rounded-xl border border-border bg-surface p-3 text-sm">
                <span className="font-medium">{f.name}</span>
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-amber-600">
                    +{formatPaisa(f.price_paisa)}
                  </span>
                  <form action={deleteFrame.bind(null, f.id)}>
                    <button type="submit" className="text-xs text-red-600 hover:underline">
                      Delete
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>

          <form action={createFrame} className="pt-3 border-t border-border flex flex-wrap items-end gap-2">
            <LabeledInput label="Frame Name" name="name" placeholder="Natural Wood Floating Frame" required />
            <LabeledInput label="Add-on Price (NPR)" name="price" type="number" step="1" required />
            <SubmitButton>+ Add Frame</SubmitButton>
          </form>
        </section>

        {/* FINISHES */}
        <section className="rounded-xl border border-border bg-surface/50 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 className="font-bold text-lg text-text flex items-center gap-2">
              <span>✨</span> Canvas Finishes
            </h2>
            <span className="text-xs font-bold text-amber-600 bg-amber-500/10 px-2.5 py-1 rounded-md">
              {(finishes ?? []).length} Options
            </span>
          </div>

          <ul className="space-y-2">
            {(finishes ?? []).map((f) => (
              <li key={f.id} className="flex items-center justify-between rounded-xl border border-border bg-surface p-3 text-sm">
                <span className="font-medium">{f.name}</span>
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-amber-600">
                    +{formatPaisa(f.price_paisa)}
                  </span>
                  <form action={deleteFinish.bind(null, f.id)}>
                    <button type="submit" className="text-xs text-red-600 hover:underline">
                      Delete
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>

          <form action={createFinish} className="pt-3 border-t border-border flex flex-wrap items-end gap-2">
            <LabeledInput label="Finish Name" name="name" placeholder="Ultra Matte UV Protect" required />
            <LabeledInput label="Add-on Price (NPR)" name="price" type="number" step="1" defaultValue="0" required />
            <SubmitButton>+ Add Finish</SubmitButton>
          </form>
        </section>
      </div>
    </div>
  );
}

function LabeledInput({
  label,
  name,
  type = 'text',
  step,
  min,
  max,
  defaultValue,
  placeholder,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  step?: string;
  min?: string;
  max?: string;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div className="flex-1 min-w-[140px]">
      <label className="text-xs text-muted font-medium">{label}</label>
      <input
        name={name}
        type={type}
        step={step}
        min={min}
        max={max}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        className="mt-1 block w-full rounded-xl border border-border bg-bg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
      />
    </div>
  );
}

function SubmitButton({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="submit"
      className="rounded-xl bg-amber-500 hover:bg-amber-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition-all"
    >
      {children}
    </button>
  );
}
