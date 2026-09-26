import { requireAdminUser } from '@/lib/adminAuth';
import { createAdminClient } from '@/lib/supabase/admin';
import { formatPaisa } from '@/lib/utils';
import { deleteCanvasProduct } from './actions';
import type { CanvasProduct } from '@/lib/types';
import { filterDeleted, getCanvasProductsStore } from '@/lib/adminStore';
import { CanvasProductForm } from '@/components/admin/CanvasProductForm';
import { DeleteButton } from '@/components/admin/DeleteButton';

export default async function AdminCanvasProductsPage() {
  await requireAdminUser();
  const supabase = createAdminClient();

  const { data } = await supabase
    .from('canvas_products')
    .select('*')
    .order('sort_order', { ascending: true });

  const rawProducts = (data && data.length > 0) ? (data as CanvasProduct[]) : getCanvasProductsStore();
  const products = filterDeleted(rawProducts);

  return (
    <div className="space-y-10">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
          📦 Ready-Made Canvas Products CMS
        </span>
        <h1 className="font-display text-2xl font-extrabold text-text mt-2">
          Ready-Made Canvas Collection &amp; Best Seller Manager
        </h1>
        <p className="text-xs text-muted mt-1">
          Post and edit ready-made panel canvas sets. Control placement across Best Sellers, Featured, and Homepage Cozy Canvas Collection.
        </p>
      </div>

      {/* Existing Ready-Made Canvas Products Grid */}
      <section className="rounded-xl border border-border bg-surface/50 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h2 className="font-bold text-lg text-text flex items-center gap-2">
            <span>🖼️</span> Published Ready-Made Canvases
          </h2>
          <span className="text-xs font-bold text-amber-600 bg-amber-500/10 px-2.5 py-1 rounded-md">
            {products.length} Products
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {products.map((item) => (
            <div
              key={item.id}
              className="flex gap-4 p-4 rounded-xl border border-border bg-surface shadow-sm"
            >
              <img
                src={item.main_image_url}
                alt={item.name}
                className="w-24 h-24 object-cover rounded-lg shrink-0"
              />
              <div className="flex-1 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-text line-clamp-1">{item.name}</h3>
                  <span className="px-2 py-0.5 rounded bg-pink-500/10 text-pink-600 font-mono font-bold text-[10px]">
                    {item.panel_count} Panels
                  </span>
                </div>
                <p className="text-muted">Size: {item.size_label}</p>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-amber-600 text-sm">
                    {formatPaisa(item.discount_price_paisa || item.original_price_paisa)}
                  </span>
                  {item.discount_price_paisa && (
                    <span className="text-muted line-through">
                      {formatPaisa(item.original_price_paisa)}
                    </span>
                  )}
                  {item.discount_percentage && (
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-bold text-[10px]">
                      {item.discount_percentage}% OFF
                    </span>
                  )}
                </div>

                {/* Placement Badges */}
                <div className="flex flex-wrap gap-1 pt-1">
                  {item.is_best_seller && (
                    <span className="px-1.5 py-0.5 rounded bg-amber-500 text-white font-bold text-[9px]">
                      Best Seller
                    </span>
                  )}
                  {item.is_featured && (
                    <span className="px-1.5 py-0.5 rounded bg-blue-600 text-white font-bold text-[9px]">
                      Featured
                    </span>
                  )}
                  {item.show_on_homepage && (
                    <span className="px-1.5 py-0.5 rounded bg-purple-600 text-white font-bold text-[9px]">
                      Homepage
                    </span>
                  )}
                </div>

                <div className="pt-2 flex justify-end">
                  <DeleteButton action={deleteCanvasProduct.bind(null, item.id)} itemName={item.name} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Add New Ready-Made Canvas Product Form with Automatic Image Optimization */}
      <section className="rounded-xl border border-border bg-surface/50 p-6 space-y-4">
        <h2 className="font-bold text-lg text-text flex items-center gap-2 border-b border-border pb-3">
          <span>➕</span> Add New Ready-Made Canvas Product
        </h2>

        <CanvasProductForm />
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
