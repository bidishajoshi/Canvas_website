import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { filterDeleted, getGalleryStore, getCategoriesStore } from '@/lib/adminStore';
import { GalleryViewer } from '@/components/gallery/GalleryViewer';
import type { GalleryItem, Category } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Photo Gallery - Affordable Decoration Nepal',
  description:
    'Explore our photo gallery categorized by Single Canvas Prints, Multi-Panel Splits, Aesthetic Vastu Wall Art, Personal Photo Canvas, and Customized T-Shirts.',
};

export default async function GalleryPage() {
  const supabase = createClient();

  const [{ data: dbItems }, { data: dbCategories }] = await Promise.all([
    supabase.from('gallery_items').select('*').eq('status', 'published').order('sort_order', { ascending: true }),
    supabase.from('categories').select('*').eq('status', 'published').order('sort_order', { ascending: true }),
  ]);

  const rawItems = dbItems && dbItems.length > 0 ? (dbItems as GalleryItem[]) : getGalleryStore();
  const rawCategories = dbCategories && dbCategories.length > 0 ? (dbCategories as Category[]) : getCategoriesStore();

  const items = filterDeleted(rawItems);
  const categories = filterDeleted(rawCategories);

  return (
    <div className="container-page py-10 sm:py-16 space-y-10">
      {/* Header */}
      <div className="max-w-3xl mx-auto text-center space-y-3">
        <span className="inline-block text-xs font-bold uppercase tracking-widest text-amber-600">
          Facebook &amp; Catalog Showcase
        </span>
        <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-text">
          Photo Gallery &amp; Category Showcase
        </h1>
        <p className="text-muted text-base sm:text-lg">
          Browse real photo prints and customer creations across all categories. Click any photo to inspect details or launch the canvas builder.
        </p>
      </div>

      <GalleryViewer initialItems={items} categories={categories} />
    </div>
  );
}
