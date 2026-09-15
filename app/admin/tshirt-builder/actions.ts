'use server';

import { revalidatePath } from 'next/cache';
import { requireAdminUser } from '@/lib/adminAuth';
import { createAdminClient } from '@/lib/supabase/admin';
import { markIdAsDeleted } from '@/lib/adminStore';

export async function addTShirtType(formData: FormData) {
  await requireAdminUser();
  const name = String(formData.get('name') || '').trim();
  const description = String(formData.get('description') || '').trim();
  const basePriceRs = parseFloat(String(formData.get('base_price') || '0'));
  const base_price_paisa = Math.round(basePriceRs * 100);

  if (!name) return;

  const supabase = createAdminClient();
  await supabase.from('tshirt_types').insert({
    name,
    description: description || null,
    base_price_paisa,
    is_active: true,
    sort_order: 1,
  });

  revalidatePath('/admin/tshirt-builder');
  revalidatePath('/custom-t-shirt');
}

export async function deleteTShirtType(id: string) {
  await requireAdminUser();
  const supabase = createAdminClient();
  const { error } = await supabase.from('tshirt_types').delete().eq('id', id);

  if (error || id) {
    markIdAsDeleted(id);
  }

  revalidatePath('/admin/tshirt-builder');
  revalidatePath('/custom-t-shirt');
}

export async function addTShirtColor(formData: FormData) {
  await requireAdminUser();
  const name = String(formData.get('name') || '').trim();
  const color_hex = String(formData.get('color_hex') || '#FFFFFF').trim();

  if (!name) return;

  const supabase = createAdminClient();
  await supabase.from('tshirt_colors').insert({
    name,
    color_hex,
    is_active: true,
    sort_order: 1,
  });

  revalidatePath('/admin/tshirt-builder');
  revalidatePath('/custom-t-shirt');
}

export async function deleteTShirtColor(id: string) {
  await requireAdminUser();
  const supabase = createAdminClient();
  const { error } = await supabase.from('tshirt_colors').delete().eq('id', id);

  if (error || id) {
    markIdAsDeleted(id);
  }

  revalidatePath('/admin/tshirt-builder');
  revalidatePath('/custom-t-shirt');
}

export async function addPrintLocation(formData: FormData) {
  await requireAdminUser();
  const name = String(formData.get('name') || '').trim();
  const addPriceRs = parseFloat(String(formData.get('additional_price') || '0'));
  const additional_price_paisa = Math.round(addPriceRs * 100);

  if (!name) return;

  const supabase = createAdminClient();
  await supabase.from('print_locations').insert({
    name,
    additional_price_paisa,
    is_active: true,
    sort_order: 1,
  });

  revalidatePath('/admin/tshirt-builder');
  revalidatePath('/custom-t-shirt');
}

export async function deletePrintLocation(id: string) {
  await requireAdminUser();
  const supabase = createAdminClient();
  const { error } = await supabase.from('print_locations').delete().eq('id', id);

  if (error || id) {
    markIdAsDeleted(id);
  }

  revalidatePath('/admin/tshirt-builder');
  revalidatePath('/custom-t-shirt');
}

export async function addTShirtDesign(formData: FormData) {
  await requireAdminUser();
  const name = String(formData.get('name') || '').trim();
  const theme = String(formData.get('theme') || 'General').trim();
  const image_url = String(formData.get('image_url') || '').trim();
  const priceRs = parseFloat(String(formData.get('price') || '0'));
  const price_paisa = Math.round(priceRs * 100);

  if (!name || !image_url) return;

  const supabase = createAdminClient();
  await supabase.from('tshirt_designs').insert({
    name,
    theme,
    image_url,
    price_paisa,
    is_active: true,
    sort_order: 1,
  });

  revalidatePath('/admin/tshirt-builder');
  revalidatePath('/custom-t-shirt');
}

export async function deleteTShirtDesign(id: string) {
  await requireAdminUser();
  const supabase = createAdminClient();
  const { error } = await supabase.from('tshirt_designs').delete().eq('id', id);

  if (error || id) {
    markIdAsDeleted(id);
  }

  revalidatePath('/admin/tshirt-builder');
  revalidatePath('/custom-t-shirt');
}
