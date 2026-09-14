'use server';

import { revalidatePath } from 'next/cache';
import { requireAdminUser } from '@/lib/adminAuth';
import { createAdminClient } from '@/lib/supabase/admin';
import { markIdAsDeleted } from '@/lib/adminStore';

export async function addTShirtCategory(formData: FormData) {
  await requireAdminUser();
  const supabase = createAdminClient();

  const name = String(formData.get('name') ?? '').trim();
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const description = String(formData.get('description') ?? '').trim();
  const imageUrl = String(formData.get('image_url') ?? '').trim();

  if (!name) return;

  try {
    await supabase.from('tshirt_categories').insert({
      name,
      slug,
      description: description || null,
      image_url: imageUrl || null,
      status: 'published',
      sort_order: Date.now(),
    });
  } catch {}

  revalidatePath('/admin/tshirt-categories');
  revalidatePath('/custom-t-shirt');
}

export async function deleteTShirtCategory(id: string) {
  await requireAdminUser();
  markIdAsDeleted(id);

  try {
    const supabase = createAdminClient();
    await supabase.from('tshirt_categories').delete().eq('id', id);
  } catch {}

  revalidatePath('/admin/tshirt-categories');
  revalidatePath('/custom-t-shirt');
}
