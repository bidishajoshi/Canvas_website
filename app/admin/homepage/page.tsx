import Image from 'next/image';
import { requireAdminUser } from '@/lib/adminAuth';
import { createAdminClient } from '@/lib/supabase/admin';
import { addHeroSlide, deleteHeroSlide, toggleSectionEnabled } from './actions';

export default async function AdminHomepagePage() {
  await requireAdminUser();
  const supabase = createAdminClient();

  const [{ data: slides }, { data: sections }] = await Promise.all([
    supabase.from('hero_slides').select('*').order('sort_order', { ascending: true }),
    supabase.from('homepage_sections').select('*').order('sort_order', { ascending: true }),
  ]);

  const activeSlides = slides || [];
  const activeSections = sections || [];

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-2xl font-bold">Homepage Builder &amp; Multi-Photo Slider</h1>
        <p className="text-xs text-muted mt-1">
          Manage multiple background photos for your homepage hero slider, update captions, CTA buttons, and toggle homepage sections.
        </p>
      </div>

      {/* Hero Slides Management */}
      <div className="space-y-6 rounded-2xl border border-border bg-surface p-6">
        <h2 className="text-base font-bold text-text flex items-center gap-2">
          <span>🖼️</span> Hero Banner Photo Slides ({activeSlides.length})
        </h2>

        {/* Add New Slide Form */}
        <form action={addHeroSlide} className="p-4 rounded-xl bg-bg border border-border space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-600">Add New Banner Photo Slide</h3>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted block mb-1">Slide Title *</label>
              <input
                type="text"
                name="title"
                required
                placeholder="e.g. Turn Your Memories Into 7-Piece Canvas Art"
                className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-text text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted block mb-1">Photo Image URL *</label>
              <input
                type="url"
                name="image_url"
                required
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-text text-xs focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted block mb-1">Subtitle / Description</label>
            <input
              type="text"
              name="subtitle"
              placeholder="High-definition canvas wall statement split across staggered heights..."
              className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-text text-xs focus:outline-none"
            />
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted block mb-1">Badge Text</label>
              <input
                type="text"
                name="badge"
                placeholder="🇳🇵 #1 Choice in Nepal"
                className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-text text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted block mb-1">Button Label</label>
              <input
                type="text"
                name="cta_text"
                defaultValue="Build Custom Canvas 🖼️"
                className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-text text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted block mb-1">Button Link URL</label>
              <input
                type="text"
                name="cta_href"
                defaultValue="/custom-canvas"
                className="w-full px-3 py-2 rounded-lg border border-border bg-surface text-text text-xs focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition-colors"
          >
            + Save &amp; Add Slide to Homepage
          </button>
        </form>

        {/* Existing Slides List */}
        <div className="grid gap-4 sm:grid-cols-2">
          {activeSlides.map((slide) => (
            <div
              key={slide.id}
              className="relative rounded-2xl border border-border bg-bg overflow-hidden shadow-sm flex flex-col justify-between"
            >
              <div className="relative aspect-[16/9] w-full bg-neutral-900">
                <Image src={slide.image_url} alt={slide.title} fill className="object-cover" />
                <div className="absolute inset-0 bg-black/40 p-4 flex flex-col justify-end text-white">
                  {slide.badge && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                      {slide.badge}
                    </span>
                  )}
                  <h4 className="font-bold text-sm line-clamp-1">{slide.title}</h4>
                </div>
              </div>

              <div className="p-4 flex items-center justify-between text-xs border-t border-border">
                <span className="text-muted font-semibold truncate">{slide.cta_text} → {slide.cta_href}</span>
                <form action={deleteHeroSlide.bind(null, slide.id)}>
                  <button type="submit" className="text-rose-600 font-bold hover:underline">
                    Delete Slide
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section Toggle Controls */}
      <div className="space-y-4 rounded-2xl border border-border bg-surface p-6">
        <h2 className="text-base font-bold text-text flex items-center gap-2">
          <span>⚙️</span> Homepage Sections Visibility
        </h2>

        <div className="grid gap-3 sm:grid-cols-2">
          {activeSections.map((sec) => (
            <div
              key={sec.id}
              className="p-3.5 rounded-xl border border-border bg-bg flex items-center justify-between text-xs"
            >
              <div>
                <h4 className="font-bold text-text">{sec.title || sec.section_key}</h4>
                <span className="text-muted text-[11px]">{sec.section_key}</span>
              </div>

              <form
                action={async () => {
                  'use server';
                  await toggleSectionEnabled(sec.id, !sec.enabled);
                }}
              >
                <button
                  type="submit"
                  className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-colors ${
                    sec.enabled
                      ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                  }`}
                >
                  {sec.enabled ? '✓ Active' : '✕ Disabled'}
                </button>
              </form>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
