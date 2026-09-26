'use server';

import { revalidatePath } from 'next/cache';
import { requireAdminUser } from '@/lib/adminAuth';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  markIdAsDeleted,
  saveTShirtTypeToStore,
  saveTShirtColorToStore,
  savePrintLocationToStore,
  saveTShirtDesignToStore,
} from '@/lib/adminStore';

export async function addTShirtType(formData: FormData) {
  await requireAdminUser();
  const name = String(formData.get('name') || '').trim();
  const description = String(formData.get('description') || '').trim();
  const basePriceRs = parseFloat(String(formData.get('base_price') || '0'));
  const base_price_paisa = Math.round(basePriceRs * 100);

  if (!name) return;

  const newType = {
    id: 'type-' + Date.now(),
    name,
    description: description || null,
    base_price_paisa,
    is_active: true,
    sort_order: 1,
  };

  saveTShirtTypeToStore(newType);

  try {
    const supabase = createAdminClient();
    await supabase.from('tshirt_types').insert({
      id: newType.id,
      name,
      description: description || null,
      base_price_paisa,
      is_active: true,
      sort_order: 1,
    });
  } catch (err) {
    console.error('Supabase addTShirtType fallback:', err);
  }

  revalidatePath('/admin/tshirt-builder');
  revalidatePath('/custom-t-shirt');
}

export async function deleteTShirtType(id: string) {
  await requireAdminUser();
  markIdAsDeleted(id);
  try {
    const supabase = createAdminClient();
    await supabase.from('tshirt_types').delete().eq('id', id);
  } catch (err) {
    console.error('Supabase deleteTShirtType fallback:', err);
  }

  revalidatePath('/admin/tshirt-builder');
  revalidatePath('/custom-t-shirt');
}

export async function addTShirtColor(formData: FormData) {
  await requireAdminUser();
  const name = String(formData.get('name') || '').trim();
  const color_hex = String(formData.get('color_hex') || '#FFFFFF').trim();

  if (!name) return;

  const newColor = {
    id: 'col-' + Date.now(),
    name,
    color_hex,
    is_active: true,
    sort_order: 1,
  };

  saveTShirtColorToStore(newColor);

  try {
    const supabase = createAdminClient();
    await supabase.from('tshirt_colors').insert({
      id: newColor.id,
      name,
      color_hex,
      is_active: true,
      sort_order: 1,
    });
  } catch (err) {
    console.error('Supabase addTShirtColor fallback:', err);
  }

  revalidatePath('/admin/tshirt-builder');
  revalidatePath('/custom-t-shirt');
}

export async function deleteTShirtColor(id: string) {
  await requireAdminUser();
  markIdAsDeleted(id);
  try {
    const supabase = createAdminClient();
    await supabase.from('tshirt_colors').delete().eq('id', id);
  } catch (err) {
    console.error('Supabase deleteTShirtColor fallback:', err);
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

  const newLocation = {
    id: 'loc-' + Date.now(),
    name,
    additional_price_paisa,
    is_active: true,
    sort_order: 1,
  };

  savePrintLocationToStore(newLocation);

  try {
    const supabase = createAdminClient();
    await supabase.from('print_locations').insert({
      id: newLocation.id,
      name,
      additional_price_paisa,
      is_active: true,
      sort_order: 1,
    });
  } catch (err) {
    console.error('Supabase addPrintLocation fallback:', err);
  }

  revalidatePath('/admin/tshirt-builder');
  revalidatePath('/custom-t-shirt');
}

export async function deletePrintLocation(id: string) {
  await requireAdminUser();
  markIdAsDeleted(id);
  try {
    const supabase = createAdminClient();
    await supabase.from('print_locations').delete().eq('id', id);
  } catch (err) {
    console.error('Supabase deletePrintLocation fallback:', err);
  }

  revalidatePath('/admin/tshirt-builder');
  revalidatePath('/custom-t-shirt');
}

export async function addTShirtDesign(formData: FormData) {
  await requireAdminUser();
  const name = String(formData.get('name') || '').trim();
  const theme = String(formData.get('theme') || 'General').trim();
  const imageFile = formData.get('image_file') as File | null;
  let image_url = String(formData.get('image_url') || '').trim();

  if (imageFile && imageFile.size > 0) {
    const buffer = await imageFile.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const mimeType = imageFile.type || 'image/jpeg';
    image_url = `data:${mimeType};base64,${base64}`;
  }

  const priceRs = parseFloat(String(formData.get('price') || '0'));
  const price_paisa = Math.round(priceRs * 100);

  if (!name || !image_url) return;

  const newDesign = {
    id: 'des-' + Date.now(),
    name,
    theme,
    image_url,
    price_paisa,
    is_active: true,
    sort_order: 1,
  };

  saveTShirtDesignToStore(newDesign);

  try {
    const supabase = createAdminClient();
    await supabase.from('tshirt_designs').insert({
      id: newDesign.id,
      name,
      theme,
      image_url,
      price_paisa,
      is_active: true,
      sort_order: 1,
    });
  } catch (err) {
    console.error('Supabase addTShirtDesign fallback:', err);
  }

  revalidatePath('/admin/tshirt-builder');
  revalidatePath('/custom-t-shirt');
}

export async function deleteTShirtDesign(id: string) {
  await requireAdminUser();
  markIdAsDeleted(id);
  try {
    const supabase = createAdminClient();
    await supabase.from('tshirt_designs').delete().eq('id', id);
  } catch (err) {
    console.error('Supabase deleteTShirtDesign fallback:', err);
  }

  revalidatePath('/admin/tshirt-builder');
  revalidatePath('/custom-t-shirt');
}
