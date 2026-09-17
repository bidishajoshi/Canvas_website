'use server';

import { revalidatePath } from 'next/cache';
import { requireAdminUser } from '@/lib/adminAuth';
import { createAdminClient } from '@/lib/supabase/admin';
import { saveGalleryItemToStore, markIdAsDeleted } from '@/lib/adminStore';
import type { ContentStatus } from '@/lib/types';

export async function createGalleryItem(formData: FormData) {
  await requireAdminUser();
  const supabase = createAdminClient();

  const image_url = String(formData.get('image_url') ?? '').trim();
  if (!image_url) throw new Error('Photo Image URL is required');

  const caption = String(formData.get('caption') ?? '').trim() || null;
  const category = String(formData.get('category') ?? '').trim() || null;
  const is_featured = formData.get('is_featured') === 'on';
  const sort_order = Number(formData.get('sort_order') ?? 0);
  const status = (String(formData.get('status') ?? 'published')) as ContentStatus;

  const newItem = {
    id: 'gal-' + Date.now(),
    image_url,
    caption,
    category,
    is_featured,
    status,
    sort_order,
  };

  saveGalleryItemToStore(newItem);

  try {
    await supabase.from('gallery_items').insert({
      id: newItem.id,
      image_url,
      caption,
      category,
      is_featured,
      status,
      sort_order,
    });
  } catch (err) {
    console.error('Supabase gallery item create fallback:', err);
  }

  revalidatePath('/admin/gallery');
  revalidatePath('/gallery');
}

export async function updateGalleryItem(itemId: string, formData: FormData) {
  await requireAdminUser();
  const supabase = createAdminClient();

  const image_url = String(formData.get('image_url') ?? '').trim();
  if (!image_url) throw new Error('Photo Image URL is required');

  const caption = String(formData.get('caption') ?? '').trim() || null;
  const category = String(formData.get('category') ?? '').trim() || null;
  const is_featured = formData.get('is_featured') === 'on';
  const sort_order = Number(formData.get('sort_order') ?? 0);
  const status = (String(formData.get('status') ?? 'published')) as ContentStatus;

  const updatedItem = {
    id: itemId,
    image_url,
    caption,
    category,
    is_featured,
    status,
    sort_order,
  };

  saveGalleryItemToStore(updatedItem);

  try {
    await supabase
      .from('gallery_items')
      .update({
        image_url,
        caption,
        category,
        is_featured,
        status,
        sort_order,
      })
      .eq('id', itemId);
  } catch (err) {
    console.error('Supabase gallery item update fallback:', err);
  }

  revalidatePath('/admin/gallery');
  revalidatePath('/gallery');
}

export async function deleteGalleryItem(id: string) {
  await requireAdminUser();
  const supabase = createAdminClient();
  markIdAsDeleted(id);

  try {
    await supabase.from('gallery_items').delete().eq('id', id);
  } catch (err) {
    console.error('Supabase gallery item delete fallback:', err);
  }

  revalidatePath('/admin/gallery');
  revalidatePath('/gallery');
}
