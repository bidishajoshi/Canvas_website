'use client';

import { useState } from 'react';
import { createCanvasProduct } from '@/app/admin/canvas-products/actions';
import { OptimizedImageUploader } from '@/components/common/OptimizedImageUploader';

export function CanvasProductForm() {
  const [imageUrl, setImageUrl] = useState('');
  const [publishedMsg, setPublishedMsg] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    setPublishedMsg(false);
    try {
      await createCanvasProduct(formData);
      setPublishedMsg(true);
      setImageUrl('');
    } catch (err) {
      console.error('Submit error:', err);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form action={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {publishedMsg && (
        <div className="md:col-span-2 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center justify-between shadow-sm">
          <span>✓ Published successfully! Ready-made canvas product is live on the website.</span>
          <button type="button" onClick={() => setPublishedMsg(false)} className="text-xs font-extrabold hover:underline ml-2">✕</button>
        </div>
      )}

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

      <div className="md:col-span-2 space-y-3 p-4 rounded-xl border border-border bg-bg">
        <label className="text-xs font-bold text-text uppercase tracking-wider block">📷 Ready-Made Canvas Main Artwork Photo</label>
        
        <OptimizedImageUploader
          name="main_image_url"
          mode="admin"
          preset="canvas"
          buttonText="📁 Upload High-Res Canvas Photo from Computer"
          sublabel="Upload DSLR photo — system automatically optimizes file size while retaining print resolution"
          currentImageUrl={imageUrl}
          onOptimized={(result) => setImageUrl(result.url)}
        />

        <div>
          <label className="text-xs font-semibold text-muted block mb-1">Or Enter Main Image URL</label>
          <input
            name="main_image_url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://images.unsplash.com/..."
            className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs font-mono"
          />
        </div>
      </div>

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
          disabled={isSubmitting}
          className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white font-extrabold text-sm shadow-md transition-all"
        >
          {isSubmitting ? 'Publishing...' : '+ Publish Ready-Made Canvas Product'}
        </button>
      </div>
    </form>
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
