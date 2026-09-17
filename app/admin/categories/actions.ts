'use server';

import { revalidatePath } from 'next/cache';
import { requireAdminUser } from '@/lib/adminAuth';
import { createAdminClient } from '@/lib/supabase/admin';
import { slugify } from '@/lib/utils';
import { saveCategoryToStore, markIdAsDeleted } from '@/lib/adminStore';
import type { ContentStatus } from '@/lib/types';

export async function createCategory(formData: FormData) {
  await requireAdminUser();
  const supabase = createAdminClient();
  const name = String(formData.get('name') ?? '').trim();
  if (!name) throw new Error('Category name is required');

  const slug = slugify(name);
  const description = String(formData.get('description') ?? '').trim() || null;
  const image_url = String(formData.get('image_url') ?? '').trim() || null;
  const sort_order = Number(formData.get('sort_order') ?? 0);
  const status = (String(formData.get('status') ?? 'published')) as ContentStatus;

  const newCategory = {
    id: 'cat-' + Date.now(),
    name,
    slug,
    description,
    image_url,
    parent_id: null,
    status,
    sort_order,
  };

  saveCategoryToStore(newCategory);

  try {
    await supabase.from('categories').insert({
      id: newCategory.id,
      name,
      slug,
      description,
      image_url,
      status,
      sort_order,
    });
  } catch (err) {
    console.error('Supabase category create fallback:', err);
  }

  revalidatePath('/admin/categories');
  revalidatePath('/categories');
  revalidatePath('/shop');
}

export async function updateCategory(categoryId: string, formData: FormData) {
  await requireAdminUser();
  const supabase = createAdminClient();
  const name = String(formData.get('name') ?? '').trim();
  if (!name) throw new Error('Category name is required');

  const slug = slugify(name);
  const description = String(formData.get('description') ?? '').trim() || null;
  const image_url = String(formData.get('image_url') ?? '').trim() || null;
  const sort_order = Number(formData.get('sort_order') ?? 0);
  const status = (String(formData.get('status') ?? 'published')) as ContentStatus;

  const updatedCategory = {
    id: categoryId,
    name,
    slug,
    description,
    image_url,
    parent_id: null,
    status,
    sort_order,
  };

  saveCategoryToStore(updatedCategory);

  try {
    await supabase
      .from('categories')
      .update({
        name,
        slug,
        description,
        image_url,
        status,
        sort_order,
      })
      .eq('id', categoryId);
  } catch (err) {
    console.error('Supabase category update fallback:', err);
  }

  revalidatePath('/admin/categories');
  revalidatePath('/categories');
  revalidatePath('/shop');
}

export async function deleteCategory(id: string) {
  await requireAdminUser();
  const supabase = createAdminClient();
  markIdAsDeleted(id);
  try {
    await supabase.from('categories').delete().eq('id', id);
  } catch (err) {
    console.error('Supabase category delete fallback:', err);
  }

  revalidatePath('/admin/categories');
  revalidatePath('/categories');
  revalidatePath('/shop');
}
