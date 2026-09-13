import type { Category, Product } from '@/lib/types';

interface ProductFormProps {
  action: (formData: FormData) => void | Promise<void>;
  categories: Category[];
  product?: Product;
}

export function ProductForm({ action, categories, product }: ProductFormProps) {
  return (
    <form action={action} className="max-w-2xl space-y-4">
      <Field label="Product Name" name="name" defaultValue={product?.name} required />
      <Field label="SKU" name="sku" defaultValue={product?.sku ?? ''} />

      <div>
        <label className="text-xs text-muted">Category</label>
        <select
          name="category_id"
          defaultValue={product?.category_id ?? ''}
          className="mt-1 w-full rounded-card border border-border bg-bg px-3 py-2 text-sm"
        >
          <option value="">— None —</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs text-muted">Short Description</label>
        <textarea
          name="short_description"
          rows={2}
          defaultValue={product?.short_description ?? ''}
          className="mt-1 w-full rounded-card border border-border bg-bg px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="text-xs text-muted">Full Description</label>
        <textarea
          name="description"
          rows={4}
          defaultValue={product?.description ?? ''}
          className="mt-1 w-full rounded-card border border-border bg-bg px-3 py-2 text-sm"
        />
      </div>

      <Field
        label="Main Image URL (upload via Media Library, paste URL here)"
        name="main_image_url"
        defaultValue={product?.main_image_url ?? ''}
      />

      <div className="grid grid-cols-2 gap-4">
        <Field
          label="Base Price (NPR)"
          name="base_price"
          type="number"
          step="0.01"
          defaultValue={product ? (product.base_price_paisa / 100).toString() : ''}
          required
        />
        <Field
          label="Discount Price (NPR, optional)"
          name="discount_price"
          type="number"
          step="0.01"
          defaultValue={
            product?.discount_price_paisa != null
              ? (product.discount_price_paisa / 100).toString()
              : ''
          }
        />
      </div>

      <Field
        label="Stock"
        name="stock"
        type="number"
        defaultValue={product?.stock?.toString() ?? ''}
      />

      <div className="flex flex-wrap gap-4 text-sm">
        <Checkbox label="Featured" name="is_featured" defaultChecked={product?.is_featured} />
        <Checkbox
          label="Best Seller"
          name="is_best_seller"
          defaultChecked={product?.is_best_seller}
        />
        <Checkbox
          label="New Arrival"
          name="is_new_arrival"
          defaultChecked={product?.is_new_arrival}
        />
      </div>

      <div>
        <label className="text-xs text-muted">Status</label>
        <select
          name="status"
          defaultValue={product?.status ?? 'draft'}
          className="mt-1 w-full rounded-card border border-border bg-bg px-3 py-2 text-sm"
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="hidden">Hidden</option>
        </select>
      </div>

      <button
        type="submit"
        className="rounded-card bg-accent-yellow px-5 py-3 text-sm font-semibold text-[color:var(--color-accent-yellow-contrast)]"
      >
        {product ? 'Save Changes' : 'Create Product'}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  defaultValue,
  required,
  type = 'text',
  step,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
  type?: string;
  step?: string;
}) {
  return (
    <div>
      <label className="text-xs text-muted">{label}</label>
      <input
        name={name}
        type={type}
        step={step}
        required={required}
        defaultValue={defaultValue}
        className="mt-1 w-full rounded-card border border-border bg-bg px-3 py-2 text-sm"
      />
    </div>
  );
}

function Checkbox({
  label,
  name,
  defaultChecked,
}: {
  label: string;
  name: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex items-center gap-2">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} />
      {label}
    </label>
  );
}
