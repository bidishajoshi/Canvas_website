'use server';

import { revalidatePath } from 'next/cache';
import { requireAdminUser } from '@/lib/adminAuth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function addTShirtColor(formData: FormData) {
  await requireAdminUser();
  const supabase = createAdminClient();

  const name = String(formData.get('name') ?? '').trim();
  const colorHex = String(formData.get('color_hex') ?? '#ffffff').trim();
  const additionalPriceRs = Number(formData.get('additional_price_rs') ?? 0);

  if (!name || !colorHex) return;

  await supabase.from('tshirt_colors').insert({
    name,
    color_hex: colorHex,
    additional_price_paisa: Math.round(additionalPriceRs * 100),
    active: true,
    sort_order: Date.now(),
  });

  revalidatePath('/admin/colors');
  revalidatePath('/custom-t-shirt');
}

export async function deleteTShirtColor(id: string) {
  await requireAdminUser();
  const supabase = createAdminClient();

  await supabase.from('tshirt_colors').delete().eq('id', id);

  revalidatePath('/admin/colors');
  revalidatePath('/custom-t-shirt');
}
