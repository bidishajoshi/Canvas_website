'use client';

import { useState } from 'react';
import { addTShirtDesign } from '@/app/admin/tshirt-builder/actions';
import { OptimizedImageUploader } from '@/components/common/OptimizedImageUploader';

export function TShirtDesignForm() {
  const [imageUrl, setImageUrl] = useState('');

  return (
    <form action={addTShirtDesign} className="p-4 rounded-xl bg-bg border border-border space-y-4">
      <h3 className="text-xs font-bold uppercase tracking-wider text-amber-600">+ Add New Graphic Artwork Design</h3>

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
            placeholder="Urban / Typography / Nepal / Couple"
            className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-xs focus:outline-none focus:ring-2 focus:ring-amber-600"
          />
        </div>
      </div>

      <div className="space-y-2.5 p-3.5 rounded-xl border border-border bg-surface">
        <label className="text-xs font-bold text-text uppercase tracking-wider block">
          🎨 Artwork File (PNG with Transparency Preserved)
        </label>
        <OptimizedImageUploader
          mode="admin"
          preset="tshirt"
          buttonText="📁 Upload Graphic Artwork / Logo from Computer"
          sublabel="Upload PNG, JPG, or WebP — Transparent PNG backgrounds are strictly preserved"
          currentImageUrl={imageUrl}
          onOptimized={(result) => setImageUrl(result.url)}
        />
        <div>
          <label className="text-[11px] font-semibold text-muted block mb-1">Or Artwork Image URL</label>
          <input
            type="text"
            name="image_url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://images.unsplash.com/photo-..."
            className="w-full px-3 py-2 rounded-xl border border-border bg-bg text-xs font-mono"
          />
        </div>
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

      <button
        type="submit"
        className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition-all"
      >
        Save Artwork Design
      </button>
    </form>
  );
}
