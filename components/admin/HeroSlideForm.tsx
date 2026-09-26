'use client';

import { useState } from 'react';
import { addHeroSlide } from '@/app/admin/homepage/actions';
import { OptimizedImageUploader } from '@/components/common/OptimizedImageUploader';

export function HeroSlideForm() {
  const [imageUrl, setImageUrl] = useState('');
  const [publishedMsg, setPublishedMsg] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    setPublishedMsg(false);
    try {
      await addHeroSlide(formData);
      setPublishedMsg(true);
      setImageUrl('');
    } catch (err) {
      console.error('Submit error:', err);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form action={handleSubmit} className="p-5 rounded-2xl bg-bg border border-border space-y-4">
      <h3 className="text-xs font-bold uppercase tracking-wider text-amber-600">+ Add New Carousel Banner Slide</h3>

      {publishedMsg && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center justify-between shadow-sm">
          <span>✓ Published successfully! Hero banner slide is live on the homepage carousel.</span>
          <button type="button" onClick={() => setPublishedMsg(false)} className="text-xs font-extrabold hover:underline ml-2">✕</button>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-muted block mb-1">Slide Title / Main Heading *</label>
          <input
            type="text"
            name="title"
            required
            placeholder="e.g. Turn Your Photos Into 7-Piece Canvas Art"
            className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-text text-xs focus:outline-none"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-muted block mb-1">Top Badge Tag</label>
          <input
            type="text"
            name="badge"
            placeholder="🇳🇵 #1 Choice in Nepal"
            className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-text text-xs focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-muted block mb-1">Subtitle / Paragraph Description</label>
        <input
          type="text"
          name="subtitle"
          placeholder="High-definition canvas wall statement split across staggered heights..."
          className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-text text-xs focus:outline-none"
        />
      </div>

      <div className="space-y-2.5 p-3.5 rounded-xl border border-border bg-surface">
        <label className="text-xs font-bold text-text uppercase tracking-wider block">
          🖼️ Hero Banner Image (Automatic Smart Optimization)
        </label>
        <OptimizedImageUploader
          name="image_url"
          mode="admin"
          preset="admin"
          buttonText="📁 Upload Hero Banner Photo from Computer"
          sublabel="Upload high-res banner photo — system automatically optimizes file size"
          currentImageUrl={imageUrl}
          onOptimized={(result) => setImageUrl(result.url)}
        />
        <div>
          <label className="text-[11px] font-semibold text-muted block mb-1">Or Photo URL</label>
          <input
            type="text"
            name="image_url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://images.unsplash.com/photo-..."
            className="w-full px-3 py-2 rounded-xl border border-border bg-bg text-text text-xs font-mono"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-4 gap-3">
        <div>
          <label className="text-xs font-semibold text-muted block mb-1">Primary Button Text</label>
          <input
            type="text"
            name="cta_text"
            defaultValue="Build Custom Canvas 🖼️"
            className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-text text-xs focus:outline-none"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-muted block mb-1">Primary Button Link</label>
          <input
            type="text"
            name="cta_href"
            defaultValue="/custom-canvas"
            className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-text text-xs focus:outline-none"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-muted block mb-1">Secondary Button Text</label>
          <input
            type="text"
            name="secondary_cta_text"
            placeholder="e.g. Browse Ready Made Art"
            className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-text text-xs focus:outline-none"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-muted block mb-1">Secondary Button Link</label>
          <input
            type="text"
            name="secondary_cta_href"
            defaultValue="/shop"
            className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-text text-xs focus:outline-none"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white font-bold text-xs shadow-md transition-all active:scale-95 btn-glow"
      >
        {isSubmitting ? 'Publishing...' : '+ Save & Add Slide to Homepage Carousel'}
      </button>
    </form>
  );
}
