import Image from 'next/image';
import { requireAdminUser } from '@/lib/adminAuth';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  addHeroSlide,
  updateHeroSlide,
  deleteHeroSlide,
  updateAnnouncementBar,
  updateHomepageSection,
  toggleSectionEnabled,
} from './actions';
import { filterDeleted, getHeroSlidesStore } from '@/lib/adminStore';
import { HeroSlideForm } from '@/components/admin/HeroSlideForm';
import { HeroSlideEditForm } from '@/components/admin/HeroSlideEditForm';
import { DeleteButton } from '@/components/admin/DeleteButton';

export default async function AdminHomepagePage() {
  await requireAdminUser();
  const supabase = createAdminClient();

  const [{ data: slides }, { data: sections }, { data: announcement }] = await Promise.all([
    supabase.from('hero_slides').select('*').order('sort_order', { ascending: true }),
    supabase.from('homepage_sections').select('*').order('sort_order', { ascending: true }),
    supabase.from('announcement_bar').select('*').limit(1).single(),
  ]);

  const rawSlides = (slides && slides.length > 0) ? slides : getHeroSlidesStore();
  const activeSlides = filterDeleted(rawSlides);
  const activeSections = sections || [];

  return (
    <div className="space-y-10 max-w-6xl">
      <div>
        <h1 className="font-display text-2xl font-bold">Homepage Carousel &amp; Content Management</h1>
        <p className="text-xs text-muted mt-1">
          Full control over hero slider banner slides, photos, announcement marquee text, section headings, and CTA links.
        </p>
      </div>

      {/* Top Announcement Bar Control */}
      <div className="rounded-2xl border border-amber-500/30 bg-surface p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h2 className="text-sm font-bold text-text flex items-center gap-2">
              <span>📢</span> Top Announcement Marquee Bar
            </h2>
            <p className="text-xs text-muted">Editable ticker bar shown at the top of every page across the website.</p>
          </div>
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${announcement?.enabled !== false ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'}`}>
            {announcement?.enabled !== false ? '● Active' : '○ Disabled'}
          </span>
        </div>

        <form action={updateAnnouncementBar} className="space-y-3">
          <div className="grid sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-muted block mb-1">Announcement Message Text *</label>
              <input
                type="text"
                name="message"
                defaultValue={announcement?.message || '🇳🇵 Free Delivery Across Kathmandu Valley on Orders Over Rs. 2,000! Express Cash on Delivery Available.'}
                required
                className="w-full px-3 py-2 rounded-xl border border-border bg-bg text-text text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted block mb-1">Click Action Link URL</label>
              <input
                type="text"
                name="link_href"
                defaultValue={announcement?.link_href || '/custom-canvas'}
                className="w-full px-3 py-2 rounded-xl border border-border bg-bg text-text text-xs focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
              <input
                type="checkbox"
                name="enabled"
                defaultChecked={announcement?.enabled !== false}
                className="rounded border-border text-amber-600 accent-amber-600"
              />
              <span>Enable Top Announcement Bar</span>
            </label>

            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition-all active:scale-95"
            >
              Save Announcement Text
            </button>
          </div>
        </form>
      </div>

      {/* Hero Slides Management */}
      <div className="space-y-6 rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-text flex items-center gap-2">
            <span>🖼️</span> Hero Banner Carousel Slides ({activeSlides.length})
          </h2>
          <span className="text-xs text-amber-600 font-bold">Auto-rotates every 6 seconds</span>
        </div>

        {/* Add New Slide Form */}
        <HeroSlideForm />

        {/* Existing Carousel Slides List with Edit & Delete */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted">Active Carousel Slides (Edit Any Text &amp; Button)</h3>

          <div className="grid gap-6 sm:grid-cols-1">
            {activeSlides.map((slide, index) => (
              <div
                key={slide.id}
                className="rounded-2xl border border-border bg-bg overflow-hidden shadow-sm p-4 space-y-4"
              >
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <span className="text-xs font-bold text-amber-600 flex items-center gap-1.5">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-600 text-white text-[10px]">{index + 1}</span>
                    <span>Carousel Slide #{index + 1}</span>
                  </span>

                  <DeleteButton action={deleteHeroSlide.bind(null, slide.id)} itemName={`Slide #${index + 1}`} buttonText="Delete Slide 🗑️" />
                </div>

                <HeroSlideEditForm slide={slide} index={index} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section Headings & Visibility Controls */}
      <div className="space-y-4 rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <h2 className="text-base font-bold text-text flex items-center gap-2">
          <span>⚙️</span> Homepage Section Titles &amp; Visibility Controls
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          {activeSections.map((sec) => (
            <div
              key={sec.id}
              className="p-4 rounded-2xl border border-border bg-bg space-y-3"
            >
              <div className="flex items-center justify-between border-b border-border pb-2">
                <span className="font-bold text-text text-xs uppercase tracking-wider">{sec.section_key}</span>
                <form action={toggleSectionEnabled.bind(null, sec.id, !sec.enabled)}>
                  <button
                    type="submit"
                    className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-colors ${
                      sec.enabled
                        ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                    }`}
                  >
                    {sec.enabled ? '✓ Visible' : '✕ Hidden'}
                  </button>
                </form>
              </div>

              <form action={updateHomepageSection} className="space-y-2">
                <input type="hidden" name="id" value={sec.id} />
                <div>
                  <label className="text-[10px] font-bold uppercase text-muted block mb-0.5">Section Title</label>
                  <input
                    type="text"
                    name="title"
                    defaultValue={sec.title || ''}
                    placeholder="Section Title"
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-border bg-surface text-text font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-muted block mb-0.5">Subtitle / Sub-heading</label>
                  <input
                    type="text"
                    name="subtitle"
                    defaultValue={sec.subtitle || ''}
                    placeholder="Subtitle"
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-border bg-surface text-text"
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    className="px-3 py-1 rounded-lg bg-surface-hover border border-border hover:border-amber-600 text-text font-bold text-[11px] transition-all"
                  >
                    Save Heading
                  </button>
                </div>
              </form>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
