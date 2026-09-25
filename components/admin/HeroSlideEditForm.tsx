'use client';

import { useState } from 'react';
import { updateHeroSlide } from '@/app/admin/homepage/actions';
import { OptimizedImageUploader } from '@/components/common/OptimizedImageUploader';

export function HeroSlideEditForm({ slide, index }: { slide: any; index: number }) {
  const [imageUrl, setImageUrl] = useState(slide.image_url || '');

  return (
    <form action={updateHeroSlide} className="space-y-3">
      <input type="hidden" name="id" value={slide.id} />

      <div className="grid sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2">
          <label className="text-xs font-semibold text-muted block mb-1">Slide Title / Heading *</label>
          <input
            type="text"
            name="title"
            defaultValue={slide.title}
            required
            className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-text text-xs font-bold focus:outline-none"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-muted block mb-1">Top Badge Text</label>
          <input
            type="text"
            name="badge"
            defaultValue={slide.badge || ''}
            placeholder="🇳🇵 #1 Decor Choice"
            className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-text text-xs focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-muted block mb-1">Subtitle / Paragraph Description</label>
        <input
          type="text"
          name="subtitle"
          defaultValue={slide.subtitle || ''}
          className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-text text-xs focus:outline-none"
        />
      </div>

      <div className="grid sm:grid-cols-4 gap-3">
        <div>
          <label className="text-xs font-semibold text-muted block mb-1">Primary Button Text</label>
          <input
            type="text"
            name="cta_text"
            defaultValue={slide.cta_text || 'Shop Now'}
            className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-text text-xs focus:outline-none"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-muted block mb-1">Primary Button Link</label>
          <input
            type="text"
            name="cta_href"
            defaultValue={slide.cta_href || '/custom-canvas'}
            className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-text text-xs focus:outline-none"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-muted block mb-1">Secondary Button Text</label>
          <input
            type="text"
            name="secondary_cta_text"
            defaultValue={slide.secondary_cta_text || ''}
            placeholder="Browse Collections"
            className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-text text-xs focus:outline-none"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-muted block mb-1">Secondary Button Link</label>
          <input
            type="text"
            name="secondary_cta_href"
            defaultValue={slide.secondary_cta_href || '/shop'}
            className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-text text-xs focus:outline-none"
          />
        </div>
      </div>

      <div className="space-y-2.5 p-3.5 rounded-xl border border-border bg-surface">
        <label className="text-xs font-bold text-text uppercase tracking-wider block">
          🖼️ Slide Banner Image
        </label>
        <OptimizedImageUploader
          mode="admin"
          preset="admin"
          buttonText="📁 Replace Slide Image from Computer"
          currentImageUrl={imageUrl}
          onOptimized={(result) => setImageUrl(result.url)}
        />
        <div>
          <label className="text-[11px] font-semibold text-muted block mb-1">Or Replace Image URL</label>
          <input
            type="text"
            name="image_url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-bg text-xs font-mono"
          />
        </div>
      </div>

      <div className="flex justify-end pt-1">
        <button
          type="submit"
          className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition-all active:scale-95"
        >
          ✓ Save Changes for Slide #{index + 1}
        </button>
      </div>
    </form>
  );
}
