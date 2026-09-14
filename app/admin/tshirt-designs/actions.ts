'use server';

import { revalidatePath } from 'next/cache';
import { requireAdminUser } from '@/lib/adminAuth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function addTShirtDesign(formData: FormData) {
  await requireAdminUser();
  const supabase = createAdminClient();

  const name = String(formData.get('name') ?? '').trim();
  const theme = String(formData.get('theme') ?? 'General').trim();
  const imageUrl = String(formData.get('image_url') ?? '').trim();
  const priceRs = Number(formData.get('price_rs') ?? 0);

  if (!name || !imageUrl) return;

  await supabase.from('tshirt_designs').insert({
    name,
    theme,
    image_url: imageUrl,
    price_paisa: Math.round(priceRs * 100),
    active: true,
    sort_order: Date.now(),
  });

  revalidatePath('/admin/tshirt-designs');
  revalidatePath('/custom-t-shirt');
}

export async function deleteTShirtDesign(id: string) {
  await requireAdminUser();
  const supabase = createAdminClient();

  await supabase.from('tshirt_designs').delete().eq('id', id);

  revalidatePath('/admin/tshirt-designs');
  revalidatePath('/custom-t-shirt');
}
