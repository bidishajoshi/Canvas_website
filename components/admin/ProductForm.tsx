'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { Category, Product } from '@/lib/types';
import { OptimizedImageUploader } from '@/components/common/OptimizedImageUploader';

interface ProductFormProps {
  action: (formData: FormData) => void | Promise<void>;
  categories: Category[];
  product?: Product;
}

export function ProductForm({ action, categories, product }: ProductFormProps) {
  const [imageUrl, setImageUrl] = useState(product?.main_image_url ?? '');

  return (
    <form action={action} className="max-w-2xl space-y-5 rounded-2xl border border-border bg-surface p-6 shadow-sm">
      <Field label="Product Name" name="name" defaultValue={product?.name} required />
      <Field label="SKU / Item Code" name="sku" defaultValue={product?.sku ?? ''} placeholder="e.g. AD-CAN-01" />

      <div>
        <label className="text-xs font-semibold text-muted">Category</label>
        <select
          name="category_id"
          defaultValue={product?.category_id ?? ''}
          className="mt-1 w-full rounded-xl border border-border bg-bg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <option value="">— Select Category —</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs font-semibold text-muted">Short Description</label>
        <textarea
          name="short_description"
          rows={2}
          defaultValue={product?.short_description ?? ''}
          placeholder="Brief summary for shop card preview..."
          className="mt-1 w-full rounded-xl border border-border bg-bg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>

      <div>
        <label className="text-xs font-semibold text-muted">Full Product Description</label>
        <textarea
          name="description"
          rows={4}
          defaultValue={product?.description ?? ''}
          placeholder="Detailed specs, canvas material, finish, dimensions, care instructions..."
          className="mt-1 w-full rounded-xl border border-border bg-bg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>

      {/* Main Image Input with Live Preview */}
      <div>
        <label className="text-xs font-semibold text-muted">Product Main Photo URL</label>
        <input
          name="main_image_url"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://images.unsplash.com/..."
          className="mt-1 w-full rounded-xl border border-border bg-bg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
        {imageUrl ? (
          <div className="relative mt-3 h-48 w-full max-w-md overflow-hidden rounded-xl border border-border bg-neutral-900 shadow-inner">
            <Image
              src={imageUrl}
              alt="Product Photo Preview"
              fill
              className="object-cover"
              sizes="400px"
            />
          </div>
        ) : (
          <p className="mt-1.5 text-xs text-muted">Paste an image URL from Cloudinary or media library to preview.</p>
        )}
      </div>

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
        label="Stock Quantity"
        name="stock"
        type="number"
        defaultValue={product?.stock?.toString() ?? '50'}
      />

      <div className="flex flex-wrap gap-5 text-sm pt-2">
        <Checkbox label="Featured Product" name="is_featured" defaultChecked={product?.is_featured} />
        <Checkbox
          label="Best Seller Badge"
          name="is_best_seller"
          defaultChecked={product?.is_best_seller}
        />
        <Checkbox
          label="New Arrival Badge"
          name="is_new_arrival"
          defaultChecked={product?.is_new_arrival}
        />
      </div>

      <div>
        <label className="text-xs font-semibold text-muted">Status</label>
        <select
          name="status"
          defaultValue={product?.status ?? 'published'}
          className="mt-1 w-full rounded-xl border border-border bg-bg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="hidden">Hidden</option>
        </select>
      </div>

      <div className="pt-3">
        <button
          type="submit"
          className="rounded-xl bg-amber-500 px-6 py-3 text-xs font-bold text-black hover:bg-amber-400 shadow-md transition-all"
        >
          {product ? '💾 Save Photo & Product Changes' : '✨ Create Product with Photo'}
        </button>
      </div>
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
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
  type?: string;
  step?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-muted">{label}</label>
      <input
        name={name}
        type={type}
        step={step}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="mt-1 w-full rounded-xl border border-border bg-bg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
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
    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-text">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="h-4 w-4 rounded border-border text-amber-500 focus:ring-amber-500"
      />
      {label}
    </label>
  );
}
