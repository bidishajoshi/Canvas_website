'use server';

import { revalidatePath } from 'next/cache';
import { requireAdminUser } from '@/lib/adminAuth';
import { createAdminClient } from '@/lib/supabase/admin';
import { slugify } from '@/lib/utils';

export async function createCategory(formData: FormData) {
  await requireAdminUser();
  const supabase = createAdminClient();
  const name = String(formData.get('name') ?? '').trim();
  if (!name) throw new Error('Category name is required');

  await supabase.from('categories').insert({
    name,
    slug: slugify(name),
    description: String(formData.get('description') ?? '') || null,
    status: 'published',
  });

  revalidatePath('/admin/categories');
}

export async function deleteCategory(id: string) {
  await requireAdminUser();
  const supabase = createAdminClient();
  await supabase.from('categories').delete().eq('id', id);
  revalidatePath('/admin/categories');
}
