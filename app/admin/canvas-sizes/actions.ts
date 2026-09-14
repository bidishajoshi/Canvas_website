'use server';

import { revalidatePath } from 'next/cache';
import { requireAdminUser } from '@/lib/adminAuth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function addCanvasSize(formData: FormData) {
  await requireAdminUser();
  const supabase = createAdminClient();

  const name = String(formData.get('name') ?? '').trim();
  const width = Number(formData.get('width') ?? 12);
  const height = Number(formData.get('height') ?? 16);
  const unit = String(formData.get('unit') ?? 'inch');
  const priceRs = Number(formData.get('price_rs') ?? 1990);
  const recommendedRoom = String(formData.get('recommended_room') ?? 'Living Room').trim();

  if (!name) return;

  await supabase.from('canvas_sizes').insert({
    name,
    width,
    height,
    unit,
    price_adjustment_paisa: Math.round(priceRs * 100),
    recommended_room: recommendedRoom,
    active: true,
    sort_order: Date.now(),
  });

  revalidatePath('/admin/canvas-sizes');
  revalidatePath('/custom-canvas');
}

export async function deleteCanvasSize(id: string) {
  await requireAdminUser();
  const supabase = createAdminClient();

  await supabase.from('canvas_sizes').delete().eq('id', id);

  revalidatePath('/admin/canvas-sizes');
  revalidatePath('/custom-canvas');
}
