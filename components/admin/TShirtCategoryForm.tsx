'use client';

import { useState } from 'react';
import { addTShirtCategory } from '@/app/admin/tshirt-categories/actions';
import { OptimizedImageUploader } from '@/components/common/OptimizedImageUploader';

export function TShirtCategoryForm() {
  const [imageUrl, setImageUrl] = useState('');

  return (
    <form action={addTShirtCategory} className="rounded-2xl border border-border bg-surface p-5 space-y-4 shadow-sm">
      <h3 className="text-xs font-bold uppercase tracking-wider text-amber-600">Add New T-Shirt Category</h3>

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-muted block mb-1">Category Name *</label>
          <input
            type="text"
            name="name"
            required
            placeholder="e.g. Couple & Matching T-Shirts"
            className="w-full px-3 py-2 rounded-xl border border-border bg-bg text-xs focus:outline-none"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-muted block mb-1">Description</label>
          <input
            type="text"
            name="description"
            placeholder="Brief description of this apparel category..."
            className="w-full px-3 py-2 rounded-xl border border-border bg-bg text-xs focus:outline-none"
          />
        </div>
      </div>

      <div className="space-y-2 p-3.5 rounded-xl border border-border bg-bg">
        <label className="text-xs font-bold text-text uppercase tracking-wider block">
          📷 Category Cover Image (Automatic Smart Optimization)
        </label>
        <OptimizedImageUploader
          mode="admin"
          preset="admin"
          buttonText="📁 Upload Category Cover Photo from Computer"
          currentImageUrl={imageUrl}
          onOptimized={(result) => setImageUrl(result.url)}
        />
        <div>
          <label className="text-[11px] font-semibold text-muted block mb-1">Or Image URL</label>
          <input
            type="text"
            name="image_url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://images.unsplash.com/photo-..."
            className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-xs font-mono"
          />
        </div>
      </div>

      <button
        type="submit"
        className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition-all active:scale-95 btn-glow"
      >
        + Save Category
      </button>
    </form>
  );
}
