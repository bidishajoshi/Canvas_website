import { requireAdminUser } from '@/lib/adminAuth';
import { createAdminClient } from '@/lib/supabase/admin';
import { formatPaisa } from '@/lib/utils';
import {
  createPanelType,
  deletePanelType,
  createCanvasSize,
  deleteCanvasSize,
  createFrame,
  deleteFrame,
  createFinish,
  deleteFinish,
} from './actions';

export default async function CanvasBuilderAdminPage() {
  await requireAdminUser();
  const supabase = createAdminClient();

  const [{ data: panelTypes }, { data: sizes }, { data: frames }, { data: finishes }] =
    await Promise.all([
      supabase.from('panel_types').select('*').order('sort_order', { ascending: true }),
      supabase
        .from('canvas_sizes')
        .select('*, panel_types(name)')
        .order('sort_order', { ascending: true }),
      supabase.from('frames').select('*').order('sort_order', { ascending: true }),
      supabase.from('finishes').select('*').order('sort_order', { ascending: true }),
    ]);

  return (
    <div className="space-y-12">
      <h1 className="font-display text-2xl font-semibold">Canvas Builder Settings</h1>

      {/* PANEL TYPES */}
      <section>
        <h2 className="font-semibold">Panel Types</h2>
        <ul className="mt-3 space-y-2">
          {(panelTypes ?? []).map((p) => (
            <li key={p.id} className="flex items-center justify-between rounded-card border border-border p-3 text-sm">
              <span>
                {p.name} ({p.panel_count} panel{p.panel_count > 1 ? 's' : ''})
              </span>
              <form action={deletePanelType.bind(null, p.id)}>
                <button className="text-red-600 underline">Delete</button>
              </form>
            </li>
          ))}
        </ul>
        <form action={createPanelType} className="mt-3 flex flex-wrap items-end gap-2">
          <LabeledInput label="Name" name="name" placeholder="Triptych Canvas" required />
          <LabeledInput label="Panel Count" name="panel_count" type="number" defaultValue="1" required />
          <LabeledInput label="Description" name="description" />
          <SubmitButton>Add Panel Type</SubmitButton>
        </form>
      </section>

      {/* CANVAS SIZES */}
      <section>
        <h2 className="font-semibold">Canvas Sizes</h2>
        <ul className="mt-3 space-y-2">
          {(sizes ?? []).map((s: any) => (
            <li key={s.id} className="flex items-center justify-between rounded-card border border-border p-3 text-sm">
              <span>
                {s.name} — {s.panel_types?.name ?? 'Unknown panel type'} — {formatPaisa(s.price_adjustment_paisa)}
              </span>
              <form action={deleteCanvasSize.bind(null, s.id)}>
                <button className="text-red-600 underline">Delete</button>
              </form>
            </li>
          ))}
        </ul>
        <form action={createCanvasSize} className="mt-3 flex flex-wrap items-end gap-2">
          <LabeledInput label="Name" name="name" placeholder="16 x 24" required />
          <div>
            <label className="text-xs text-muted">Panel Type</label>
            <select name="panel_type_id" required className="mt-1 rounded-card border border-border bg-bg px-3 py-2 text-sm">
              {(panelTypes ?? []).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <LabeledInput label="Width" name="width" type="number" step="0.1" required />
          <LabeledInput label="Height" name="height" type="number" step="0.1" required />
          <div>
            <label className="text-xs text-muted">Unit</label>
            <select name="unit" className="mt-1 rounded-card border border-border bg-bg px-3 py-2 text-sm">
              <option value="inch">inch</option>
              <option value="cm">cm</option>
            </select>
          </div>
          <LabeledInput label="Price (NPR)" name="price" type="number" step="0.01" required />
          <SubmitButton>Add Size</SubmitButton>
        </form>
      </section>

      {/* FRAMES */}
      <section>
        <h2 className="font-semibold">Frames</h2>
        <ul className="mt-3 space-y-2">
          {(frames ?? []).map((f) => (
            <li key={f.id} className="flex items-center justify-between rounded-card border border-border p-3 text-sm">
              <span>
                {f.name} — +{formatPaisa(f.price_paisa)}
              </span>
              <form action={deleteFrame.bind(null, f.id)}>
                <button className="text-red-600 underline">Delete</button>
              </form>
            </li>
          ))}
        </ul>
        <form action={createFrame} className="mt-3 flex flex-wrap items-end gap-2">
          <LabeledInput label="Name" name="name" placeholder="Black Frame" required />
          <LabeledInput label="Price (NPR)" name="price" type="number" step="0.01" required />
          <SubmitButton>Add Frame</SubmitButton>
        </form>
      </section>

      {/* FINISHES */}
      <section>
        <h2 className="font-semibold">Finishes</h2>
        <ul className="mt-3 space-y-2">
          {(finishes ?? []).map((f) => (
            <li key={f.id} className="flex items-center justify-between rounded-card border border-border p-3 text-sm">
              <span>
                {f.name} — +{formatPaisa(f.price_paisa)}
              </span>
              <form action={deleteFinish.bind(null, f.id)}>
                <button className="text-red-600 underline">Delete</button>
              </form>
            </li>
          ))}
        </ul>
        <form action={createFinish} className="mt-3 flex flex-wrap items-end gap-2">
          <LabeledInput label="Name" name="name" placeholder="Matte" required />
          <LabeledInput label="Price (NPR)" name="price" type="number" step="0.01" required />
          <SubmitButton>Add Finish</SubmitButton>
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
      <label className="text-xs text-muted">{label}</label>
      <input
        name={name}
        type={type}
        step={step}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        className="mt-1 block rounded-card border border-border bg-bg px-3 py-2 text-sm"
      />
    </div>
  );
}

function SubmitButton({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="submit"
      className="rounded-card bg-accent-yellow px-4 py-2 text-sm font-semibold text-[color:var(--color-accent-yellow-contrast)]"
    >
      {children}
    </button>
  );
}
