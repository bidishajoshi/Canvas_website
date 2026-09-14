'use server';

import { revalidatePath } from 'next/cache';
import { requireAdminUser } from '@/lib/adminAuth';
import { createAdminClient } from '@/lib/supabase/admin';

function toPaisa(value: FormDataEntryValue | null): number {
  const n = parseFloat(String(value ?? '0'));
  return Math.round((Number.isFinite(n) ? n : 0) * 100);
}

export async function createPanelType(formData: FormData) {
  await requireAdminUser();
  const supabase = createAdminClient();
  await supabase.from('panel_types').insert({
    panel_count: Number(formData.get('panel_count')),
    name: String(formData.get('name')),
    description: String(formData.get('description') ?? '') || null,
    status: 'published',
  });
  revalidatePath('/admin/canvas-builder');
  revalidatePath('/custom-canvas');
}

import { markIdAsDeleted } from '@/lib/adminStore';

export async function deletePanelType(id: string) {
  await requireAdminUser();
  const supabase = createAdminClient();
  markIdAsDeleted(id);
  await supabase.from('panel_types').delete().eq('id', id);
  revalidatePath('/admin/canvas-builder');
  revalidatePath('/custom-canvas');
}

export async function createCanvasSize(formData: FormData) {
  await requireAdminUser();
  const supabase = createAdminClient();
  await supabase.from('canvas_sizes').insert({
    name: String(formData.get('name')),
    width: Number(formData.get('width')),
    height: Number(formData.get('height')),
    unit: String(formData.get('unit') ?? 'inch'),
    panel_type_id: String(formData.get('panel_type_id')),
    price_adjustment_paisa: toPaisa(formData.get('price')),
    sizing_mode: String(formData.get('sizing_mode') ?? 'overall_combined'),
    each_panel_size: String(formData.get('each_panel_size') ?? '') || null,
    recommended_room: String(formData.get('recommended_room') ?? '') || null,
    active: true,
  });
  revalidatePath('/admin/canvas-builder');
  revalidatePath('/custom-canvas');
}

export async function deleteCanvasSize(id: string) {
  await requireAdminUser();
  const supabase = createAdminClient();
  markIdAsDeleted(id);
  await supabase.from('canvas_sizes').delete().eq('id', id);
  revalidatePath('/admin/canvas-builder');
  revalidatePath('/custom-canvas');
}

export async function createFrame(formData: FormData) {
  await requireAdminUser();
  const supabase = createAdminClient();
  await supabase.from('frames').insert({
    name: String(formData.get('name')),
    price_paisa: toPaisa(formData.get('price')),
    status: 'published',
  });
  revalidatePath('/admin/canvas-builder');
  revalidatePath('/custom-canvas');
}

export async function deleteFrame(id: string) {
  await requireAdminUser();
  const supabase = createAdminClient();
  markIdAsDeleted(id);
  await supabase.from('frames').delete().eq('id', id);
  revalidatePath('/admin/canvas-builder');
  revalidatePath('/custom-canvas');
}

export async function createFinish(formData: FormData) {
  await requireAdminUser();
  const supabase = createAdminClient();
  await supabase.from('finishes').insert({
    name: String(formData.get('name')),
    price_paisa: toPaisa(formData.get('price')),
    status: 'published',
  });
  revalidatePath('/admin/canvas-builder');
  revalidatePath('/custom-canvas');
}

export async function deleteFinish(id: string) {
  await requireAdminUser();
  const supabase = createAdminClient();
  markIdAsDeleted(id);
  await supabase.from('finishes').delete().eq('id', id);
  revalidatePath('/admin/canvas-builder');
  revalidatePath('/custom-canvas');
}
