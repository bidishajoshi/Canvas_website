import { requireAdminUser } from '@/lib/adminAuth';
import { createAdminClient } from '@/lib/supabase/admin';
import { formatPaisa } from '@/lib/utils';
import { createCanvasProduct, deleteCanvasProduct } from './actions';
import type { CanvasProduct } from '@/lib/types';
import { filterDeleted } from '@/lib/adminStore';

const DEMO_PRODUCTS: CanvasProduct[] = [
  {
    id: 'demo-1',
    name: '7 Running Horses Vastu Wall Canvas',
    slug: '7-running-horses-vastu-wall-canvas',
    description: 'Breathtaking 5-piece staggered Vastu horse canvas.',
    main_image_url: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&w=800&q=80',
    panel_count: 5,
    size_label: '60" × 32" Total',
    frame_label: 'Black Floating Frame',
    original_price_paisa: 690000,
    discount_price_paisa: 552000,
    discount_percentage: 20,
    is_best_seller: true,
    is_featured: true,
    is_new_arrival: false,
    show_on_homepage: true,
    status: 'published',
    sort_order: 1,
  },
  {
    id: 'demo-2',
    name: 'Himalayan Sunrise Mountain Triptych',
    slug: 'himalayan-sunrise-mountain-triptych',
    description: 'Serene 3-piece mountain peak panorama in morning light.',
    main_image_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    panel_count: 3,
    size_label: '48" × 24" Total',
    frame_label: 'Natural Wood Frame',
    original_price_paisa: 480000,
    discount_price_paisa: 399000,
    discount_percentage: 17,
    is_best_seller: true,
    is_featured: true,
    is_new_arrival: true,
    show_on_homepage: true,
    status: 'published',
    sort_order: 2,
  },
];

export default async function AdminCanvasProductsPage() {
  await requireAdminUser();
  const supabase = createAdminClient();

  const { data } = await supabase
    .from('canvas_products')
    .select('*')
    .order('sort_order', { ascending: true });

  const products = filterDeleted(data && data.length > 0 ? (data as CanvasProduct[]) : DEMO_PRODUCTS);

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
                  <form action={deleteCanvasProduct.bind(null, item.id)}>
                    <button
                      type="submit"
                      className="text-red-600 hover:text-red-700 font-semibold hover:underline"
                    >
                      Delete
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Add New Ready-Made Canvas Product Form */}
      <section className="rounded-xl border border-border bg-surface/50 p-6 space-y-4">
        <h2 className="font-bold text-lg text-text flex items-center gap-2 border-b border-border pb-3">
          <span>➕</span> Add New Ready-Made Canvas Product
        </h2>

        <form action={createCanvasProduct} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <LabeledInput label="Product Name" name="name" placeholder="e.g. 7 Running Horses Vastu Canvas" required />
          <LabeledInput label="URL Slug (Optional)" name="slug" placeholder="e.g. 7-running-horses-vastu-canvas" />

          <div className="md:col-span-2">
            <label className="text-xs text-muted font-medium">Description</label>
            <textarea
              name="description"
              rows={2}
              placeholder="Detailed artwork description and spiritual / decor details..."
              className="mt-1 w-full rounded-xl border border-border bg-bg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <LabeledInput
            label="Main Image URL"
            name="main_image_url"
            placeholder="https://images.unsplash.com/..."
            required
          />

          <div>
            <label className="text-xs text-muted font-medium">Panel Count (1 to 7 Pieces)</label>
            <select
              name="panel_count"
              defaultValue="5"
              className="mt-1 w-full rounded-xl border border-border bg-bg px-3 py-2 text-sm"
            >
              <option value="1">1 Piece (Single Canvas)</option>
              <option value="2">2 Pieces (Diptych)</option>
              <option value="3">3 Pieces (Triptych)</option>
              <option value="4">4 Pieces (Quad Split)</option>
              <option value="5">5 Pieces (Pentaptych Chevron)</option>
              <option value="6">6 Pieces (Hexaptych)</option>
              <option value="7">7 Pieces (Panoramic Multi)</option>
            </select>
          </div>

          <LabeledInput label="Canvas Size Breakdown" name="size_label" placeholder="e.g. 60 x 32 in (Center 12x32 max)" required />
          <LabeledInput label="Frame Style" name="frame_label" placeholder="e.g. Black Floating Frame" />

          <LabeledInput label="Original Price (NPR)" name="original_price" type="number" step="1" placeholder="e.g. 6900" required />
          <LabeledInput label="Discount Price (NPR)" name="discount_price" type="number" step="1" placeholder="e.g. 5520" />

          <LabeledInput label="Stock Count" name="stock" type="number" defaultValue="10" />
          <LabeledInput label="SKU Code" name="sku" placeholder="e.g. AD-CAN-7HORSES" />

          {/* Placement Checkboxes */}
          <div className="md:col-span-2 p-4 rounded-xl border border-border bg-surface/80 space-y-2">
            <label className="text-xs font-bold text-text uppercase tracking-wider block mb-2">
              Website Placement &amp; Category Badges
            </label>
            <div className="flex flex-wrap gap-4 text-xs font-semibold">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" name="is_best_seller" defaultChecked className="rounded text-amber-600 focus:ring-amber-500" />
                <span>⭐ Best Seller</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" name="is_featured" defaultChecked className="rounded text-amber-600 focus:ring-amber-500" />
                <span>📌 Featured Product</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" name="is_new_arrival" className="rounded text-amber-600 focus:ring-amber-500" />
                <span>🔥 New Arrival</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" name="is_trending" className="rounded text-amber-600 focus:ring-amber-500" />
                <span>⚡ Trending</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" name="show_on_homepage" defaultChecked className="rounded text-amber-600 focus:ring-amber-500" />
                <span>🏠 Show on Cozy Canvas Homepage Section</span>
              </label>
            </div>
          </div>

          <div className="md:col-span-2 pt-2">
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-sm shadow-md transition-all"
            >
              + Publish Ready-Made Canvas Product
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
