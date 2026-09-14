'use server';

import { revalidatePath } from 'next/cache';
import { requireAdminUser } from '@/lib/adminAuth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function addTShirtSize(formData: FormData) {
  await requireAdminUser();
  const supabase = createAdminClient();

  const name = String(formData.get('name') ?? '').trim();
  const code = String(formData.get('code') ?? '').trim().toUpperCase();
  const priceAdjustmentRs = Number(formData.get('price_adjustment_rs') ?? 0);

  if (!name || !code) return;

  await supabase.from('tshirt_sizes').insert({
    name,
    code,
    price_adjustment_paisa: Math.round(priceAdjustmentRs * 100),
    active: true,
    sort_order: Date.now(),
  });

  revalidatePath('/admin/sizes');
  revalidatePath('/custom-t-shirt');
}

export async function deleteTShirtSize(id: string) {
  await requireAdminUser();
  const supabase = createAdminClient();

  await supabase.from('tshirt_sizes').delete().eq('id', id);

  revalidatePath('/admin/sizes');
  revalidatePath('/custom-t-shirt');
}
