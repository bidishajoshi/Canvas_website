import { requireAdminUser } from '@/lib/adminAuth';
import { createAdminClient } from '@/lib/supabase/admin';
import { filterDeleted, getGalleryStore, getCategoriesStore } from '@/lib/adminStore';
import { GalleryManager } from '@/components/admin/GalleryManager';
import type { GalleryItem, Category } from '@/lib/types';

export default async function AdminGalleryPage() {
  await requireAdminUser();
  const supabase = createAdminClient();

  const [{ data: dbItems }, { data: dbCategories }] = await Promise.all([
    supabase.from('gallery_items').select('*').order('sort_order', { ascending: true }),
    supabase.from('categories').select('*').order('sort_order', { ascending: true }),
  ]);

  const rawItems = dbItems && dbItems.length > 0 ? (dbItems as GalleryItem[]) : getGalleryStore();
  const rawCategories = dbCategories && dbCategories.length > 0 ? (dbCategories as Category[]) : getCategoriesStore();

  const items = filterDeleted(rawItems);
  const categories = filterDeleted(rawCategories);

  return <GalleryManager items={items} categories={categories} />;
}
